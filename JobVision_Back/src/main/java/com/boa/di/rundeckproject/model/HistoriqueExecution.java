package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "historique_execution",
        uniqueConstraints = @UniqueConstraint(columnNames = {"execution_id_rundeck", "id_node", "step_ctx"})
)
public class HistoriqueExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historique")
    private Long id;

    @Column(name = "execution_id_rundeck", nullable = false)
    private Long executionIdRundeck;

    @Column(name = "id_job")
    private Long jobId;

    @Column(name = "id_node", nullable = false)
    private Long nodeId;

    @Column(name = "step_ctx", length = 50)
    private String stepCtx;

    @Column(name = "status", length = 50)
    private String status;

    @Lob
    @Column(name = "log_message")
    private String logMessage;

    @Column(name = "archive", columnDefinition = "TINYINT(1)")
    private Boolean archive = false;

    @Column(name = "date_execution")
    private LocalDateTime dateExecution;

    @Column(name = "date_started")
    private LocalDateTime dateStarted;

    @Column(name = "date_ended")
    private LocalDateTime dateEnded;

    @Column(name = "duration")
    private Long duration;

    @Column(name = "status_step", length = 50)
    private String statusStep;

    @Column(name = "processed", columnDefinition = "TINYINT(1)")
    private Boolean processed = false;

    // Getters & Setters
    public String getStatusStep() {
        return statusStep;
    }

    public void setStatusStep(String statusStep) {
        this.statusStep = statusStep;
    }

    public Boolean getProcessed() {
        return processed;
    }

    public void setProcessed(Boolean processed) {
        this.processed = processed;
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

    public Long getDuration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getExecutionIdRundeck() {
        return executionIdRundeck;
    }

    public void setExecutionIdRundeck(Long executionIdRundeck) {
        this.executionIdRundeck = executionIdRundeck;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public Long getNodeId() {
        return nodeId;
    }

    public void setNodeId(Long nodeId) {
        this.nodeId = nodeId;
    }

    public String getStepCtx() {
        return stepCtx;
    }

    public void setStepCtx(String stepCtx) {
        this.stepCtx = stepCtx;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLogMessage() {
        return logMessage;
    }

    public void setLogMessage(String logMessage) {
        this.logMessage = logMessage;
    }

    public Boolean getArchive() {
        return archive;
    }

    public void setArchive(Boolean archive) {
        this.archive = archive;
    }

    public LocalDateTime getDateExecution() {
        return dateExecution;
    }

    public void setDateExecution(LocalDateTime dateExecution) {
        this.dateExecution = dateExecution;
    }
}
