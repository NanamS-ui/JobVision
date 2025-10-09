package com.boa.di.rundeckproject.listener;

import com.boa.di.rundeckproject.model.HistoriqueExecution;
import com.boa.di.rundeckproject.model.Node;
import com.boa.di.rundeckproject.model.RundeckExecutionStateResponse;
import com.boa.di.rundeckproject.repository.HistoriqueExecutionRepository;
import com.boa.di.rundeckproject.repository.NodeRepository;
import com.boa.di.rundeckproject.service.RundeckService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseEntity;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class HistoriqueExecutionListener {

    private static final Logger logger = LoggerFactory.getLogger(HistoriqueExecutionListener.class);
    private static final int BATCH_SIZE = 50;

    private final HistoriqueExecutionRepository historiqueExecutionRepository;
    private final RundeckService rundeckService;
    private final NodeRepository nodeRepository;

    // Cache des nœuds pour éviter les appels répétés à la base de données
    private final Map<Long, String> nodeCache = new ConcurrentHashMap<>();

    public HistoriqueExecutionListener(HistoriqueExecutionRepository historiqueExecutionRepository, 
                                    RundeckService rundeckService, 
                                    NodeRepository nodeRepository) {
        this.historiqueExecutionRepository = historiqueExecutionRepository;
        this.rundeckService = rundeckService;
        this.nodeRepository = nodeRepository;
    }

    @Scheduled(fixedDelayString = "${rundeck.fetch-history-delay-check}")
    @Transactional
    public void updateExecutionStatuses() {
        try {
            List<HistoriqueExecution> notProcessed = historiqueExecutionRepository.findByProcessedFalse();
            
            if (notProcessed.isEmpty()) {
                return;
            }

            logger.info("Processing {} unprocessed execution histories", notProcessed.size());

            // Traitement par lots pour éviter la surcharge mémoire
            processExecutionsInBatches(notProcessed);

        } catch (Exception e) {
            logger.error("Error during execution status update process", e);
        }
    }

    private void processExecutionsInBatches(List<HistoriqueExecution> notProcessed) {
        // Grouper par executionId pour traiter chaque exécution séparément
        Map<Long, List<HistoriqueExecution>> executionsGrouped = notProcessed.stream()
                .collect(Collectors.groupingBy(HistoriqueExecution::getExecutionIdRundeck));

        executionsGrouped.entrySet().parallelStream()
                .forEach(entry -> processExecutionBatch(entry.getKey(), entry.getValue()));
    }

    private void processExecutionBatch(Long executionId, List<HistoriqueExecution> histos) {
        try {
            logger.debug("Processing execution ID: {} with {} histories", executionId, histos.size());

            ResponseEntity<RundeckExecutionStateResponse> responseEntity = rundeckService.get(
                    "execution/" + executionId + "/state",
                    RundeckExecutionStateResponse.class
            );

            RundeckExecutionStateResponse response = responseEntity.getBody();
            if (response == null || response.getNodes() == null || response.getNodes().isEmpty()) {
                logger.warn("No valid response for execution ID: {}", executionId);
                return;
            }

            // Précharger tous les nœuds nécessaires en une seule fois
            Set<Long> nodeIds = histos.stream()
                    .map(HistoriqueExecution::getNodeId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            
            Map<Long, String> nodeNames = preloadNodeNames(nodeIds);

            // Traiter chaque nœud
            response.getNodes().forEach((nodeName, steps) -> 
                processNodeSteps(nodeName, steps, histos, nodeNames));

        } catch (Exception e) {
            logger.error("Error processing execution ID: {}", executionId, e);
        }
    }

    private Map<Long, String> preloadNodeNames(Set<Long> nodeIds) {
        if (nodeIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return nodeRepository.findAllById(nodeIds.stream()
                .map(String::valueOf)
                .collect(Collectors.toList())).stream()
                .collect(Collectors.toMap(
                    Node::getId,
                    Node::getNodename,
                    (existing, replacement) -> existing
                ));
    }

    private void processNodeSteps(String nodeName, 
                                List<RundeckExecutionStateResponse.NodeStepState> steps,
                                List<HistoriqueExecution> histos,
                                Map<Long, String> nodeNames) {
        
        // Filtrer les historiques pour ce nœud
        List<HistoriqueExecution> nodeHistories = histos.stream()
                .filter(h -> nodeNames.get(h.getNodeId()).equals(nodeName))
                .collect(Collectors.toList());

        if (nodeHistories.isEmpty()) {
            return;
        }

        // Créer un index pour une recherche plus rapide
        Map<String, HistoriqueExecution> stepIndex = nodeHistories.stream()
                .collect(Collectors.toMap(
                    h -> h.getStepCtx() != null ? h.getStepCtx() : "",
                    h -> h,
                    (existing, replacement) -> existing
                ));

        // Traiter chaque étape
        steps.forEach(stepState -> {
            String stepCtx = stepState.getStepctx();
            String statusStep = stepState.getExecutionState();
            String key = stepCtx != null ? stepCtx : "";

            HistoriqueExecution matchingHist = stepIndex.get(key);
            if (matchingHist != null) {
                matchingHist.setStatusStep(statusStep);
                matchingHist.setProcessed(true);
                logger.debug("Updated history ID: {} with status: {}", matchingHist.getId(), statusStep);
            }
        });
    }

    // Méthode pour nettoyer le cache périodiquement
    @Scheduled(fixedRateString = "${rundeck.cache-cleanup-rate}") // 5 minutes par défaut
    public void cleanupCache() {
        nodeCache.clear();
        logger.debug("Node cache cleared");
    }
}
