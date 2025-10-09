package com.boa.di.rundeckproject.service.notification;

import com.boa.di.rundeckproject.dto.NotificationLogDTO;
import com.boa.di.rundeckproject.model.NotificationLogDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationLogService {
    List<NotificationLogDTO> getAll();
    List<NotificationLogDTO> getByJob(Long jobId);
    List<NotificationLogDTO> getByContactPreference(Long contactPreferenceId);

    Page<NotificationLogDetails> getFilteredLogs(
            Long jobId,
            Long contactId,
            Long groupeId,
            String typeNotification,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    List<NotificationLogDetails> getLatest10Logs();
}