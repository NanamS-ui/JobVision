package com.boa.di.rundeckproject.model;

import com.boa.di.rundeckproject.listener.ExecutionMyListener;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "execution_my")
    public class ExecutionMy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_execution")
    private Long idExecution;

    @Column(name = "execution_id_rundeck", nullable = false, unique = true)
    private Long executionIdRundeck;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "date_started", nullable = false)
    private LocalDateTime dateStarted;

    @Column(name = "date_ended")
    private LocalDateTime dateEnded;

    @Column(name = "arg", columnDefinition = "TEXT")
    private String arg;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "username", length = 50)
    private String username;

    @Column(name = "processed")
    private Boolean processed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_project", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_job")
    private Job job;

    // Getters & Setters
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getArg() {
        return arg;
    }

    public void setArg(String arg) {
        this.arg = arg;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(Long durationMs) {
        this.durationMs = durationMs;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public Boolean getProcessed() {
        return processed;
    }

    public void setProcessed(Boolean processed) {
        this.processed = processed;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}