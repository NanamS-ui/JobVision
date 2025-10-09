package com.boa.di.rundeckproject.dto;

import java.time.LocalDateTime;

public class NotificationLogDTO {

    private Long id;
    private String statusJob;
    private String message;
    private String channel;
    private LocalDateTime sentAt;
    private Boolean isSent;
    private String typeNotification;

    private Long executionId;
    private Long contactNotificationPreferenceId;
    private Long jobId;

    // Getters & Setters

    public Boolean getSent() {
        return isSent;
    }

    public void setSent(Boolean sent) {
        isSent = sent;
    }

    public String getTypeNotification() {
        return typeNotification;
    }

    public void setTypeNotification(String typeNotification) {
        this.typeNotification = typeNotification;
    }

    public NotificationLogDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatusJob() {
        return statusJob;
    }

    public void setStatusJob(String statusJob) {
        this.statusJob = statusJob;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public Long getExecutionId() {
        return executionId;
    }

    public void setExecutionId(Long executionId) {
        this.executionId = executionId;
    }

    public Long getContactNotificationPreferenceId() {
        return contactNotificationPreferenceId;
    }

    public void setContactNotificationPreferenceId(Long contactNotificationPreferenceId) {
        this.contactNotificationPreferenceId = contactNotificationPreferenceId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }
}
