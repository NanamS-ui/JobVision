package com.boa.di.rundeckproject.service.notification;
import com.boa.di.rundeckproject.dto.NotificationLogDTO;
import com.boa.di.rundeckproject.model.NotificationLog;
import com.boa.di.rundeckproject.model.NotificationLogDetails;
import com.boa.di.rundeckproject.repository.NotificationLogDetailsRepository;
import com.boa.di.rundeckproject.repository.NotificationLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationLogServiceImpl implements NotificationLogService {

    private final NotificationLogRepository repository;
    private final NotificationLogDetailsRepository detailsRepository;

    public NotificationLogServiceImpl(NotificationLogRepository repository, NotificationLogDetailsRepository detailsRepository) {
        this.repository = repository;
        this.detailsRepository = detailsRepository;
    }

    @Override
    public List<NotificationLogDTO> getAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationLogDTO> getByJob(Long jobId) {
        return repository.findByJobId(jobId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationLogDTO> getByContactPreference(Long contactPreferenceId) {
        return repository.findByContactNotificationPreferenceId(contactPreferenceId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private NotificationLogDTO toDTO(NotificationLog log) {
        NotificationLogDTO dto = new NotificationLogDTO();
        dto.setId(log.getId());
        dto.setStatusJob(log.getStatusJob());
        dto.setMessage(log.getMessage());
        dto.setChannel(log.getChannel());
        dto.setSentAt(log.getSentAt());
        dto.setSent(log.getIsSent());
        dto.setTypeNotification(log.getTypeNotification());

        dto.setExecutionId(log.getExecution() != null ? log.getExecution().getIdExecution() : null);
        dto.setContactNotificationPreferenceId(log.getContactNotificationPreference() != null
                ? log.getContactNotificationPreference().getId() : null);
        dto.setJobId(log.getJob() != null ? log.getJob().getId() : null);

        return dto;
    }

    @Override
    public Page<NotificationLogDetails> getFilteredLogs(
            Long jobId,
            Long contactId,
            Long groupeId,
            String typeNotification,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    ) {
        return detailsRepository.searchLogs(jobId, contactId, groupeId, typeNotification, startDate, endDate, pageable);
    }

    @Override
    public List<NotificationLogDetails> getLatest10Logs() {
        return detailsRepository.findTop10ByOrderBySentAtDesc();
    }
}
