package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notification_my")
public class NotificationMy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notification")
    private Long id;

    @Column(name = "is_enabled")
    private Boolean isEnabled = true;

    @Column(name = "attach_log")
    private Boolean attachLog = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_contact_notification_preference", nullable = false)
    private ContactNotificationPreference contactNotificationPreference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_job")
    private Job job;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters et setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean getIsEnabled() {
        return isEnabled;
    }

    public void setIsEnabled(Boolean isEnabled) {
        this.isEnabled = isEnabled;
    }

    public Boolean getAttachLog() {
        return attachLog;
    }

    public void setAttachLog(Boolean attachLog) {
        this.attachLog = attachLog;
    }

    public ContactNotificationPreference getContactNotificationPreference() {
        return contactNotificationPreference;
    }

    public void setContactNotificationPreference(ContactNotificationPreference contactNotificationPreference) {
        this.contactNotificationPreference = contactNotificationPreference;
    }

    public Boolean getEnabled() {
        return isEnabled;
    }

    public void setEnabled(Boolean enabled) {
        isEnabled = enabled;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
