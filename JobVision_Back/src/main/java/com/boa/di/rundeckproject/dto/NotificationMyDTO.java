package com.boa.di.rundeckproject.dto;

import java.time.LocalDateTime;

public class NotificationMyDTO {

    private Long id;
    private Boolean isEnabled;
    private Boolean attachLog;
    private Long contactNotificationPreferenceId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long jobId;

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    // Getters & setters

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

    public Long getContactNotificationPreferenceId() {
        return contactNotificationPreferenceId;
    }

    public void setContactNotificationPreferenceId(Long contactNotificationPreferenceId) {
        this.contactNotificationPreferenceId = contactNotificationPreferenceId;
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
