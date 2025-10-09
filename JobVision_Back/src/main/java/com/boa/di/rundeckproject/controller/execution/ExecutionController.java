package com.boa.di.rundeckproject.controller.execution;

import com.boa.di.rundeckproject.dto.ExecutionMyDTO;
import com.boa.di.rundeckproject.error.ErrorDetail;
import com.boa.di.rundeckproject.model.ExecutionStateResponse;
import com.boa.di.rundeckproject.service.execution.ExecutionMyService;
import com.boa.di.rundeckproject.success.SuccessDetail;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/executions")
public class ExecutionController {

    @Autowired
    private ExecutionMyService executionMyService;

    @GetMapping
    public ResponseEntity<?> getAllExecutions(@RequestHeader(value = "Host", required = false) String host) {
        try {
            List<ExecutionMyDTO> executions = executionMyService.getAllExecutions();
            return ResponseEntity.ok(new SuccessDetail(
                    200,
                    "Liste des exécutions récupérée avec succès",
                    Instant.now().toEpochMilli(),
                    "/executions",
                    executions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorDetail(
                    500,
                    "Erreur lors de la récupération des exécutions",
                    Instant.now().toEpochMilli(),
                    "/executions",
                    e.getMessage()
            ));
        }
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getExecutionsByJobId(@PathVariable Long jobId) {
        try {
            List<ExecutionMyDTO> executions = executionMyService.getExecutionsByJobId(jobId);
            return ResponseEntity.ok(new SuccessDetail(
                    200,
                    "Exécutions du job récupérées avec succès",
                    Instant.now().toEpochMilli(),
                    "/executions/job/" + jobId,
                    executions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorDetail(
                    500,
                    "Erreur lors de la récupération des exécutions du job",
                    Instant.now().toEpochMilli(),
                    "/executions/job/" + jobId,
                    e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<?> getExecutionProgress(@PathVariable Long id, HttpServletRequest request) {
        try {
            double progress = executionMyService.getExecutionProgressFromState(id);

            SuccessDetail success = new SuccessDetail(
                    HttpStatus.OK.value(),
                    "Progress retrieved successfully",
                    System.currentTimeMillis(),
                    request.getRequestURI(),
                    progress
            );

            return ResponseEntity.ok(success);
        } catch (Exception e) {
            ErrorDetail error = new ErrorDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to retrieve progress",
                    System.currentTimeMillis(),
                    request.getRequestURI(),
                    e.getMessage()
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{executionId}/progress-node")
    public ResponseEntity<?> getProgress(@PathVariable long executionId, HttpServletRequest request) {
        String path = "/api/execution/" + executionId + "/progress";

        try {
            var progress = executionMyService.getExecutionProgressPerNode(executionId);

            SuccessDetail success = new SuccessDetail(
                    HttpStatus.OK.value(),
                    "Progression récupérée avec succès",
                    Instant.now().toEpochMilli(),
                    request.getRequestURI(),
                    progress
            );

            return ResponseEntity.ok(success);
        } catch (Exception e) {
            ErrorDetail error = new ErrorDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Erreur lors de la récupération de la progression",
                    Instant.now().toEpochMilli(),
                    request.getRequestURI(),
                    e.getMessage()
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}/progress/details")
    public ResponseEntity<?> getExecutionProgressDetails(@PathVariable Long id, HttpServletRequest request) {
        try {
            ExecutionStateResponse progress = executionMyService.getExecutionProgressFromStateDetail(id);

            SuccessDetail success = new SuccessDetail(
                    HttpStatus.OK.value(),
                    "Progress retrieved successfully",
                    System.currentTimeMillis(),
                    request.getRequestURI(),
                    progress
            );

            return ResponseEntity.ok(success);
        } catch (Exception e) {
            ErrorDetail error = new ErrorDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to retrieve progress",
                    System.currentTimeMillis(),
                    request.getRequestURI(),
                    e.getMessage()
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/progress")
    public Map<Long, Double> getProgressForRunningJobs(@RequestBody List<Long> executionIds) {
        Map<Long, Double> progressMap = new HashMap<>();
        for (Long executionId : executionIds) {
            double progress = executionMyService.getExecutionProgressFromState(executionId);
            progressMap.put(executionId, progress);
        }
        return progressMap;
    }

}