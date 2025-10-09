package com.boa.di.rundeckproject.controller.notification;

import com.boa.di.rundeckproject.dto.NotificationLogDTO;
import com.boa.di.rundeckproject.model.NotificationLogDetails;
import com.boa.di.rundeckproject.repository.NotificationLogRepository;
import com.boa.di.rundeckproject.service.notification.NotificationLogService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notification-logs")
public class NotificationLogController {

    private final NotificationLogService service;
    private final NotificationLogRepository notificationLogRepository;

    public NotificationLogController(NotificationLogService service, NotificationLogRepository notificationLogRepository) {
        this.service = service;
        this.notificationLogRepository = notificationLogRepository;
    }

    @GetMapping
    public List<NotificationLogDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/job/{jobId}")
    public List<NotificationLogDTO> getByJob(@PathVariable Long jobId) {
        return service.getByJob(jobId);
    }

    @GetMapping("/contact-preference/{prefId}")
    public List<NotificationLogDTO> getByContactPref(@PathVariable Long prefId) {
        return service.getByContactPreference(prefId);
    }

    @GetMapping("/logs/latest")
    public ResponseEntity<List<NotificationLogDetails>> getLatestLogs() {
        List<NotificationLogDetails> logs = service.getLatest10Logs();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<NotificationLogDetails>> searchLogs(
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) Long contactId,
            @RequestParam(required = false) Long groupeId,
            @RequestParam(required = false) String typeNotification,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationLogDetails> results = service.getFilteredLogs(
                jobId, contactId, groupeId, typeNotification, startDate, endDate, pageable
        );
        return ResponseEntity.ok(results);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        notificationLogRepository.deleteById(id);
        return ResponseEntity.ok("Notification supprimée id : " + id);
    }

}