package com.boa.di.rundeckproject.listener;

import com.boa.di.rundeckproject.dto.ContactNotificationPreferenceDTO;
import com.boa.di.rundeckproject.model.NotificationLog;
import com.boa.di.rundeckproject.model.ExecutionMy;
import com.boa.di.rundeckproject.repository.NotificationLogRepository;
import com.boa.di.rundeckproject.service.EmailService;
import com.boa.di.rundeckproject.service.MapiService;
import com.boa.di.rundeckproject.service.contact.ContactNotificationPreferenceService;
import com.boa.di.rundeckproject.service.job.JobService;
import com.boa.di.rundeckproject.util.MapperUtil;
import com.boa.di.rundeckproject.repository.NotificationMyRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class NotificationLogListener {

    private static final Logger logger = LoggerFactory.getLogger(NotificationLogListener.class);

    private static final String ONSTART_STATUS = "onstart";
    private static final int BATCH_SIZE = 100;

    private final NotificationLogRepository notificationLogRepository;
    private final EmailService emailService;
    private final MapiService mapiService;
    private final JobService jobService;
    private final ContactNotificationPreferenceService contactPreferenceService;
    private final NotificationMyRepository notificationMyRepository;

    public NotificationLogListener(NotificationLogRepository notificationLogRepository,
                                   EmailService emailService,
                                   MapiService mapiService,
                                   JobService jobService,
                                   ContactNotificationPreferenceService contactPreferenceService,
                                   NotificationMyRepository notificationMyRepository) {
        this.notificationLogRepository = notificationLogRepository;
        this.emailService = emailService;
        this.mapiService = mapiService;
        this.jobService = jobService;
        this.contactPreferenceService = contactPreferenceService;
        this.notificationMyRepository = notificationMyRepository;
    }

    @Scheduled(fixedDelayString = "${rundeck.fetch-notification-delay-check}")
    @Transactional
    public void processPendingNotificationLogs() {
        try {
            List<NotificationLog> pendingLogs = notificationLogRepository.findByIsSentFalse();

            if (pendingLogs.isEmpty()) {
                logger.debug("Aucune notification en attente à traiter");
                return;
            }

            logger.info("Traitement de {} notifications en attente", pendingLogs.size());

            // Traitement par batch pour éviter la surcharge mémoire
            processNotificationsInBatches(pendingLogs);

        } catch (Exception e) {
            logger.error("Erreur lors du traitement des notifications: {}", e.getMessage(), e);
        }
    }

    private void processNotificationsInBatches(List<NotificationLog> allPendingLogs) {
        for (int i = 0; i < allPendingLogs.size(); i += BATCH_SIZE) {
            int endIndex = Math.min(i + BATCH_SIZE, allPendingLogs.size());
            List<NotificationLog> batch = allPendingLogs.subList(i, endIndex);

            try {
                processNotificationBatch(batch);
            } catch (Exception e) {
                logger.error("Erreur lors du traitement du batch {}-{}: {}", i, endIndex, e.getMessage(), e);
            }
        }
    }

    private void processNotificationBatch(List<NotificationLog> batch) {
        // Grouper par type et execution pour éviter les doublons
        Map<String, List<NotificationLog>> groupedLogs = batch.stream()
                .filter(log -> log.getExecution() != null && log.getTypeNotification() != null)
                .collect(Collectors.groupingBy(log ->
                        log.getTypeNotification() + "-" + log.getExecution().getIdExecution()));

        // Précharger les données communes pour optimiser les performances
        Map<Long, List<ContactNotificationPreferenceDTO>> contactsByJobId = new HashMap<>();
        Map<Long, Boolean> attachLogByJobId = new HashMap<>();

        for (Map.Entry<String, List<NotificationLog>> entry : groupedLogs.entrySet()) {
            List<NotificationLog> group = entry.getValue();
            if (group.isEmpty()) continue;

            try {
                processNotificationGroup(group, contactsByJobId, attachLogByJobId);
            } catch (Exception e) {
                logger.error("Erreur lors du traitement du groupe {}: {}", entry.getKey(), e.getMessage(), e);
            }
        }
    }

    private void processNotificationGroup(List<NotificationLog> group,
                                          Map<Long, List<ContactNotificationPreferenceDTO>> contactsByJobId,
                                          Map<Long, Boolean> attachLogByJobId) {
        NotificationLog sample = group.get(0);
        String status = sample.getTypeNotification();
        Long executionId = sample.getExecution().getIdExecution();
        ExecutionMy execution = sample.getExecution();
        Long jobId = execution.getJob().getId();
        String jobName = execution.getJob().getName();
        LocalDateTime localDateTime = sample.getSentAt();

        if (!ONSTART_STATUS.equalsIgnoreCase(status) && !emailService.logsAvailable(executionId)) {
            logger.debug("Logs pas encore prêts pour executionId {}, reporté pour plus tard", executionId);
            return;
        }

        // Récupérer les contacts (avec cache local)
        List<ContactNotificationPreferenceDTO> contacts = contactsByJobId.computeIfAbsent(jobId,
                id -> contactPreferenceService.getContactsByJobId(id)
                        .stream()
                        .map(MapperUtil::mapEntityToDto)
                        .collect(Collectors.toList()));

        if (contacts.isEmpty()) {
            logger.debug("Aucun contact trouvé pour le job {}", jobId);
            return;
        }

        // Récupérer la préférence d'attachement (avec cache local)
        boolean shouldAttachLog = attachLogByJobId.computeIfAbsent(jobId,
                id -> getAttachLogPreference(sample));

        try {
            // Envoyer les notifications email
            String html = emailService.envoyerNotificationParContacts(
                    status,
                    shouldAttachLog,
                    executionId,
                    jobName,
                    contacts,
                    localDateTime
            );

            // Envoyer les notifications SMS
            String smsMessage = mapiService.envoyerSMS(
                    status,
                    executionId,
                    jobName,
                    contacts,
                    localDateTime
            );

            // Marquer tous les logs du groupe comme envoyés
            group.forEach(log -> {
                log.setIsSent(true);
                // Combiner les messages email et SMS pour le log
                String combinedMessage = html;
                if (smsMessage != null && !smsMessage.isEmpty()) {
                    combinedMessage += "\n\n--- SMS ---\n" + smsMessage;
                }
                log.setMessage(combinedMessage);
            });

            logger.info("Notifications {} envoyées (Email + SMS) pour executionId {} avec attachement: {}",
                    status, executionId, shouldAttachLog);

        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi des notifications {} pour executionId {}: {}",
                    status, executionId, e.getMessage(), e);
        }
    }

    private boolean getAttachLogPreference(NotificationLog sample) {
        try {
            if (sample.getJob() == null || sample.getContactNotificationPreference() == null) {
                return false;
            }

            return notificationMyRepository.findByJob_Id(sample.getJob().getId())
                    .stream()
                    .filter(notification -> notification.getContactNotificationPreference().getId()
                            .equals(sample.getContactNotificationPreference().getId()))
                    .anyMatch(notification -> Boolean.TRUE.equals(notification.getAttachLog()));

        } catch (Exception e) {
            logger.warn("Erreur lors de la récupération de la préférence d'attachement: {}", e.getMessage());
            return false;
        }
    }
}
