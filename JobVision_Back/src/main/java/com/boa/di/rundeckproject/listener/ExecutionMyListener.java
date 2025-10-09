package com.boa.di.rundeckproject.listener;

import com.boa.di.rundeckproject.dto.ContactNotificationPreferenceDTO;
import com.boa.di.rundeckproject.model.*;
import com.boa.di.rundeckproject.repository.ExecutionMyRepository;
import com.boa.di.rundeckproject.repository.LogOutputRepository;
import com.boa.di.rundeckproject.repository.NodeRepository;
import com.boa.di.rundeckproject.service.EmailService;
import com.boa.di.rundeckproject.service.RundeckService;
import com.boa.di.rundeckproject.service.contact.ContactGroupeService;
import com.boa.di.rundeckproject.service.contact.ContactNotificationPreferenceService;
import com.boa.di.rundeckproject.service.job.JobService;
import com.boa.di.rundeckproject.util.MapperUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ExecutionMyListener {

    private final ExecutionMyRepository executionMyRepository;
    private final LogOutputRepository logOutputRepository;
    private final NodeRepository nodeRepository;
    private final RundeckService rundeckService;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;
    private final ContactNotificationPreferenceService contactNotificationPreferenceService;
    private final JobService jobService;
    @Autowired
    public ExecutionMyListener(
            ExecutionMyRepository executionMyRepository,
            LogOutputRepository logOutputRepository,
            NodeRepository nodeRepository,
            RundeckService rundeckService,
            ObjectMapper objectMapper, EmailService emailService, ContactNotificationPreferenceService contactNotificationPreferenceService, JobService jobService
    ) {
        this.executionMyRepository = executionMyRepository;
        this.logOutputRepository = logOutputRepository;
        this.nodeRepository = nodeRepository;
        this.rundeckService = rundeckService;
        this.objectMapper = objectMapper;
        this.emailService = emailService;
        this.contactNotificationPreferenceService = contactNotificationPreferenceService;
        this.jobService = jobService;
    }

    @Scheduled(fixedDelayString = "${rundeck.fetch-logs-delay-check}")
    @Transactional
    public void fetchExecutionLogs() {
        List<ExecutionMy> executions = executionMyRepository.findByProcessedFalse();

        for (ExecutionMy execution : executions) {
            try {
                String logPath = "/execution/" + execution.getExecutionIdRundeck() + "/output?format=json";
                ResponseEntity<String> response = rundeckService.get(logPath, String.class);

                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    logError("Échec récupération logs", execution, response);
                    continue;
                }

                if (!isJsonResponse(response)) {
                    logError("Réponse non JSON", execution, response);
                    continue;
                }

                JsonNode root = objectMapper.readTree(response.getBody());
                String execState = root.path("execState").asText(null);

                if ("running".equalsIgnoreCase(execState)) continue;

                JsonNode entries = root.path("entries");
                if (!entries.isArray()) continue;

                Map<String, Node> nodeCache = new HashMap<>();
                List<LogOutput> logsToSave = new ArrayList<>();

                for (JsonNode entry : entries) {
                    try {
                        LogOutput log = new LogOutput();
                        log.setLogMessage(entry.path("log").asText(null));
                        log.setLogLevel(entry.path("level").asText(null));
                        log.setStepCtx(entry.path("stepctx").asText(null));
                        log.setUser(entry.path("user").asText(null));
                        log.setAbsoluteTime(parseDateTime(entry.path("absolute_time").asText(null)));
                        log.setLocalTime(parseTime(entry.path("time").asText(null)));
                        log.setIdExecution(execution);

                        String nodeName = entry.path("node").asText(null);
                        if (nodeName != null) {
                            Node node = nodeCache.computeIfAbsent(nodeName,
                                    name -> nodeRepository.findNodeByNodename(name));
                            log.setNode(node);
                        }

                        logsToSave.add(log);
                    } catch (Exception logEx) {
                        System.err.println("Erreur lors de l'insertion d'un log : " + logEx.getMessage());
                    }
                }

                if (!logsToSave.isEmpty()) {
                    logOutputRepository.saveAll(logsToSave);
                }

                execution.setProcessed(true);
                executionMyRepository.save(execution);

            } catch (Exception e) {
                System.err.printf("Erreur lors du traitement de l'exécution %s: %s%n",
                        execution.getExecutionIdRundeck(), e.getMessage());
            }
        }
    }

    private boolean isJsonResponse(ResponseEntity<?> response) {
        MediaType contentType = response.getHeaders().getContentType();
        return contentType != null && contentType.includes(MediaType.APPLICATION_JSON);
    }

    private void logError(String message, ExecutionMy execution, ResponseEntity<?> response) {
        System.err.printf("⚠️ %s [%s] - Status: %s, Body: %s%n",
                message, execution.getExecutionIdRundeck(),
                response.getStatusCode(), response.getBody());
    }

    private LocalDateTime parseDateTime(String value) {
        return value != null ? LocalDateTime.parse(value, DateTimeFormatter.ISO_OFFSET_DATE_TIME) : null;
    }

    private LocalTime parseTime(String value) {
        return value != null ? LocalTime.parse(value, DateTimeFormatter.ofPattern("HH:mm:ss")) : null;
    }

}

