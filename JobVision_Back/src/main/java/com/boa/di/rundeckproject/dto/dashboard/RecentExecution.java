package com.boa.di.rundeckproject.dto.dashboard;

import java.time.LocalDateTime;

public class RecentExecution {
    private long executionId;
    private String status;
    private LocalDateTime dateStarted;
    private LocalDateTime dateEnded;
    private long durationMs;
    private String jobName;
    private String projectName;

    public RecentExecution() {
        // Constructeur vide requis par Jackson pour désérialiser (optionnel si seulement sérialisation)
    }

    public RecentExecution(long executionId, String status, LocalDateTime dateStarted,
                           LocalDateTime dateEnded, long durationMs, String jobName, String projectName) {
        this.executionId = executionId;
        this.status = status;
        this.dateStarted = dateStarted;
        this.dateEnded = dateEnded;
        this.durationMs = durationMs;
        this.jobName = jobName;
        this.projectName = projectName;
    }

    // Getters (essentiel pour Jackson)
    public long getExecutionId() {
        return executionId;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getDateStarted() {
        return dateStarted;
    }

    public LocalDateTime getDateEnded() {
        return dateEnded;
    }

    public long getDurationMs() {
        return durationMs;
    }

    public String getJobName() {
        return jobName;
    }

    public String getProjectName() {
        return projectName;
    }

    // Setters (optionnels si tu as besoin de désérialiser JSON en objet)
    public void setExecutionId(long executionId) {
        this.executionId = executionId;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setDateStarted(LocalDateTime dateStarted) {
        this.dateStarted = dateStarted;
    }

    public void setDateEnded(LocalDateTime dateEnded) {
        this.dateEnded = dateEnded;
    }

    public void setDurationMs(long durationMs) {
        this.durationMs = durationMs;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }
}
