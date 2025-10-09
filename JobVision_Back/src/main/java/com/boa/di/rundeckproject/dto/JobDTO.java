package com.boa.di.rundeckproject.dto;

import com.boa.di.rundeckproject.model.NotificationMy;

import java.util.List;

public class JobDTO {

    private Long id;
    private String uuid;
    private String name;
    private String description;
    private String logLevel;
    private Boolean executionEnabled;
    private Boolean scheduleEnabled;
    private String createdAt;
    private String updatedAt;

    private Long nodeFilterId;
    private String nodeFilterText;

    private Long projectId;
    private String projectName;

    private String cronExpression;

    private WorkflowMyDTO myWorkflow;
    private Boolean priority;
    private List<NotificationMyDTO> notifications;

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

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getNodeFilterId() {
        return nodeFilterId;
    }

    public void setNodeFilterId(Long nodeFilterId) {
        this.nodeFilterId = nodeFilterId;
    }

    public String getNodeFilterText() {
        return nodeFilterText;
    }

    public void setNodeFilterText(String nodeFilterText) {
        this.nodeFilterText = nodeFilterText;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getCronExpression() {
        return cronExpression;
    }

    public void setCronExpression(String cronExpression) {
        this.cronExpression = cronExpression;
    }

    public WorkflowMyDTO getMyWorkflow() {
        return myWorkflow;
    }

    public void setMyWorkflow(WorkflowMyDTO myWorkflow) {
        this.myWorkflow = myWorkflow;
    }

    public Boolean getPriority() {
        return priority;
    }

    public void setPriority(Boolean priority) {
        this.priority = priority;
    }

    public List<NotificationMyDTO> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<NotificationMyDTO> notifications) {
        this.notifications = notifications;
    }
}