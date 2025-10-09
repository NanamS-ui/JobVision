package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_log_details_view")
public class NotificationLogDetails {

    @Id
    @Column(name = "id_log_notification")
    private Long id;

    // Notification log
    @Column(name = "status_job")
    private String statusJob;

    @Column(name = "message")
    private String message;

    @Column(name = "channel")
    private String channel;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "is_sent")
    private Boolean isSent;

    @Column(name = "type_notification")
    private String typeNotification;

    // Execution
    @Column(name = "id_execution")
    private Long idExecution;

    @Column(name = "execution_id_rundeck")
    private Long executionIdRundeck;

    @Column(name = "execution_status")
    private String executionStatus;

    @Column(name = "date_started")
    private LocalDateTime dateStarted;

    @Column(name = "date_ended")
    private LocalDateTime dateEnded;

    // Job
    @Column(name = "id_job")
    private Long jobId;

    @Column(name = "job_name")
    private String jobName;

    // ContactNotificationPreference
    @Column(name = "id_contact_notification_preference")
    private Long contactNotificationPreferenceId;

    @Column(name = "notify_on_start")
    private Boolean notifyOnStart;

    @Column(name = "notify_on_failed")
    private Boolean notifyOnFailed;

    @Column(name = "notify_on_recovery")
    private Boolean notifyOnRecovery;

    @Column(name = "notify_on_success")
    private Boolean notifyOnSuccess;

    @Column(name = "channel_email")
    private Boolean channelEmail;

    @Column(name = "channel_sms")
    private Boolean channelSms;

    // Contact
    @Column(name = "contact_id")
    private Long contactId;

    @Column(name = "contact_nom")
    private String contactNom;

    @Column(name = "contact_prenom")
    private String contactPrenom;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_telephone")
    private String contactTelephone;

    // Groupe
    @Column(name = "groupe_id")
    private Long groupeId;

    @Column(name = "groupe_name")
    private String groupeName;

    @Column(name = "groupe_description")
    private String groupeDescription;

    // Getters only, setters optionnels (si @Immutable)
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

    public Long getIdExecution() {
        return idExecution;
    }

    public void setIdExecution(Long idExecution) {
        this.idExecution = idExecution;
    }

    public Long getExecutionIdRundeck() {
        return executionIdRundeck;
    }

    public void setExecutionIdRundeck(Long executionIdRundeck) {
        this.executionIdRundeck = executionIdRundeck;
    }

    public String getExecutionStatus() {
        return executionStatus;
    }

    public void setExecutionStatus(String executionStatus) {
        this.executionStatus = executionStatus;
    }

    public LocalDateTime getDateStarted() {
        return dateStarted;
    }

    public void setDateStarted(LocalDateTime dateStarted) {
        this.dateStarted = dateStarted;
    }

    public LocalDateTime getDateEnded() {
        return dateEnded;
    }

    public void setDateEnded(LocalDateTime dateEnded) {
        this.dateEnded = dateEnded;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public Long getContactNotificationPreferenceId() {
        return contactNotificationPreferenceId;
    }

    public void setContactNotificationPreferenceId(Long contactNotificationPreferenceId) {
        this.contactNotificationPreferenceId = contactNotificationPreferenceId;
    }

    public Boolean getNotifyOnStart() {
        return notifyOnStart;
    }

    public void setNotifyOnStart(Boolean notifyOnStart) {
        this.notifyOnStart = notifyOnStart;
    }

    public Boolean getNotifyOnFailed() {
        return notifyOnFailed;
    }

    public void setNotifyOnFailed(Boolean notifyOnFailed) {
        this.notifyOnFailed = notifyOnFailed;
    }

    public Boolean getNotifyOnRecovery() {
        return notifyOnRecovery;
    }

    public void setNotifyOnRecovery(Boolean notifyOnRecovery) {
        this.notifyOnRecovery = notifyOnRecovery;
    }

    public Boolean getNotifyOnSuccess() {
        return notifyOnSuccess;
    }

    public void setNotifyOnSuccess(Boolean notifyOnSuccess) {
        this.notifyOnSuccess = notifyOnSuccess;
    }

    public Boolean getChannelEmail() {
        return channelEmail;
    }

    public void setChannelEmail(Boolean channelEmail) {
        this.channelEmail = channelEmail;
    }

    public Boolean getChannelSms() {
        return channelSms;
    }

    public void setChannelSms(Boolean channelSms) {
        this.channelSms = channelSms;
    }

    public Long getContactId() {
        return contactId;
    }

    public void setContactId(Long contactId) {
        this.contactId = contactId;
    }

    public String getContactNom() {
        return contactNom;
    }

    public void setContactNom(String contactNom) {
        this.contactNom = contactNom;
    }

    public String getContactPrenom() {
        return contactPrenom;
    }

    public void setContactPrenom(String contactPrenom) {
        this.contactPrenom = contactPrenom;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactTelephone() {
        return contactTelephone;
    }

    public void setContactTelephone(String contactTelephone) {
        this.contactTelephone = contactTelephone;
    }

    public Long getGroupeId() {
        return groupeId;
    }

    public void setGroupeId(Long groupeId) {
        this.groupeId = groupeId;
    }

    public String getGroupeName() {
        return groupeName;
    }

    public void setGroupeName(String groupeName) {
        this.groupeName = groupeName;
    }

    public String getGroupeDescription() {
        return groupeDescription;
    }

    public void setGroupeDescription(String groupeDescription) {
        this.groupeDescription = groupeDescription;
    }
}
