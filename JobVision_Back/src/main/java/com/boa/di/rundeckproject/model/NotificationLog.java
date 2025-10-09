package com.boa.di.rundeckproject.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_log")
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_log_notification")
    private Long id;

    @Column(name = "status_job", length = 255)
    private String statusJob;

    @Lob
    @Column(name = "message")
    private String message;

    @Column(name = "channel", length = 20)
    private String channel;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "is_sent")
    private Boolean isSent = false;

    @Column(name = "type_notification", length = 50)
    private String typeNotification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_execution")
    private ExecutionMy execution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_contact_notification_preference")
    private ContactNotificationPreference contactNotificationPreference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_job")
    private Job job;

    // Constructors

    public NotificationLog() {
    }

    // Getters & Setters

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

    public Boolean getIsSent() {
        return isSent;
    }

    public void setIsSent(Boolean isSent) {
        this.isSent = isSent;
    }

    public String getTypeNotification() {
        return typeNotification;
    }

    public void setTypeNotification(String typeNotification) {
        this.typeNotification = typeNotification;
    }

    public ExecutionMy getExecution() {
        return execution;
    }

    public void setExecution(ExecutionMy execution) {
        this.execution = execution;
    }

    public ContactNotificationPreference getContactNotificationPreference() {
        return contactNotificationPreference;
    }

    public void setContactNotificationPreference(ContactNotificationPreference contactNotificationPreference) {
        this.contactNotificationPreference = contactNotificationPreference;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }
}