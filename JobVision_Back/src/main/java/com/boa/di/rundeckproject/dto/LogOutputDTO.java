package com.boa.di.rundeckproject.dto;

public class LogOutputDTO {
    private Long idLogOutput;
    private String logMessage;
    private String logLevel;
    private String stepCtx;
    private Integer stepNumber;
    private String createdAt;
    private String absoluteTime;
    private String localTime;
    private String user;

    // Infos du Node associée (simplifiée)
    private Long nodeId;
    private String nodeName;

    // Infos de l'ExecutionMy associée (simplifiée)
    private Long executionId;
    private Long executionIdRundeck;
    private String status;

    // Getters & setters (omitted for brevity)

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

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getAbsoluteTime() {
        return absoluteTime;
    }

    public void setAbsoluteTime(String absoluteTime) {
        this.absoluteTime = absoluteTime;
    }

    public String getLocalTime() {
        return localTime;
    }

    public void setLocalTime(String localTime) {
        this.localTime = localTime;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public Long getNodeId() {
        return nodeId;
    }

    public void setNodeId(Long nodeId) {
        this.nodeId = nodeId;
    }

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public Long getExecutionId() {
        return executionId;
    }

    public void setExecutionId(Long executionId) {
        this.executionId = executionId;
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
}
