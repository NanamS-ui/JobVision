package com.boa.di.rundeckproject.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_details_view")
public class ServiceFlatViewDTO {

    @Column(name = "id_service")
    private Integer idService;

    @Column(name = "service_name")
    private String serviceName;

    @Column(name = "service_description")
    private String serviceDescription;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "project_description")
    private String projectDescription;

    @Column(name = "project_state")
    private String projectState;

    @Column(name = "date_created")
    private LocalDateTime projectDateCreated;

    @Column(name = "last_updated")
    private LocalDateTime projectLastUpdated;

    @Id
    @Column(name = "id_job")
    private Long idJob;

    @Column(name = "job_uuid")
    private String jobUuid;

    @Column(name = "job_name")
    private String jobName;

    @Column(name = "job_description")
    private String jobDescription;

    @Column(name = "execution_enabled")
    private Boolean executionEnabled;

    @Column(name = "schedule_enabled")
    private Boolean scheduleEnabled;

    @Column(name = "job_created_at")
    private LocalDateTime jobCreatedAt;

    @Column(name = "job_updated_at")
    private LocalDateTime jobUpdatedAt;

    @Column(name = "log_level")
    private String logLevel;

    @Column(name = "priority")
    private Boolean priority;

    @Column(name = "cron_expression")
    private String cronExpression;

    // Getters and setters

    public Integer getIdService() {
        return idService;
    }

    public void setIdService(Integer idService) {
        this.idService = idService;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getServiceDescription() {
        return serviceDescription;
    }

    public void setServiceDescription(String serviceDescription) {
        this.serviceDescription = serviceDescription;
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

    public String getProjectDescription() {
        return projectDescription;
    }

    public void setProjectDescription(String projectDescription) {
        this.projectDescription = projectDescription;
    }

    public String getProjectState() {
        return projectState;
    }

    public void setProjectState(String projectState) {
        this.projectState = projectState;
    }

    public LocalDateTime getProjectDateCreated() {
        return projectDateCreated;
    }

    public void setProjectDateCreated(LocalDateTime projectDateCreated) {
        this.projectDateCreated = projectDateCreated;
    }

    public LocalDateTime getProjectLastUpdated() {
        return projectLastUpdated;
    }

    public void setProjectLastUpdated(LocalDateTime projectLastUpdated) {
        this.projectLastUpdated = projectLastUpdated;
    }

    public Long getIdJob() {
        return idJob;
    }

    public void setIdJob(Long idJob) {
        this.idJob = idJob;
    }

    public String getJobUuid() {
        return jobUuid;
    }

    public void setJobUuid(String jobUuid) {
        this.jobUuid = jobUuid;
    }

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
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

    public LocalDateTime getJobCreatedAt() {
        return jobCreatedAt;
    }

    public void setJobCreatedAt(LocalDateTime jobCreatedAt) {
        this.jobCreatedAt = jobCreatedAt;
    }

    public LocalDateTime getJobUpdatedAt() {
        return jobUpdatedAt;
    }

    public void setJobUpdatedAt(LocalDateTime jobUpdatedAt) {
        this.jobUpdatedAt = jobUpdatedAt;
    }

    public String getLogLevel() {
        return logLevel;
    }

    public void setLogLevel(String logLevel) {
        this.logLevel = logLevel;
    }

    public Boolean getPriority() {
        return priority;
    }

    public void setPriority(Boolean priority) {
        this.priority = priority;
    }

    public String getCronExpression() {
        return cronExpression;
    }

    public void setCronExpression(String cronExpression) {
        this.cronExpression = cronExpression;
    }
}

