package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job")
public class Job implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_job")
    private Long id;

    @Column(name = "uuid", nullable = false, length = 50)
    private String uuid;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "log_level", length = 50)
    private String logLevel = "INFO";

    @Column(name = "execution_enabled")
    private Boolean executionEnabled = true;

    @Column(name = "schedule_enabled")
    private Boolean scheduleEnabled = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_node_filter")
    private NodeFilter nodeFilter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_project", nullable = false)
    private Project project;

    @Column(name = "cron_expression", length = 255)
    private String cronExpression;

    @OneToOne(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private WorkflowMy workflow;

    @Column(name = "priority")
    private Boolean priority= false;

    @Column(name = "is_deleted")
    private Boolean isDeleted= false;

    @OneToMany(mappedBy = "job")
    private List<NotificationMy> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "job")
    private List<ErrorHandler> errorHandlers = new ArrayList<>();

    // --- Constructeurs ---
    public Job() {
    }

    public List<ErrorHandler> getErrorHandlers() {
        return errorHandlers;
    }

    public void setErrorHandlers(List<ErrorHandler> errorHandlers) {
        this.errorHandlers = errorHandlers;
    }

    public Boolean getDeleted() {
        return isDeleted;
    }

    public void setDeleted(Boolean deleted) {
        isDeleted = deleted;
    }

    public List<NotificationMy> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<NotificationMy> notifications) {
        this.notifications = notifications;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLogLevel() {
        return logLevel;
    }

    public void setLogLevel(String logLevel) {
        this.logLevel = logLevel;
    }

    public Boolean getExecutionEnabled() {
        return executionEnabled;
    }

    public void setExecutionEnabled(Boolean executionEnabled) {
        this.executionEnabled = executionEnabled;
    }

    public Boolean getScheduleEnabled() {
        return scheduleEnabled;
    }

    public void setScheduleEnabled(Boolean scheduleEnabled) {
        this.scheduleEnabled = scheduleEnabled;
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

    public NodeFilter getNodeFilter() {
        return nodeFilter;
    }

    public void setNodeFilter(NodeFilter nodeFilter) {
        this.nodeFilter = nodeFilter;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Boolean getPriority() {
        return priority;
    }

    public void setPriority(Boolean priority) {
        this.priority = priority;
    }

    // --- Callbacks pour timestamps automatiques ---
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public WorkflowMy getWorkflow() {
        return workflow;
    }

    public void setWorkflow(WorkflowMy workflow) {
        this.workflow = workflow;
    }

    public String getCronExpression() {
        return cronExpression;
    }

    public void setCronExpression(String cronExpression) {
        this.cronExpression = cronExpression;
    }
}