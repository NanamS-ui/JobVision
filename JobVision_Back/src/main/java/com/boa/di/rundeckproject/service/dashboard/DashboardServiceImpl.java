package com.boa.di.rundeckproject.service.dashboard;

import com.boa.di.rundeckproject.dto.dashboard.*;
import com.boa.di.rundeckproject.repository.ExecutionMyRepository;
import com.boa.di.rundeckproject.service.GrafanaService;
import com.boa.di.rundeckproject.util.TimeRangeUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {
    private final GrafanaService grafanaService;
    private final String datasourceUid;
    private final ObjectMapper mapper = new ObjectMapper();
    private final ExecutionMyRepository executionMyRepository;

    public DashboardServiceImpl(GrafanaService grafanaService, @Value("${grafana.datasource.uid}") String datasourceUid, ExecutionMyRepository executionMyRepository) {
        this.grafanaService = grafanaService;
        this.datasourceUid = datasourceUid;
        this.executionMyRepository = executionMyRepository;
    }

    @Override
    public DashboardDTO getDashboardDataByDate(String dateDebut, String dateFin) throws Exception {
        DashboardDTO dto = new DashboardDTO();

        // Parse dates en LocalDateTime (assume format "yyyy-MM-dd")
        LocalDateTime fromDateTime = LocalDate.parse(dateDebut).atStartOfDay();
        LocalDateTime toDateTime = LocalDate.parse(dateFin).atTime(LocalTime.MAX);

        // Convertir en epoch seconds
        long fromEpoch = fromDateTime.atZone(ZoneId.systemDefault()).toEpochSecond();
        long toEpoch = toDateTime.atZone(ZoneId.systemDefault()).toEpochSecond();

        String dateFilter = String.format(
                "em.created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d) ",
                fromEpoch, toEpoch
        );

        // 1. Total executions
        String totalExecJson = sendRawQuery(
                "SELECT COUNT(*) FROM execution_my em WHERE " + dateFilter
        );
        dto.setTotalExecutionsToday(parseSingleLong(totalExecJson));

        // 2. Success rate - éviter division par zéro avec NULLIF
        String successRateJson = sendRawQuery(
                "SELECT ROUND(100 * SUM(CASE WHEN em.status = 'succeeded' THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 2) " +
                        "FROM execution_my em WHERE " + dateFilter
        );
        dto.setSuccessRateToday(parseSingleDouble(successRateJson));

        // 3. Avg duration
        String avgDurationJson = sendRawQuery(
                "SELECT ROUND(AVG(em.duration_ms), 2) FROM execution_my em WHERE " + dateFilter
        );
        dto.setAvgDurationThisMonth(parseSingleDouble(avgDurationJson));

        // 4. Active jobs
        String activeJobsJson = sendRawQuery(
                "SELECT COUNT(*) FROM job WHERE execution_enabled = true"
        );
        dto.setActiveJobs((int) parseSingleLong(activeJobsJson));

        // 5. Executions by day
        String executionsByDayJson = sendRawQuery(
                "SELECT DATE(em.created_at) AS day, COUNT(*) FROM execution_my em " +
                        "WHERE " + dateFilter +
                        " GROUP BY day ORDER BY day"
        );
        dto.setExecutionsByDay(parseDailyCount(executionsByDayJson));

        // 6. Execution status distribution
        String execStatusJson = sendRawQuery(
                "SELECT em.status, COUNT(*) FROM execution_my em " +
                        "WHERE " + dateFilter +
                        " GROUP BY em.status"
        );
        dto.setExecutionStatusToday(parseStatusCount(execStatusJson));

        // 7. Top jobs by avg duration
        String topJobsJson = sendRawQuery(
                "SELECT j.name AS job_name, " +
                        "AVG(em.duration_ms) AS avg_duration_ms, " +
                        "COUNT(*) AS executions_count " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "WHERE " + dateFilter +
                        " GROUP BY j.name " +
                        "ORDER BY avg_duration_ms DESC " +
                        "LIMIT 5"
        );
        dto.setStatusDistribution(parseStatusCount(topJobsJson)); // adapte parseStatusDistribution

        // 8. Project distribution
        String projectDistributionJson = sendRawQuery(
                "SELECT p.name, COUNT(*) FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "JOIN project p ON j.id_project = p.id " +
                        "WHERE " + dateFilter +
                        " GROUP BY p.name ORDER BY COUNT(*) DESC LIMIT 10"
        );
        dto.setProjectDistribution(parseProjectCount(projectDistributionJson));

        // 9. Recent executions (pas filtré par date, tu peux ajouter filtre si besoin)
        Pageable top10 = PageRequest.of(0, 10);
        List<RecentExecution> recent = executionMyRepository.findRecentExecutionDTO(top10);
        dto.setRecentExecutions(recent);

        return dto;
    }

    @Override
    public DashboardDTO getDashboardData(String timeRange) throws Exception {
        DashboardDTO dto = new DashboardDTO();

        Pair<Instant, Instant> range = TimeRangeUtils.resolveTimeRange(timeRange);
        long fromEpoch = range.getLeft().getEpochSecond();
        long toEpoch = range.getRight().getEpochSecond();

        // On qualifie bien les colonnes ambiguës avec leur alias 'em' (execution_my)
        String dateFilter = String.format("em.created_at BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)", fromEpoch, toEpoch);

        // 1. Total executions
        String totalExecJson = sendRawQuery(
                "SELECT COUNT(*) FROM execution_my em WHERE " + dateFilter
        );
        dto.setTotalExecutionsToday(parseSingleLong(totalExecJson));

        // 2. Success rate
        String successRateJson = sendRawQuery(
                "SELECT ROUND(100 * SUM(CASE WHEN em.status = 'succeeded' THEN 1 ELSE 0 END)/COUNT(*),2) FROM execution_my em WHERE " + dateFilter
        );
        dto.setSuccessRateToday(parseSingleDouble(successRateJson));

        // 3. Avg duration
        String avgDurationJson = sendRawQuery(
                "SELECT ROUND(AVG(em.duration_ms),2) FROM execution_my em WHERE " + dateFilter
        );
        dto.setAvgDurationThisMonth(parseSingleDouble(avgDurationJson));

        // 4. Active jobs (running)
        String activeJobsJson = sendRawQuery(
                "SELECT COUNT(*) FROM job WHERE execution_enabled = true"
        );
        dto.setActiveJobs((int)parseSingleLong(activeJobsJson));

        // 5. Executions by day
        String executionsByDayJson = sendRawQuery(
                "SELECT DATE(em.created_at), COUNT(*) FROM execution_my em WHERE " + dateFilter + " GROUP BY DATE(em.created_at) ORDER BY DATE(em.created_at)"
        );
        dto.setExecutionsByDay(parseDailyCount(executionsByDayJson));

        // 6. Execution status distribution
        String execStatusJson = sendRawQuery(
                "SELECT em.status, COUNT(*) FROM execution_my em WHERE " + dateFilter + " GROUP BY em.status"
        );
        dto.setExecutionStatusToday(parseStatusCount(execStatusJson));

        // 7. Status distribution all time (no date filter)
        String topJobsJson = sendRawQuery(
                "SELECT j.name AS job_name, " +
                        "AVG(em.duration_ms) AS avg_duration_ms, " +
                        "COUNT(*) AS executions_count " +
                        "FROM execution_my em " +
                        "JOIN job j ON em.id_job = j.id_job " +
                        "WHERE " + dateFilter + " " +
                        "GROUP BY j.name " +
                        "ORDER BY avg_duration_ms DESC " +
                        "LIMIT 5"
        );
        dto.setStatusDistribution(parseStatusCount(topJobsJson));

        // 8. Project distribution
        String projectDistributionJson = sendRawQuery(
                "SELECT p.name, COUNT(*) FROM execution_my em JOIN job j ON em.id_job = j.id_job JOIN project p ON j.id_project = p.id WHERE "
                        + dateFilter
                        + " GROUP BY p.name ORDER BY COUNT(*) DESC LIMIT 10"
        );
        dto.setProjectDistribution(parseProjectCount(projectDistributionJson));

        // 9. Recent executions
        Pageable top10 = PageRequest.of(0, 10);
        List<RecentExecution> recent = executionMyRepository.findRecentExecutionDTO(top10);

        dto.setRecentExecutions(recent);
        return dto;
    }

    @Override
    public DashboardDTO getDashboardDataRecentExecution() throws Exception {
        DashboardDTO dto = new DashboardDTO();
        Pageable top10 = PageRequest.of(0, 10);
        List<RecentExecution> recent = executionMyRepository.findRecentExecutionDTO(top10);

        dto.setRecentExecutions(recent);
        return dto;
    }

    private String sendRawQuery(String sql) {
        String queryJson = String.format(
                "{ \"queries\": [ { \"refId\": \"A\", \"format\": \"table\", \"datasource\": {\"uid\": \"%s\"}, \"rawSql\": \"%s\" } ] }",
                datasourceUid,
                sql.replace("\"", "\\\"")
        );
        return grafanaService.send(queryJson);
    }

    private long parseSingleLong(String json) throws Exception {
        JsonNode node = extractFirstColumn(json);
        return node.get(0).asLong();
    }

    private double parseSingleDouble(String json) throws Exception {
        JsonNode node = extractFirstColumn(json);
        return node.get(0).asDouble();
    }

    private JsonNode extractFirstColumn(String json) throws Exception {
        JsonNode root = mapper.readTree(json);
        return root.path("results").path("A").path("frames").get(0).path("data").path("values").get(0);
    }

    private List<DailyCount> parseDailyCount(String json) throws Exception {
        JsonNode root = mapper.readTree(json);
        JsonNode values = root.path("results").path("A").path("frames").get(0).path("data").path("values");
        JsonNode dates = values.get(0);
        JsonNode counts = values.get(1);

        List<DailyCount> list = new ArrayList<>();
        for (int i = 0; i < dates.size(); i++) {
            list.add(new DailyCount(dates.get(i).asText(), counts.get(i).asLong()));
        }
        return list;
    }

    private List<StatusCount> parseStatusCount(String json) throws Exception {
        JsonNode root = mapper.readTree(json);
        JsonNode values = root.path("results").path("A").path("frames").get(0).path("data").path("values");
        JsonNode statuses = values.get(0);
        JsonNode counts = values.get(1);

        List<StatusCount> list = new ArrayList<>();
        for (int i = 0; i < statuses.size(); i++) {
            list.add(new StatusCount(statuses.get(i).asText(), counts.get(i).asLong()));
        }
        return list;
    }

    private List<ProjectCount> parseProjectCount(String json) throws Exception {
        JsonNode root = mapper.readTree(json);
        JsonNode values = root.path("results").path("A").path("frames").get(0).path("data").path("values");
        JsonNode projects = values.get(0);
        JsonNode counts = values.get(1);

        List<ProjectCount> list = new ArrayList<>();
        for (int i = 0; i < projects.size(); i++) {
            list.add(new ProjectCount(projects.get(i).asText(), counts.get(i).asLong()));
        }
        return list;
    }

}
