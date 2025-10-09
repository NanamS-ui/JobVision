package com.boa.di.rundeckproject.service.service;

import com.boa.di.rundeckproject.class_enum.ServiceStatus;
import com.boa.di.rundeckproject.dto.*;
import com.boa.di.rundeckproject.model.Service;
import com.boa.di.rundeckproject.repository.ServiceRepository;
import com.boa.di.rundeckproject.service.GrafanaService;
import com.boa.di.rundeckproject.util.TimeRangeUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.sql.*;
import java.util.Date;

import static com.boa.di.rundeckproject.util.TimeRangeUtils.resolveTimeRange;
import static com.boa.di.rundeckproject.util.Util.getEnumIgnoreCase;

@org.springframework.stereotype.Service
public class ServiceServiceImpl implements ServiceService{
    private final ServiceRepository serviceRepository;
    private final GrafanaService grafanaService;
    private final String datasourceUid;
    private final DataSource dataSource;

    @Autowired
    public ServiceServiceImpl(ServiceRepository serviceRepository, GrafanaService grafanaService, @Value("${grafana.datasource.uid}") String datasourceUid, DataSource dataSource) {
        this.serviceRepository = serviceRepository;
        this.grafanaService = grafanaService;
        this.datasourceUid = datasourceUid;
        this.dataSource = dataSource;
    }

    @Override
    public Service createService(Service service) {
        return serviceRepository.save(service);
    }

    @Override
    public Optional<Service> getServiceById(Integer id) {
        return serviceRepository.findById(Long.valueOf(id));
    }

    @Override
    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    @Override
    public Service updateService(Integer id, Service updatedService) {
        Long longId = id.longValue();  // Convertir Integer en Long

        return serviceRepository.findById(longId)
                .map(service -> {
                    service.setName(updatedService.getName());
                    service.setDescription(updatedService.getDescription());
                    // Gestion des projets si nécessaire
                    return serviceRepository.save(service);
                })
                .orElseThrow(() -> new RuntimeException("Service non trouvé avec ID : " + id));
    }

    @Override
    public void deleteService(Integer id) {
        if (!serviceRepository.existsById(Long.valueOf(id))) {
            throw new RuntimeException("Service non trouvé avec ID : " + id);
        }
        serviceRepository.deleteById(Long.valueOf(id));
    }

    @Override
    public List<Service> autocompleteByName(String query) {
        return serviceRepository.findServiceByNameContainingIgnoreCase(query);
    }

    @Override
    public String getSuccessRate(String serviceName, String timeRange) {
        Pair<Instant, Instant> range = resolveTimeRange(timeRange);

        String sqlQuery;
        if ("all".equalsIgnoreCase(serviceName)) {
            sqlQuery = String.format(
                    "SELECT date_summary, success_rate_percent FROM service_daily_summary sds " +
                            "JOIN service s ON s.id_service = sds.id_service " +
                            "WHERE date_summary BETWEEN FROM_UNIXTIME(%d / 1000) AND FROM_UNIXTIME(%d / 1000) " +
                            "ORDER BY date_summary",
                    range.getLeft().toEpochMilli(), range.getRight().toEpochMilli()
            );
        } else {
            sqlQuery = String.format(
                    "SELECT date_summary, success_rate_percent FROM service_daily_summary sds " +
                            "JOIN service s ON s.id_service = sds.id_service " +
                            "WHERE s.name = '%s' AND date_summary BETWEEN FROM_UNIXTIME(%d / 1000) AND FROM_UNIXTIME(%d / 1000) " +
                            "ORDER BY date_summary",
                    serviceName, range.getLeft().toEpochMilli(), range.getRight().toEpochMilli()
            );
        }

        String queryJson = String.format(
                "{ \"queries\": [ { \"refId\": \"B\", \"format\": \"table\", \"datasource\": {\"uid\": \"%s\"}, \"rawSql\": \"%s\" } ] }",
                datasourceUid, sqlQuery.replace("\"", "\\\"")
        );

        return grafanaService.send(queryJson);
    }

    @Override
    public String getResponseTimeTrends(String serviceName, String timeRange) {
        Pair<Instant, Instant> range = resolveTimeRange(timeRange);

        String sqlQuery;
        if ("all".equalsIgnoreCase(serviceName)) {
            sqlQuery = String.format(
                    "SELECT date_summary, avg_response_time_ms FROM service_daily_summary sds " +
                            "JOIN service s ON s.id_service = sds.id_service " +
                            "WHERE date_summary BETWEEN FROM_UNIXTIME(%d / 1000) AND FROM_UNIXTIME(%d / 1000) " +
                            "ORDER BY date_summary",
                    range.getLeft().toEpochMilli(), range.getRight().toEpochMilli()
            );
        } else {
            sqlQuery = String.format(
                    "SELECT date_summary, avg_response_time_ms FROM service_daily_summary sds " +
                            "JOIN service s ON s.id_service = sds.id_service " +
                            "WHERE s.name = '%s' AND date_summary BETWEEN FROM_UNIXTIME(%d / 1000) AND FROM_UNIXTIME(%d / 1000) " +
                            "ORDER BY date_summary",
                    serviceName, range.getLeft().toEpochMilli(), range.getRight().toEpochMilli()
            );
        }

        String queryJson = String.format(
                "{ \"queries\": [ { \"refId\": \"A\", \"format\": \"table\", \"datasource\": {\"uid\": \"%s\"}, \"rawSql\": \"%s\" } ] }",
                datasourceUid, sqlQuery.replace("\"", "\\\"")
        );

        return grafanaService.send(queryJson);
    }


    @Override
    public Map<String, Double> parseSuccessRateAsJson(String json) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode root = objectMapper.readTree(json);

        JsonNode valuesNode = root
                .path("results")
                .path("B")
                .path("frames").get(0)
                .path("data")
                .path("values");

        JsonNode datesNode = valuesNode.get(0);       // Milliseconds timestamps
        JsonNode valuesDoubleNode = valuesNode.get(1); // Success rate

        Map<String, Double> result = new LinkedHashMap<>();

        for (int i = 0; i < datesNode.size(); i++) {
            long millis = datesNode.get(i).asLong();
            LocalDate date = Instant.ofEpochMilli(millis)
                    .atZone(ZoneId.of("UTC"))
                    .toLocalDate();

            // Convertir LocalDate en String (ISO format)
            String dateStr = date.toString();  // "yyyy-MM-dd"

            double val = valuesDoubleNode.get(i).asDouble();
            result.put(dateStr, val);
        }

        return result;
    }

    @Override
    public Map<String, Double> parseResponseTimeTrendsAsJson(String json) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode root = objectMapper.readTree(json);

        JsonNode valuesNode = root
                .path("results")
                .path("A")
                .path("frames").get(0)
                .path("data")
                .path("values");

        JsonNode datesNode = valuesNode.get(0);        // Timestamps
        JsonNode valuesDoubleNode = valuesNode.get(1); // avg_response_time_ms

        Map<String, Double> result = new LinkedHashMap<>();

        for (int i = 0; i < datesNode.size(); i++) {
            long millis = datesNode.get(i).asLong();
            LocalDate date = Instant.ofEpochMilli(millis)
                    .atZone(ZoneId.of("UTC"))
                    .toLocalDate();

            String dateStr = date.toString();

            double val = valuesDoubleNode.get(i).asDouble();
            result.put(dateStr, val);
        }

        return result;
    }

    @Override
    public List<ServiceDailySummaryDTO> getSummaries(String serviceName) throws SQLException {
        List<ServiceDailySummaryDTO> result = new ArrayList<>();

        String sql;
        boolean hasServiceNameFilter = !"all".equalsIgnoreCase(serviceName);

        if (hasServiceNameFilter) {
            sql = "SELECT * FROM service_summary_grouped_view " +
                    "WHERE service_name = ? " +
                    "ORDER BY date_summary";
        } else {
            sql = "SELECT * FROM service_summary_grouped_view " +
                    "ORDER BY date_summary";
        }

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            if (hasServiceNameFilter) {
                stmt.setString(1, serviceName);
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ServiceDailySummaryDTO dto = mapRowToDTO(rs);
                    result.add(dto);
                }
            }
        }

        return result;
    }


    private ServiceDailySummaryDTO mapRowToDTO(ResultSet rs) throws SQLException {
        ServiceDailySummaryDTO dto = new ServiceDailySummaryDTO();

        java.sql.Date sqlDate = rs.getDate("date_summary");
        dto.setDateSummary(sqlDate != null ? sqlDate.toLocalDate() : null);

        int totalExec = rs.getInt("total_executions");
        dto.setTotalExecutions(rs.wasNull() ? 0 : totalExec);

        int successExec = rs.getInt("total_successful_executions");
        dto.setSuccessfulExecutions(rs.wasNull() ? 0 : successExec);

        float avgResp = rs.getFloat("avg_response_time_ms");
        dto.setAvgResponseTimeMs(rs.wasNull() ? 0.0f : avgResp);

        float successRate = rs.getFloat("success_rate_percent");
        dto.setSuccessRatePercent(rs.wasNull() ? 0.0f : successRate);

        float errorRate = rs.getFloat("error_rate_percent");
        dto.setErrorRatePercent(rs.wasNull() ? 0.0f : errorRate);

        String statusStr = rs.getString("service_status");
        if (statusStr == null || statusStr.isBlank()) {
            dto.setStatus(ServiceStatus.UNKNOWN);
        } else {
            ServiceStatus status = getEnumIgnoreCase(ServiceStatus.class, statusStr);
            dto.setStatus(status != null ? status : ServiceStatus.UNKNOWN);
        }

        int serviceId = rs.getInt("service_id");
        dto.setServiceId(rs.wasNull() ? null : serviceId);

        String serviceName = rs.getString("service_name");
        dto.setServiceName(serviceName != null ? serviceName : "");

        String serviceDescription = rs.getString("service_description");
        dto.setServiceDescription(serviceDescription != null ? serviceDescription : "");

        String daysReported = rs.getString("days_reported");
        dto.setDaysReported(daysReported != null ? daysReported : "");

        return dto;
    }

    @Override
    public ServiceDetailsDTO buildFromFlatView(List<ServiceFlatViewDTO> flatList) {
        if (flatList == null || flatList.isEmpty()) return null;

        ServiceDTO service = new ServiceDTO();
        service.setId(flatList.get(0).getIdService());
        service.setName(flatList.get(0).getServiceName());
        service.setDescription(flatList.get(0).getServiceDescription());

        Map<Long, ProjectDTO> projectMap = new HashMap<>();

        for (ServiceFlatViewDTO row : flatList) {
            if (row.getProjectId() != null) {
                ProjectDTO project = projectMap.computeIfAbsent(row.getProjectId(), pid -> {
                    ProjectDTO p = new ProjectDTO();
                    p.setId(pid);
                    p.setName(row.getProjectName());
                    p.setDescription(row.getProjectDescription());
                    p.setState(row.getProjectState());
                    p.setDateCreated(row.getProjectDateCreated());
                    p.setLastUpdated(row.getProjectLastUpdated());
                    p.setJobs(new ArrayList<>());
                    return p;
                });

                if (row.getIdJob() != null) {
                    JobDTO job = new JobDTO();
                    job.setId(row.getIdJob());
                    job.setUuid(row.getJobUuid());
                    job.setName(row.getJobName());
                    job.setDescription(row.getJobDescription());
                    job.setExecutionEnabled(row.getExecutionEnabled());
                    job.setScheduleEnabled(row.getScheduleEnabled());
                    job.setCreatedAt(String.valueOf(row.getJobCreatedAt()));
                    job.setUpdatedAt(String.valueOf(row.getJobUpdatedAt()));
                    job.setLogLevel(row.getLogLevel());
                    job.setPriority(row.getPriority());
                    job.setCronExpression(row.getCronExpression());

                    project.getJobs().add(job);
                }
            }
        }

        List<ProjectDTO> projects = new ArrayList<>(projectMap.values());

        ServiceDetailsDTO detailsDTO = new ServiceDetailsDTO();
        detailsDTO.setService(service);
        detailsDTO.setProjects(projects);

        return detailsDTO;
    }

}
