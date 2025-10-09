package com.boa.di.rundeckproject.service.history;

import com.boa.di.rundeckproject.dto.HistoriqueExecutionGroupedDTO;
import com.boa.di.rundeckproject.dto.NodeExecutionDTO;
import com.boa.di.rundeckproject.dto.StepLogDTO;
import com.boa.di.rundeckproject.model.ExecutionMy;
import com.boa.di.rundeckproject.model.HistoriqueExecution;
import com.boa.di.rundeckproject.model.Node;
import com.boa.di.rundeckproject.repository.ExecutionMyRepository;
import com.boa.di.rundeckproject.repository.HistoriqueExecutionRepository;
import com.boa.di.rundeckproject.repository.NodeRepository;
import com.boa.di.rundeckproject.service.execution.ExecutionMyService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class HistoriqueExecutionServiceImpl implements HistoriqueExecutionService {
    private final ExecutionMyService executionMyService;
    private final HistoriqueExecutionRepository historiqueExecutionRepository;
    private final ExecutionMyRepository executionMyRepository;
    private final NodeRepository nodeRepository;

    public HistoriqueExecutionServiceImpl(ExecutionMyService executionMyService, HistoriqueExecutionRepository historiqueExecutionRepository, ExecutionMyRepository executionMyRepository, NodeRepository nodeRepository) {
        this.executionMyService = executionMyService;
        this.historiqueExecutionRepository = historiqueExecutionRepository;
        this.executionMyRepository = executionMyRepository;
        this.nodeRepository = nodeRepository;
    }

    @Override
    public List<HistoriqueExecutionGroupedDTO> getLast10HistoriqueGroupedLogs(Long jobId) {
        // Récupérer tous les logs triés décroissants par date d'execution
        List<HistoriqueExecution> logs = historiqueExecutionRepository.findByJobIdOrderByDateExecutionDesc(jobId);

        // Grouper par executionId
        Map<Long, List<HistoriqueExecution>> executionsGrouped = logs.stream()
                .collect(Collectors.groupingBy(HistoriqueExecution::getExecutionIdRundeck));

        // Trier par executionId descendant et limiter à 10
        List<Map.Entry<Long, List<HistoriqueExecution>>> last10Executions = executionsGrouped.entrySet().stream()
                .sorted(Map.Entry.<Long, List<HistoriqueExecution>>comparingByKey().reversed())
                .limit(10)
                .collect(Collectors.toList());

        // Récupérer tous les nodeIds pour chargement batch
        Set<Long> nodeIds = last10Executions.stream()
                .flatMap(entry -> entry.getValue().stream())
                .map(HistoriqueExecution::getNodeId)
                .collect(Collectors.toSet());

        Map<Long, Node> nodeMap = nodeRepository.findAllByIdIn(nodeIds).stream()
                .collect(Collectors.toMap(Node::getId, Function.identity()));

        List<HistoriqueExecutionGroupedDTO> result = new ArrayList<>();

        for (Map.Entry<Long, List<HistoriqueExecution>> entry : last10Executions) {
            Long executionId = entry.getKey();
            List<HistoriqueExecution> execLogs = entry.getValue();

            HistoriqueExecution firstLog = execLogs.get(0);

            // Grouper par nodeId
            Map<Long, List<HistoriqueExecution>> nodesGrouped = execLogs.stream()
                    .collect(Collectors.groupingBy(HistoriqueExecution::getNodeId));

            List<NodeExecutionDTO> nodeExecutions = new ArrayList<>();

            for (Map.Entry<Long, List<HistoriqueExecution>> nodeEntry : nodesGrouped.entrySet()) {
                Long nodeId = nodeEntry.getKey();
                Node node = nodeMap.get(nodeId);
                List<HistoriqueExecution> nodeLogs = nodeEntry.getValue();

                // Grouper par stepCtx
                Map<String, List<HistoriqueExecution>> stepGrouped = nodeLogs.stream()
                        .collect(Collectors.groupingBy(log -> log.getStepCtx() == null ? "over" : log.getStepCtx()));

                List<StepLogDTO> stepLogs = stepGrouped.entrySet().stream()
                        .map(stepEntry -> {
                            List<HistoriqueExecution> stepList = stepEntry.getValue();
                            String allLogs = stepList.stream()
                                    .map(HistoriqueExecution::getLogMessage)
                                    .collect(Collectors.joining("\n"));

                            StepLogDTO dto = new StepLogDTO();
                            String stepCtx = stepEntry.getKey();
                            dto.setStepCtx(stepCtx);
                            dto.setLogMessage(allLogs);
                            dto.setStatus((stepCtx == null || stepCtx.trim().isEmpty()) ? "failed" : stepList.get(0).getStatus());
                            return dto;
                        })
                        .sorted(Comparator.comparing(StepLogDTO::getStepCtx))
                        .collect(Collectors.toList());

                NodeExecutionDTO nodeDTO = new NodeExecutionDTO();
                nodeDTO.setNodeId(nodeId);
                nodeDTO.setNodeName(node != null ? node.getNodename() : "Unknown");
                nodeDTO.setSteps(stepLogs);
                nodeExecutions.add(nodeDTO);
            }

            boolean over = false;
            if (nodeExecutions.size() > 1) {
                List<StepLogDTO> ref = nodeExecutions.get(0).getSteps();
                over = nodeExecutions.stream().allMatch(n -> n.getSteps().equals(ref));
            }

            HistoriqueExecutionGroupedDTO dto = new HistoriqueExecutionGroupedDTO();
            dto.setExecutionId(executionId);
            dto.setDateExecution(firstLog.getDateExecution());
            dto.setDateStarted(firstLog.getDateStarted());
            dto.setDateEnded(firstLog.getDateEnded());
            dto.setDuration(firstLog.getDuration());
            dto.setStatus(firstLog.getStatus());
            dto.setNodes(nodeExecutions);
            dto.setOver(over);

            result.add(dto);
        }

        return result;
    }

    @Override
    public List<HistoriqueExecutionGroupedDTO> searchExecutions(Long idJob, String nodeName, String dateStart, String dateEnd, String status) {
        List<HistoriqueExecution> logs = historiqueExecutionRepository.findByJobIdOrderByDateExecutionDesc(idJob);

        // Préparer les dates pour filtrage
        LocalDate startDate = null, endDate = null;
        if (dateStart != null && !dateStart.isBlank()) {
            startDate = LocalDate.parse(dateStart);
        }
        if (dateEnd != null && !dateEnd.isBlank()) {
            endDate = LocalDate.parse(dateEnd);
        }

        // Rendre les dates final pour usage dans la lambda
        final LocalDate finalStartDate = startDate;
        final LocalDate finalEndDate = endDate;

        // Récupérer tous les nodeId distincts de logs pour un chargement batch des nodes
        Set<Long> nodeIds = logs.stream().map(HistoriqueExecution::getNodeId).collect(Collectors.toSet());
        Map<Long, Node> nodeMap = nodeRepository.findAllByIdIn(nodeIds)
                .stream()
                .collect(Collectors.toMap(Node::getId, Function.identity()));

        // Filtrer en une passe
        List<HistoriqueExecution> filteredLogs = logs.stream()
                .filter(log -> {
                    // Filtre nodeName
                    if (nodeName != null && !nodeName.isBlank()) {
                        Node node = nodeMap.get(log.getNodeId());
                        if (node == null || !nodeName.equalsIgnoreCase(node.getNodename())) return false;
                    }
                    // Filtre status
                    if (status != null && !status.isBlank()) {
                        if (!status.equalsIgnoreCase(log.getStatus())) return false;
                    }
                    // Filtre dateStart
                    if (finalStartDate != null && log.getDateExecution().toLocalDate().isBefore(finalStartDate)) return false;
                    if (finalEndDate != null && log.getDateExecution().toLocalDate().isAfter(finalEndDate)) return false;

                    return true;
                })
                .collect(Collectors.toList());

        // Group by executionId
        Map<Long, List<HistoriqueExecution>> executionsGrouped = filteredLogs.stream()
                .collect(Collectors.groupingBy(HistoriqueExecution::getExecutionIdRundeck));

        return executionsGrouped.entrySet().stream()
                .sorted(Map.Entry.<Long, List<HistoriqueExecution>>comparingByKey().reversed())
                .map(entry -> {
                    Long executionId = entry.getKey();
                    List<HistoriqueExecution> execLogs = entry.getValue();
                    HistoriqueExecution firstLog = execLogs.get(0);

                    // Group by nodeId
                    Map<Long, List<HistoriqueExecution>> nodesGrouped = execLogs.stream()
                            .collect(Collectors.groupingBy(HistoriqueExecution::getNodeId));

                    List<NodeExecutionDTO> nodeExecutions = new ArrayList<>();

                    for (Map.Entry<Long, List<HistoriqueExecution>> nodeEntry : nodesGrouped.entrySet()) {
                        Long nodeId = nodeEntry.getKey();
                        Node node = nodeMap.get(nodeId);

                        List<HistoriqueExecution> nodeLogs = nodeEntry.getValue();

                        Map<String, List<HistoriqueExecution>> stepGrouped = nodeLogs.stream()
                                .collect(Collectors.groupingBy(log -> log.getStepCtx() == null ? "over" : log.getStepCtx()));

                        List<StepLogDTO> stepLogs = stepGrouped.entrySet().stream()
                                .map(stepEntry -> {
                                    List<HistoriqueExecution> stepList = stepEntry.getValue();
                                    String allLogs = stepList.stream()
                                            .map(HistoriqueExecution::getLogMessage)
                                            .collect(Collectors.joining("\n"));

                                    StepLogDTO dto = new StepLogDTO();
                                    String stepCtx = stepEntry.getKey();
                                    dto.setStepCtx(stepCtx);
                                    dto.setLogMessage(allLogs);
                                    dto.setStatus((stepCtx == null || stepCtx.trim().isEmpty()) ? "failed" : stepList.get(0).getStatus());
                                    return dto;
                                })
                                .sorted(Comparator.comparing(StepLogDTO::getStepCtx))
                                .collect(Collectors.toList());

                        NodeExecutionDTO nodeDTO = new NodeExecutionDTO();
                        nodeDTO.setNodeId(nodeId);
                        nodeDTO.setNodeName(node != null ? node.getNodename() : "Unknown");
                        nodeDTO.setSteps(stepLogs);
                        nodeExecutions.add(nodeDTO);
                    }

                    boolean over = false;
                    if (nodeExecutions.size() > 1) {
                        List<StepLogDTO> ref = nodeExecutions.get(0).getSteps();
                        over = nodeExecutions.stream().allMatch(n -> n.getSteps().equals(ref));
                    }

                    HistoriqueExecutionGroupedDTO dto = new HistoriqueExecutionGroupedDTO();
                    dto.setExecutionId(executionId);
                    dto.setDateExecution(firstLog.getDateExecution());
                    dto.setDateStarted(firstLog.getDateStarted());
                    dto.setDateEnded(firstLog.getDateEnded());
                    dto.setDuration(firstLog.getDuration());
                    dto.setStatus(firstLog.getStatus());
                    dto.setNodes(nodeExecutions);
                    dto.setOver(over);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
