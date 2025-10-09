package com.boa.di.rundeckproject.service.log;

import com.boa.di.rundeckproject.dto.LogCountsProjection;
import com.boa.di.rundeckproject.dto.LogFilterDTO;
import com.boa.di.rundeckproject.dto.LogOutputDTO;
import com.boa.di.rundeckproject.dto.LogOutputViewDTO;
import com.boa.di.rundeckproject.model.LogCountsResponse;
import com.boa.di.rundeckproject.model.LogOutput;
import com.boa.di.rundeckproject.model.Node;
import com.boa.di.rundeckproject.model.Run;
import com.boa.di.rundeckproject.repository.LogOutputRepository;
import com.boa.di.rundeckproject.repository.LogOutputViewRepository;
import com.boa.di.rundeckproject.repository.NodeRepository;
import com.boa.di.rundeckproject.repository.RunRepository;
import com.boa.di.rundeckproject.service.RundeckService;
import com.boa.di.rundeckproject.util.MapperUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LogOutputServiceImpl implements LogOutputService {
    private final RundeckService rundeckService;
    private final NodeRepository nodeRepository;
    private final LogOutputRepository logOutputRepository;
    private final LogOutputViewRepository logOutputViewRepository;
    private final RunRepository runRepository;

    @Autowired
    public LogOutputServiceImpl(RundeckService rundeckService, NodeRepository nodeRepository, LogOutputRepository logOutputRepository, LogOutputViewRepository logOutputViewRepository, RunRepository runRepository) {
        this.rundeckService = rundeckService;
        this.nodeRepository = nodeRepository;
        this.logOutputRepository = logOutputRepository;
        this.logOutputViewRepository = logOutputViewRepository;
        this.runRepository = runRepository;
    }

    @Override
    public List<LogOutputDTO> getLogsByNodeNameDTO(String nodeName) {
        Node node = nodeRepository.findNodeByNodename(nodeName);
        if (node == null) {
            throw new IllegalArgumentException("Node non trouvé");
        }

        List<LogOutput> logs = logOutputRepository.findByNode(node);

        return logs.stream()
                .map(this::toLogOutputDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LogOutputDTO> getLogsByIdNodeDTO(String idNode) {
        Long nodeId = Long.parseLong(idNode);
        Node node = nodeRepository.findNodeById(nodeId);
        if (node == null) {
            throw new IllegalArgumentException("Node non trouvé");
        }

        List<LogOutput> logs = logOutputRepository.findByNode(node);

        return logs.stream()
                .map(this::toLogOutputDTO)
                .collect(Collectors.toList());
    }

    private LogOutputDTO toLogOutputDTO(LogOutput log) {
        LogOutputDTO dto = new LogOutputDTO();

        dto.setIdLogOutput(log.getIdLogOutput());
        dto.setLogMessage(log.getLogMessage());
        dto.setLogLevel(log.getLogLevel());
        dto.setStepCtx(log.getStepCtx());
        dto.setStepNumber(log.getStepNumber());

        dto.setCreatedAt(log.getCreatedAt() != null ? log.getCreatedAt().toString() : null);
        dto.setAbsoluteTime(log.getAbsoluteTime() != null ? log.getAbsoluteTime().toString() : null);
        dto.setLocalTime(log.getLocalTime() != null ? log.getLocalTime().toString() : null);
        dto.setUser(log.getUser());

        if (log.getNode() != null) {
            dto.setNodeId(log.getNode().getIdNode());
            dto.setNodeName(log.getNode().getNodename());
        }

        if (log.getIdExecution() != null) {
            dto.setExecutionId(log.getIdExecution().getIdExecution());
            dto.setExecutionIdRundeck(log.getIdExecution().getExecutionIdRundeck());
            dto.setStatus(log.getIdExecution().getStatus());
        }

        return dto;
    }

    @Override
    public List<LogOutputDTO> getLogsByNodeNameAndExecutionId(String nodeName, Long executionId, String stepCtx) {
        List<LogOutput> logs = logOutputRepository.findByNodeNameAndExecutionIdAndStepCtx(nodeName, executionId, stepCtx);

        return logs.stream().map(MapperUtil::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<LogOutputDTO> getLogsByExecutionId(Long executionId) {
        List<LogOutput> logs = logOutputRepository.findByExecutionId(executionId);
        return logs.stream().map(MapperUtil::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<LogOutputDTO> getLogsByExecutionIdRun(Long executionId) {
        Run run = runRepository.findByExecutionId(executionId);
        List<LogOutput> logs = List.of();

        if (run != null) {
            logs = logOutputRepository.findByExecutionId(executionId);
            run.setStatus("COMPLETED");
            runRepository.save(run);
        }
        return logs.stream().map(MapperUtil::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<LogOutputViewDTO> getRecentLogs() {
        List<Map<String, Object>> rawLogs = logOutputViewRepository.findRecentLogsRaw();

        List<LogOutputViewDTO> result = new ArrayList<>();

        for (Map<String, Object> row : rawLogs) {
            LogOutputViewDTO dto = new LogOutputViewDTO();
            dto.setIdLogOutput(((Number) row.get("idLogOutput")).longValue());
            dto.setLogMessage((String) row.get("logMessage"));
            dto.setLogLevel((String) row.get("logLevel"));
            dto.setStepCtx((String) row.get("stepCtx"));
            dto.setStepNumber((Integer) row.get("stepNumber"));
            dto.setCreatedAt(row.get("createdAt") != null ? ((Timestamp) row.get("createdAt")).toLocalDateTime() : null);
            dto.setAbsoluteTime(row.get("absoluteTime") != null ? ((Timestamp) row.get("absoluteTime")).toLocalDateTime() : null);
            dto.setLocalTime(row.get("localTime") != null ? ((Time) row.get("localTime")).toLocalTime() : null);
            dto.setIdExecution(row.get("idExecution") != null ? ((Number) row.get("idExecution")).longValue() : null);
            dto.setUser((String) row.get("user"));
            dto.setIdNode(((Number) row.get("idNode")).longValue());
            dto.setNodename((String) row.get("nodename"));
            dto.setHostname((String) row.get("hostname"));
            dto.setIdJob(row.get("idJob") != null ? ((Number) row.get("idJob")).longValue() : null);
            dto.setJobName((String) row.get("jobName"));
            dto.setJobDescription((String) row.get("jobDescription"));
            result.add(dto);
        }

        return result;
    }

    @Override
    public List<LogOutputViewDTO> getFilteredLogs(LogFilterDTO filter) {
        List<Map<String, Object>> rawLogs = logOutputViewRepository.searchLogsRaw(
                filter.getLogLevel(),
                filter.getUser(),
                filter.getJobName(),
                filter.getHostname(),
                filter.getStartDate() != null ? Timestamp.valueOf(filter.getStartDate()) : null,
                filter.getEndDate() != null ? Timestamp.valueOf(filter.getEndDate()) : null
        );

        List<LogOutputViewDTO> result = new ArrayList<>();

        for (Map<String, Object> row : rawLogs) {
            LogOutputViewDTO dto = new LogOutputViewDTO();
            dto.setIdLogOutput(((Number) row.get("idLogOutput")).longValue());
            dto.setLogMessage((String) row.get("logMessage"));
            dto.setLogLevel((String) row.get("logLevel"));
            dto.setStepCtx((String) row.get("stepCtx"));
            dto.setStepNumber((Integer) row.get("stepNumber"));
            dto.setCreatedAt(row.get("createdAt") != null ? ((Timestamp) row.get("createdAt")).toLocalDateTime() : null);
            dto.setAbsoluteTime(row.get("absoluteTime") != null ? ((Timestamp) row.get("absoluteTime")).toLocalDateTime() : null);
            dto.setLocalTime(row.get("localTime") != null ? ((Time) row.get("localTime")).toLocalTime() : null);
            dto.setIdExecution(row.get("idExecution") != null ? ((Number) row.get("idExecution")).longValue() : null);
            dto.setUser((String) row.get("user"));
            dto.setIdNode(((Number) row.get("idNode")).longValue());
            dto.setNodename((String) row.get("nodename"));
            dto.setHostname((String) row.get("hostname"));
            dto.setIdJob(row.get("idJob") != null ? ((Number) row.get("idJob")).longValue() : null);
            dto.setJobName((String) row.get("jobName"));
            dto.setJobDescription((String) row.get("jobDescription"));
            result.add(dto);
        }

        return result;
    }

    @Override
    public LogCountsResponse getLogCounts() {
        LogCountsProjection projection = logOutputRepository.getLogCounts();

        return new LogCountsResponse(
                projection.getTotalLogs(),
                projection.getNormalCount(),
                projection.getErrorCount(),
                projection.getWarnCount()
        );
    }
}
