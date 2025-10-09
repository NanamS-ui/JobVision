package com.boa.di.rundeckproject.service.execution;

import com.boa.di.rundeckproject.dto.ExecutionMyDTO;
import com.boa.di.rundeckproject.dto.JobDTO;
import com.boa.di.rundeckproject.model.ExecutionMy;
import com.boa.di.rundeckproject.model.ExecutionStateResponse;
import com.boa.di.rundeckproject.model.Job;
import com.boa.di.rundeckproject.repository.ExecutionMyRepository;
import com.boa.di.rundeckproject.service.RundeckService;
import com.boa.di.rundeckproject.service.job.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExecutionMyServiceImpl implements ExecutionMyService {
    private final ExecutionMyRepository executionMyRepository;
    private final JobService jobService;
    private final RundeckService rundeckService;

    @Autowired
    public ExecutionMyServiceImpl(ExecutionMyRepository executionMyRepository, JobService jobService, RundeckService rundeckService) {
        this.executionMyRepository = executionMyRepository;
        this.jobService = jobService;
        this.rundeckService = rundeckService;
    }

    @Override
    public List<ExecutionMyDTO> getAllExecutions() {
        return executionMyRepository.findAll()
                .stream()
                .map(this::toExecutionMyDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExecutionMyDTO> getExecutionsByJobId(Long jobId) {
        return executionMyRepository.getExecutionsByJobId(jobId)
                .stream()
                .map(this::toExecutionMyDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ExecutionMyDTO toExecutionMyDTO(ExecutionMy execution) {
        ExecutionMyDTO dto = new ExecutionMyDTO();
        dto.setIdExecution(execution.getIdExecution());
        dto.setExecutionIdRundeck(execution.getExecutionIdRundeck());
        dto.setStatus(execution.getStatus());
        dto.setDescription(execution.getDescription());
        dto.setDateStarted(execution.getDateStarted() != null ? execution.getDateStarted().toString() : null);
        dto.setDateEnded(execution.getDateEnded() != null ? execution.getDateEnded().toString() : null);
        dto.setArg(execution.getArg());
        dto.setCreatedAt(execution.getCreatedAt() != null ? execution.getCreatedAt().toString() : null);
        dto.setDurationMs(execution.getDurationMs());
        dto.setUsername(execution.getUsername());

        if (execution.getProject() != null) {
            dto.setProjectId(execution.getProject().getId());
            dto.setProjectName(execution.getProject().getName()); // suppose que le champ "name" existe
        }

        if (execution.getJob() != null) {
            Job job = execution.getJob();
            JobDTO jobDTO = jobService.getJobDetails(job);

            dto.setJob(jobDTO);
        }

        return dto;
    }

    @Override
    public double getExecutionProgressFromState(long executionId) {
        String path = "/execution/" + executionId + "/state";

        ResponseEntity<ExecutionStateResponse> response =
                rundeckService.get(path, ExecutionStateResponse.class);

        ExecutionStateResponse state = response.getBody();

        if (state == null || state.getSteps() == null || state.getSteps().isEmpty()) {
            return 0.0;
        }

        long totalSteps = 0;
        long finishedSteps = 0;

        for (ExecutionStateResponse.Step step : state.getSteps()) {
            if (step.getNodeStates() == null || step.getNodeStates().isEmpty()) continue;

            for (ExecutionStateResponse.Step.NodeState nodeState : step.getNodeStates().values()) {
                totalSteps++;
                String execState = nodeState.getExecutionState();
                if (execState != null &&
                        List.of("SUCCEEDED", "FAILED", "ABORTED", "SKIPPED").contains(execState.toUpperCase())) {
                    finishedSteps++;
                }
            }
        }

        return totalSteps == 0 ? 0.0 : (double) finishedSteps / totalSteps * 100.0;
    }

    @Override
    public ExecutionStateResponse getExecutionProgressFromStateDetail(long executionId) {
        String path = "/execution/" + executionId + "/state";

        ResponseEntity<ExecutionStateResponse> response =
                rundeckService.get(path, ExecutionStateResponse.class);

        ExecutionStateResponse state = response.getBody();

        if (state == null || state.getSteps() == null || state.getSteps().isEmpty()) {
            if (state == null) {
                state = new ExecutionStateResponse(); // pour éviter NullPointer
            }
            state.setProgress(0.0);
            return state;
        }

        long totalSteps = 0;
        long finishedSteps = 0;

        for (ExecutionStateResponse.Step step : state.getSteps()) {
            if (step.getNodeStates() == null || step.getNodeStates().isEmpty()) continue;

            for (ExecutionStateResponse.Step.NodeState nodeState : step.getNodeStates().values()) {
                totalSteps++;
                String execState = nodeState.getExecutionState();
                if (execState != null &&
                        List.of("SUCCEEDED", "FAILED", "ABORTED", "SKIPPED").contains(execState.toUpperCase())) {
                    finishedSteps++;
                }
            }
        }

        double progress = totalSteps == 0 ? 0.0 : (double) finishedSteps / totalSteps * 100.0;
        state.setProgress(progress);
        return state;
    }

    @Override
    public Map<String, Double> getExecutionProgressPerNode(long executionId) {
        String path = "/execution/" + executionId + "/state";

        ResponseEntity<ExecutionStateResponse> response =
                rundeckService.get(path, ExecutionStateResponse.class);

        ExecutionStateResponse state = response.getBody();

        if (state == null || state.getSteps() == null || state.getSteps().isEmpty()) {
            return Collections.emptyMap();
        }

        // Map to count [finished, total] steps per node
        Map<String, int[]> nodeProgressMap = new HashMap<>();

        for (ExecutionStateResponse.Step step : state.getSteps()) {
            if (step.getNodeStates() == null || step.getNodeStates().isEmpty()) continue;

            for (Map.Entry<String, ExecutionStateResponse.Step.NodeState> entry : step.getNodeStates().entrySet()) {
                String nodeName = entry.getKey();
                ExecutionStateResponse.Step.NodeState nodeState = entry.getValue();

                nodeProgressMap.putIfAbsent(nodeName, new int[]{0, 0});
                int[] counts = nodeProgressMap.get(nodeName);
                counts[1]++; // total steps for this node++

                String execState = nodeState.getExecutionState();
                if (execState != null &&
                        List.of("SUCCEEDED", "FAILED", "ABORTED", "SKIPPED").contains(execState.toUpperCase())) {
                    counts[0]++; // finished steps++
                }
            }
        }

        // Compute progress in %
        Map<String, Double> progressPerNode = new HashMap<>();
        for (Map.Entry<String, int[]> entry : nodeProgressMap.entrySet()) {
            int finished = entry.getValue()[0];
            int total = entry.getValue()[1];
            double percent = total == 0 ? 0.0 : (double) finished / total * 100.0;
            progressPerNode.put(entry.getKey(), percent);
        }

        // Inject progress into NodeState objects
        for (ExecutionStateResponse.Step step : state.getSteps()) {
            if (step.getNodeStates() == null || step.getNodeStates().isEmpty()) continue;

            for (Map.Entry<String, ExecutionStateResponse.Step.NodeState> entry : step.getNodeStates().entrySet()) {
                String nodeName = entry.getKey();
                ExecutionStateResponse.Step.NodeState nodeState = entry.getValue();

                Double progress = progressPerNode.get(nodeName);
                if (progress != null) {
                    nodeState.setProgressStatePerNode(progress);
                }
            }
        }

        return progressPerNode;
    }

    @Override
    public Long getLastExecutionIdByJobUuid(String jobUuid) {
        try {
            String path = "/job/" + jobUuid + "/executions?max=1";

            ResponseEntity<Map> response = rundeckService.get(path, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                Object executionsObj = response.getBody().get("executions");

                if (executionsObj instanceof List executions && !executions.isEmpty()) {
                    Object firstExecution = executions.get(0);

                    if (firstExecution instanceof Map executionMap) {
                        Object id = executionMap.get("id");
                        if (id instanceof Number) {
                            return ((Number) id).longValue();
                        }
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération du dernier executionId : " + e.getMessage());
        }

        return null;
    }

    @Override
    public Long getLastExecutionIdByJobUuidDB(String jobUuid) {
        Pageable limitOne = PageRequest.of(0, 1); // LIMIT 1
        List<ExecutionMy> results = executionMyRepository.findLastExecutionByJobUuid(jobUuid, limitOne);

        if (!results.isEmpty()) {
            return results.get(0).getExecutionIdRundeck();
        }

        return null;
    }

}
