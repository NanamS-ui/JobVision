package com.boa.di.rundeckproject.dto;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "log_output_view")
public class LogOutputViewDTO {
    @Id
    @Column(name = "id_log_output")
    private Long idLogOutput;

    @Column(name = "log_message")
    private String logMessage;

    @Column(name = "log_level")
    private String logLevel;

    @Column(name = "step_ctx")
    private String stepCtx;

    @Column(name = "step_number")
    private Integer stepNumber;

    @Column(name = "created_at_")
    private LocalDateTime createdAt;

    @Column(name = "absolute_time")
    private LocalDateTime absoluteTime;

    @Column(name = "local_time")
    private LocalTime localTime;

    @Column(name = "id_execution")
    private Long idExecution;

    @Column(name = "user_")
    private String user;

    @Column(name = "id_node")
    private Long idNode;

    @Column(name = "nodename")
    private String nodename;

    @Column(name = "hostname")
    private String hostname;

    @Column(name = "id_job")
    private Long idJob;

    @Column(name = "job_name")
    private String jobName;

    @Column(name = "job_description")
    private String jobDescription;

    // Getters et setters

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

    public Long getIdExecution() {
        return idExecution;
    }

    public void setIdExecution(Long idExecution) {
        this.idExecution = idExecution;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public Long getIdNode() {
        return idNode;
    }

    public void setIdNode(Long idNode) {
        this.idNode = idNode;
    }

    public String getNodename() {
        return nodename;
    }

    public void setNodename(String nodename) {
        this.nodename = nodename;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
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

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }
}
