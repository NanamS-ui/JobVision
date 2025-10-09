package com.boa.di.rundeckproject.controller.notification;

import com.boa.di.rundeckproject.dto.NotificationDetailDTO;
import com.boa.di.rundeckproject.dto.NotificationMyDTO;
import com.boa.di.rundeckproject.service.notification.NotificationDetailService;
import com.boa.di.rundeckproject.service.notification.NotificationMyService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationDetailController {

    private final NotificationDetailService notificationDetailService;
    private final NotificationMyService notificationMyService;

    @Autowired
    public NotificationDetailController(NotificationDetailService notificationDetailService, NotificationMyService notificationMyService) {
        this.notificationDetailService = notificationDetailService;
        this.notificationMyService = notificationMyService;
    }

    @GetMapping
    public List<NotificationDetailDTO> getAllNotifications() {
        return notificationDetailService.getAll();
    }

    @GetMapping("/contact/{contactId}")
    public List<NotificationDetailDTO> getNotificationsByContact(@PathVariable Long contactId) {
        return notificationDetailService.getByContactId(contactId);
    }

    @GetMapping("/groupe/{groupeId}")
    public List<NotificationDetailDTO> getNotificationsByGroupe(@PathVariable Long groupeId) {
        return notificationDetailService.getByGroupeId(groupeId);
    }

    @PostMapping("/batch")
    @Transactional
    public ResponseEntity<List<NotificationMyDTO>> saveAll(@RequestBody List<NotificationMyDTO> dtos) {
        List<NotificationMyDTO> savedDtos = notificationMyService.save(dtos);
        return ResponseEntity.ok(savedDtos);
    }

    @GetMapping("/by-job/{idJob}")
    public ResponseEntity<List<NotificationMyDTO>> getNotificationsByJob(@PathVariable Long idJob) {
        List<NotificationMyDTO> notifications = notificationMyService.getListNotificationMyDTO(idJob);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationMyDTO> update(@PathVariable Long id, @RequestBody NotificationMyDTO dto) {
        return ResponseEntity.ok(notificationMyService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        notificationMyService.deleteById(id);
        return ResponseEntity.ok("Notification supprimée id : " + id);
    }

}