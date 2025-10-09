package com.boa.di.rundeckproject.service.job;

import com.boa.di.rundeckproject.dto.job.*;
import com.boa.di.rundeckproject.service.GrafanaService;
import com.boa.di.rundeckproject.util.TimeRangeUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
public class JobStatisticsService {

    private final GrafanaService grafanaService;
    private final String datasourceUid;

    @Autowired
    public JobStatisticsService(GrafanaService grafanaService, @Value("${grafana.datasource.uid}") String datasourceUid) {
        this.grafanaService = grafanaService;
        this.datasourceUid = datasourceUid;
    }

    public GlobalStatsDTO getGlobalDashboard(String serviceId, String timeRange) throws Exception {
        boolean isAll = serviceId == null || serviceId.equalsIgnoreCase("all");
        Pair<Instant, Instant> range = TimeRangeUtils.resolveTimeRange(timeRange);
        Instant from = range.getLeft();
        Instant to = range.getRight();

        GlobalStatsDTO dto = new GlobalStatsDTO();

        String baseFilter = "em.created_at BETWEEN FROM_UNIXTIME(" + from.getEpochSecond() + ") AND FROM_UNIXTIME(" + to.getEpochSecond() + ") ";
        if (!isAll) {
            baseFilter += "AND p.id_service = " + Integer.parseInt(serviceId);
        }

        // 1. Overview
        String summaryJson = sendRawQuery(
                "SELECT COUNT(*), " +
                        "SUM(CASE WHEN em.status = 'succeeded' THEN 1 ELSE 0 END), " +
                        "SUM(CASE WHEN em.status = 'failed' THEN 1 ELSE 0 END), " +
                        "SUM(CASE WHEN em.status = 'running' THEN 1 ELSE 0 END), " +
                        "AVG(em.duration_ms) " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "JOIN project p ON j.id_project = p.id " +
                        "WHERE " + baseFilter + "AND j.is_deleted = false"
        );
        setSummaryFromJson(dto, summaryJson);

        // 2. Daily executions
        String dailyJson = sendRawQuery(
                "SELECT DATE(em.created_at), COUNT(*) " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "JOIN project p ON j.id_project = p.id " +
                        "WHERE " + baseFilter + "AND j.is_deleted = false" +
                        " GROUP BY DATE(em.created_at)"
        );
        dto.setDailyExecutions(parseDailyExecution(dailyJson));

        // 3. Daily durations
        String durationJson = sendRawQuery(
                "SELECT DATE(em.created_at), ROUND(AVG(em.duration_ms), 2) " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "JOIN project p ON j.id_project = p.id " +
                        "WHERE " + baseFilter + "AND j.is_deleted = false"+
                        " GROUP BY DATE(em.created_at)"
        );
        dto.setDailyAverageDurations(parseDailyDuration(durationJson));

        // 4. Status distribution
        String statusJson = sendRawQuery(
                "SELECT em.status, COUNT(*) " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "JOIN project p ON j.id_project = p.id " +
                        "WHERE " + baseFilter + "AND j.is_deleted = false"+
                        " GROUP BY em.status"
        );
        dto.setStatusDistribution(parseStatusDistribution(statusJson));

        // 5. Project distribution
        String projectJson = sendRawQuery(
                "SELECT p.name, COUNT(*) " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "JOIN project p ON j.id_project = p.id " +
                        "WHERE " + baseFilter + "AND j.is_deleted = false"+
                        " GROUP BY p.name ORDER BY COUNT(*) DESC LIMIT 10"
        );
        dto.setProjectDistribution(parseProjectDistribution(projectJson));

        return dto;
    }

    public GlobalStatsDTO getGlobalDashboardByDate(String serviceId, String dateDebut, String dateFin) throws Exception {
        boolean isAll = serviceId == null || serviceId.equalsIgnoreCase("all");

        ZoneId zone = ZoneId.systemDefault();
        Instant from = null;
        Instant to = null;

        if (dateDebut != null && !dateDebut.isBlank()) {
            LocalDate startDate = LocalDate.parse(dateDebut);
            from = startDate.atStartOfDay(zone).toInstant();
        }

        if (dateFin != null && !dateFin.isBlank()) {
            LocalDate endDate = LocalDate.parse(dateFin);
            to = endDate.plusDays(1).atStartOfDay(zone).toInstant(); // pour inclure toute la journée
        }

        GlobalStatsDTO dto = new GlobalStatsDTO();

        // Construction dynamique du WHERE
        List<String> filters = new ArrayList<>();
        if (from != null) filters.add("em.created_at >= FROM_UNIXTIME(" + from.getEpochSecond() + ")");
        if (to != null) filters.add("em.created_at <= FROM_UNIXTIME(" + to.getEpochSecond() + ")");
        if (!isAll) filters.add("p.id_service = " + Integer.parseInt(serviceId));

        String baseFilter = String.join(" AND ", filters);

        // Clause WHERE (vide autorisé)
        String whereClause = baseFilter.isEmpty() ? "" : " WHERE " + baseFilter + " AND j.is_deleted = false";

        // 1. Overview
        String summaryJson = sendRawQuery(
                "SELECT COUNT(*), " +
                        "SUM(CASE WHEN em.status = 'succeeded' THEN 1 ELSE 0 END), " +
                        "SUM(CASE WHEN em.status = 'failed' THEN 1 ELSE 0 END), " +
                        "SUM(CASE WHEN em.status = 'running' THEN 1 ELSE 0 END), " +
                        "AVG(em.duration_ms) " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "JOIN project p ON j.id_project = p.id " +
                        whereClause
        );
        setSummaryFromJson(dto, summaryJson);

        // 2. Daily executions
        String dailyJson = sendRawQuery(
                "SELECT DATE(em.created_at), COUNT(*) " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "JOIN project p ON j.id_project = p.id " +
                        whereClause +
                        " GROUP BY DATE(em.created_at)"
        );
        dto.setDailyExecutions(parseDailyExecution(dailyJson));

        // 3. Daily durations
        String durationJson = sendRawQuery(
                "SELECT DATE(em.created_at), ROUND(AVG(em.duration_ms), 2) " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "JOIN project p ON j.id_project = p.id " +
                        whereClause +
                        " GROUP BY DATE(em.created_at)"
        );
        dto.setDailyAverageDurations(parseDailyDuration(durationJson));

        // 4. Status distribution
        String statusJson = sendRawQuery(
                "SELECT em.status, COUNT(*) " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "JOIN project p ON j.id_project = p.id " +
                        whereClause +
                        " GROUP BY em.status"
        );
        dto.setStatusDistribution(parseStatusDistribution(statusJson));

        // 5. Project distribution
        String projectJson = sendRawQuery(
                "SELECT p.name, COUNT(*) " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "JOIN project p ON j.id_project = p.id " +
                        whereClause +
                        " GROUP BY p.name ORDER BY COUNT(*) DESC LIMIT 10"
        );
        dto.setProjectDistribution(parseProjectDistribution(projectJson));

        return dto;
    }

    public StatisticsByJobDTO getStatisticsByJob(Long jobId, String timeRange) throws Exception {
        Pair<Instant, Instant> range = TimeRangeUtils.resolveTimeRange(timeRange);
        long fromSec = range.getLeft().getEpochSecond();
        long toSec = range.getRight().getEpochSecond();

        StatisticsByJobDTO dto = new StatisticsByJobDTO();

        dto.setTotalExecutions(parseSingleLongResult(sendQuery(
                "SELECT COUNT(*) AS count FROM execution_my WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)",
                jobId, fromSec, toSec)));

        dto.setSuccessRate(parseSingleDoubleResult(sendQuery(
                "SELECT ROUND(100 * SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) / COUNT(*), 2) " +
                        "FROM execution_my WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)",
                jobId, fromSec, toSec)));

        dto.setFailureRate(parseSingleDoubleResult(sendQuery(
                "SELECT ROUND(100 * SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) / COUNT(*), 2) " +
                        "FROM execution_my WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)",
                jobId, fromSec, toSec)));

        dto.setAverageDuration(parseSingleDoubleResult(sendQuery(
                "SELECT ROUND(AVG(duration_ms), 2) FROM execution_my " +
                        "WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)",
                jobId, fromSec, toSec)));

        dto.setLastExecutionDate(parseSingleDateResult(sendQuery(
                "SELECT MAX(created_at) FROM execution_my WHERE id_job = %d",
                jobId)));

        dto.setDailyExecutions(parseDailyExecution(sendQuery(
                "SELECT DATE(created_at), COUNT(*) FROM execution_my " +
                        "WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d) " +
                        "GROUP BY DATE(created_at) ORDER BY DATE(created_at)",
                jobId, fromSec, toSec)));

        dto.setStatusDistribution(parseStatusDistribution(sendQuery(
                "SELECT status, COUNT(*) FROM execution_my " +
                        "WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d) " +
                        "GROUP BY status",
                jobId, fromSec, toSec)));

        dto.setDailyAverageDuration(parseDailyDuration(sendQuery(
                "SELECT DATE(created_at), ROUND(AVG(duration_ms), 2) FROM execution_my " +
                        "WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d) " +
                        "GROUP BY DATE(created_at)",
                jobId, fromSec, toSec)));

        dto.setHourlyActivity(parseHourlyActivity(sendQuery(
                "SELECT HOUR(created_at), COUNT(*) FROM execution_my " +
                        "WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d) " +
                        "GROUP BY HOUR(created_at)",
                jobId, fromSec, toSec)));

        return dto;
    }

    public StatisticsByJobDTO getStatisticsByJobByDate(Long jobId, String dateDebut, String dateFin) throws Exception {
        ZoneId zone = ZoneId.systemDefault();
        Instant from = null;
        Instant to = null;

        if (dateDebut != null && !dateDebut.isBlank()) {
            from = LocalDate.parse(dateDebut).atStartOfDay(zone).toInstant();
        }
        if (dateFin != null && !dateFin.isBlank()) {
            to = LocalDate.parse(dateFin).plusDays(1).atStartOfDay(zone).toInstant(); // inclure toute la journée
        }

        long fromSec = (from != null) ? from.getEpochSecond() : 0;
        long toSec = (to != null) ? to.getEpochSecond() : Instant.now().getEpochSecond();

        StatisticsByJobDTO dto = new StatisticsByJobDTO();

        // Total executions
        dto.setTotalExecutions(parseSingleLongResult(sendQuery(
                "SELECT COUNT(*) AS count FROM execution_my WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)",
                jobId, fromSec, toSec)));

        // Success rate
        dto.setSuccessRate(parseSingleDoubleResult(sendQuery(
                "SELECT ROUND(100 * SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) / COUNT(*), 2) " +
                        "FROM execution_my WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)",
                jobId, fromSec, toSec)));

        // Failure rate
        dto.setFailureRate(parseSingleDoubleResult(sendQuery(
                "SELECT ROUND(100 * SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) / COUNT(*), 2) " +
                        "FROM execution_my WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)",
                jobId, fromSec, toSec)));

        // Average duration
        dto.setAverageDuration(parseSingleDoubleResult(sendQuery(
                "SELECT ROUND(AVG(duration_ms), 2) FROM execution_my " +
                        "WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)",
                jobId, fromSec, toSec)));

        // Last execution (not time-ranged)
        dto.setLastExecutionDate(parseSingleDateResult(sendQuery(
                "SELECT MAX(created_at) FROM execution_my WHERE id_job = %d",
                jobId)));

        // Daily executions
        dto.setDailyExecutions(parseDailyExecution(sendQuery(
                "SELECT DATE(created_at), COUNT(*) FROM execution_my " +
                        "WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d) " +
                        "GROUP BY DATE(created_at) ORDER BY DATE(created_at)",
                jobId, fromSec, toSec)));

        // Status distribution
        dto.setStatusDistribution(parseStatusDistribution(sendQuery(
                "SELECT status, COUNT(*) FROM execution_my " +
                        "WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d) " +
                        "GROUP BY status",
                jobId, fromSec, toSec)));

        // Daily average duration
        dto.setDailyAverageDuration(parseDailyDuration(sendQuery(
                "SELECT DATE(created_at), ROUND(AVG(duration_ms), 2) FROM execution_my " +
                        "WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d) " +
                        "GROUP BY DATE(created_at)",
                jobId, fromSec, toSec)));

        // Hourly activity
        dto.setHourlyActivity(parseHourlyActivity(sendQuery(
                "SELECT HOUR(created_at), COUNT(*) FROM execution_my " +
                        "WHERE id_job = %d AND created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d) " +
                        "GROUP BY HOUR(created_at)",
                jobId, fromSec, toSec)));

        return dto;
    }

    private String sendQuery(String sqlTemplate, Object... args) {
        String sql = String.format(sqlTemplate, args);
        String queryJson = String.format(
                "{ \"queries\": [ { \"refId\": \"B\", \"format\": \"table\", \"datasource\": {\"uid\": \"%s\"}, \"rawSql\": \"%s\" } ] }",
                datasourceUid,
                sql.replace("\"", "\\\"")  // échappe les guillemets
        );
        return grafanaService.send(queryJson);
    }

    private long parseSingleLongResult(String json) throws Exception {
        JsonNode node = extractFirstColumn(json);
        return node.get(0).asLong();
    }

    private double parseSingleDoubleResult(String json) throws Exception {
        JsonNode node = extractFirstColumn(json);
        return node.get(0).asDouble();
    }

    private String parseSingleDateResult(String json) throws Exception {
        JsonNode node = extractFirstColumn(json);
        long millis = node.get(0).asLong();
        return Instant.ofEpochMilli(millis).atZone(ZoneId.systemDefault()).toLocalDateTime().toString();
    }

    private JsonNode extractFirstColumn(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);
        return root.path("results").path("B").path("frames").get(0).path("data").path("values").get(0);
    }

    private List<DailyExecutionDTO> parseDailyExecution(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);
        JsonNode values = root.path("results").path("B").path("frames").get(0).path("data").path("values");
        JsonNode dateNode = values.get(0);
        JsonNode countNode = values.get(1);

        List<DailyExecutionDTO> result = new ArrayList<>();
        for (int i = 0; i < dateNode.size(); i++) {
            LocalDate date = Instant.ofEpochMilli(dateNode.get(i).asLong()).atZone(ZoneId.of("UTC")).toLocalDate();
            long count = countNode.get(i).asLong();
            result.add(new DailyExecutionDTO(date.toString(), count));
        }
        return result;
    }

    private List<StatusDistributionDTO> parseStatusDistribution(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);
        JsonNode values = root.path("results").path("B").path("frames").get(0).path("data").path("values");
        JsonNode statusNode = values.get(0);
        JsonNode countNode = values.get(1);

        List<StatusDistributionDTO> result = new ArrayList<>();
        for (int i = 0; i < statusNode.size(); i++) {
            result.add(new StatusDistributionDTO(statusNode.get(i).asText(), countNode.get(i).asLong()));
        }
        return result;
    }

    private List<DailyDurationDTO> parseDailyDuration(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);
        JsonNode values = root.path("results").path("B").path("frames").get(0).path("data").path("values");
        JsonNode dateNode = values.get(0);
        JsonNode durNode = values.get(1);

        List<DailyDurationDTO> result = new ArrayList<>();
        for (int i = 0; i < dateNode.size(); i++) {
            LocalDate date = Instant.ofEpochMilli(dateNode.get(i).asLong()).atZone(ZoneId.of("UTC")).toLocalDate();
            result.add(new DailyDurationDTO(date.toString(), durNode.get(i).asDouble()));
        }
        return result;
    }

    private List<HourlyActivityDTO> parseHourlyActivity(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);
        JsonNode values = root.path("results").path("B").path("frames").get(0).path("data").path("values");
        JsonNode hourNode = values.get(0);
        JsonNode countNode = values.get(1);

        List<HourlyActivityDTO> result = new ArrayList<>();
        for (int i = 0; i < hourNode.size(); i++) {
            result.add(new HourlyActivityDTO(hourNode.get(i).asInt(), countNode.get(i).asLong()));
        }
        return result;
    }

    private List<JsonNode> extractColumns(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);

        JsonNode valuesNode = root.path("results")
                .path("B")
                .path("frames")
                .get(0)
                .path("data")
                .path("values");

        List<JsonNode> columns = new ArrayList<>();
        if (valuesNode.isArray()) {
            for (JsonNode col : valuesNode) {
                columns.add(col);
            }
        }
        return columns;
    }

    private void setSummaryFromJson(GlobalStatsDTO dto, String json) throws Exception {
        List<JsonNode> columns = extractColumns(json);

        dto.setTotalExecutions(columns.get(0).get(0).asLong());
        dto.setTotalSucceeded(columns.get(1).get(0).asLong());
        dto.setTotalFailed(columns.get(2).get(0).asLong());
        dto.setTotalRunning(columns.get(3).get(0).asLong());
        dto.setAverageExecutionTime(TimeRangeUtils.millisToSeconds(columns.get(4).get(0).asLong()));
    }

    private List<ProjectDistributionDTO> parseProjectDistribution(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);
        JsonNode values = root.path("results").path("B").path("frames").get(0).path("data").path("values");
        JsonNode projectNameNode = values.get(0);
        JsonNode countNode = values.get(1);

        List<ProjectDistributionDTO> result = new ArrayList<>();
        for (int i = 0; i < projectNameNode.size(); i++) {
            result.add(new ProjectDistributionDTO(projectNameNode.get(i).asText(), countNode.get(i).asLong()));
        }
        return result;
    }

    private String sendRawQuery(String sql) {
        String queryJson = String.format(
                "{ \"queries\": [ { \"refId\": \"B\", \"format\": \"table\", \"datasource\": {\"uid\": \"%s\"}, \"rawSql\": \"%s\" } ] }",
                datasourceUid, sql.replace("\"", "\\\"")
        );
        return grafanaService.send(queryJson);
    }
}
