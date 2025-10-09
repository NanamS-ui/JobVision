package com.boa.di.rundeckproject.dto;

import java.time.LocalDateTime;

public class JobStatsListDTO {
    private Long idJob;
    private String jobName;
    private String projectName;
    private String serviceName;
    private Long lastExecutionId;
    private Long executionIdRundeck;
    private LocalDateTime dateStarted;
    private double executionProgress;
    private Long durationMs;
    private String status;
    private LocalDateTime dateLastSucess;
    private LocalDateTime dateLastFailed;
    private Long last5Execution;
    private Boolean scheduled;

    public JobStatsListDTO(Long idJob, String jobName, String projectName, String serviceName, Long lastExecutionId, Long executionIdRundeck, LocalDateTime dateStarted, double executionProgress, Long durationMs, String status) {
        this.idJob = idJob;
        this.jobName = jobName;
        this.projectName = projectName;
        this.serviceName = serviceName;
        this.lastExecutionId = lastExecutionId;
        this.executionIdRundeck = executionIdRundeck;
        this.dateStarted = dateStarted;
        this.executionProgress = executionProgress;
        this.durationMs = durationMs;
        this.status = status;
    }

    public JobStatsListDTO(Long idJob, String jobName, String projectName, String serviceName, Long lastExecutionId, Long executionIdRundeck, LocalDateTime dateStarted, double executionProgress, Long durationMs, String status, LocalDateTime dateLastSucess, LocalDateTime dateLastFailed, Long last5Execution) {
        this.idJob = idJob;
        this.jobName = jobName;
        this.projectName = projectName;
        this.serviceName = serviceName;
        this.lastExecutionId = lastExecutionId;
        this.executionIdRundeck = executionIdRundeck;
        this.dateStarted = dateStarted;
        this.executionProgress = executionProgress;
        this.durationMs = durationMs;
        this.status = status;
        this.dateLastSucess = dateLastSucess;
        this.dateLastFailed = dateLastFailed;
        this.last5Execution = last5Execution;
    }


    // Getters and Setters

    public Boolean getScheduled() {
        return scheduled;
    }

    public void setScheduled(Boolean scheduled) {
        this.scheduled = scheduled;
    }

    public LocalDateTime getDateLastSucess() {
        return dateLastSucess;
    }

    public void setDateLastSucess(LocalDateTime dateLastSucess) {
        this.dateLastSucess = dateLastSucess;
    }

    public LocalDateTime getDateLastFailed() {
        return dateLastFailed;
    }

    public void setDateLastFailed(LocalDateTime dateLastFailed) {
        this.dateLastFailed = dateLastFailed;
    }

    public Long getLast5Execution() {
        return last5Execution;
    }

    public void setLast5Execution(Long last5Execution) {
        this.last5Execution = last5Execution;
    }

    public double getExecutionProgress() {
        return executionProgress;
    }

    public void setExecutionProgress(double executionProgress) {
        this.executionProgress = executionProgress;
    }

    public Long getIdJob() {
        return idJob;
    }

    public void setIdJob(Long idJob) {
        this.idJob = idJob;
    }

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public Long getLastExecutionId() {
        return lastExecutionId;
    }

    public void setLastExecutionId(Long lastExecutionId) {
        this.lastExecutionId = lastExecutionId;
    }

    public Long getExecutionIdRundeck() {
        return executionIdRundeck;
    }

    public void setExecutionIdRundeck(Long executionIdRundeck) {
        this.executionIdRundeck = executionIdRundeck;
    }

    public LocalDateTime getDateStarted() {
        return dateStarted;
    }

    public void setDateStarted(LocalDateTime dateStarted) {
        this.dateStarted = dateStarted;
    }

    public Long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(Long durationMs) {
        this.durationMs = durationMs;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
