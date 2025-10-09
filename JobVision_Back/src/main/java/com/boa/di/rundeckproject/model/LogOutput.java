package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "log_output")
public class LogOutput {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_log_output")
    private Long idLogOutput;

    @Column(name = "log_message", nullable = false, columnDefinition = "TEXT")
    private String logMessage;

    @Column(name = "log_level", length = 50)
    private String logLevel;

    @Column(name = "step_ctx", length = 50)
    private String stepCtx;

    @Column(name = "step_number")
    private Integer stepNumber;

    @Column(name = "created_at_", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_node", nullable = false)
    private Node node;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_execution")
    private ExecutionMy idExecution;

    @Column(name = "absolute_time")
    private LocalDateTime absoluteTime;

    @Column(name = "local_time")
    private LocalTime localTime;

    @Column(name = "user_")
    private String user;

    // Getters and Setters
    public Long getIdLogOutput() {
        return idLogOutput;
    }

    public void setIdLogOutput(Long idLogOutput) {
        this.idLogOutput = idLogOutput;
    }

    public String getLogMessage() {
        return logMessage;
    }

    public void setLogMessage(String logMessage) {
        this.logMessage = logMessage;
    }

    public String getLogLevel() {
        return logLevel;
    }

    public void setLogLevel(String logLevel) {
        this.logLevel = logLevel;
    }

    public String getStepCtx() {
        return stepCtx;
    }

    public void setStepCtx(String stepCtx) {
        this.stepCtx = stepCtx;
    }

    public Integer getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(Integer stepNumber) {
        this.stepNumber = stepNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Node getNode() {
        return node;
    }

    public void setNode(Node node) {
        this.node = node;
    }

    public ExecutionMy getIdExecution() {
        return idExecution;
    }

    public void setIdExecution(ExecutionMy idExecution) {
        this.idExecution = idExecution;
    }

    public LocalDateTime getAbsoluteTime() {
        return absoluteTime;
    }

    public void setAbsoluteTime(LocalDateTime absoluteTime) {
        this.absoluteTime = absoluteTime;
    }

    public LocalTime getLocalTime() {
        return localTime;
    }

    public void setLocalTime(LocalTime localTime) {
        this.localTime = localTime;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }
}
