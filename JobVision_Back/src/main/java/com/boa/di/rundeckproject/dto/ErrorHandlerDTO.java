package com.boa.di.rundeckproject.dto;

public class ErrorHandlerDTO {

    private Long id;
    private Long jobId;
    private Long stepId;
    private String handlerType;
    private String handlerCommand;
    private String handlerDescription;
    private Boolean continueOnError;

    // Constructeurs

    public ErrorHandlerDTO() {}

    public ErrorHandlerDTO(Long id, Long jobId, Long stepId, String handlerType,
                           String handlerCommand, String handlerDescription, Boolean continueOnError) {
        this.id = id;
        this.jobId = jobId;
        this.stepId = stepId;
        this.handlerType = handlerType;
        this.handlerCommand = handlerCommand;
        this.handlerDescription = handlerDescription;
        this.continueOnError = continueOnError;
    }

    // Getters & Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public Long getStepId() {
        return stepId;
    }

    public void setStepId(Long stepId) {
        this.stepId = stepId;
    }

    public String getHandlerType() {
        return handlerType;
    }

    public void setHandlerType(String handlerType) {
        this.handlerType = handlerType;
    }

    public String getHandlerCommand() {
        return handlerCommand;
    }

    public void setHandlerCommand(String handlerCommand) {
        this.handlerCommand = handlerCommand;
    }

    public String getHandlerDescription() {
        return handlerDescription;
    }

    public void setHandlerDescription(String handlerDescription) {
        this.handlerDescription = handlerDescription;
    }

    public Boolean getContinueOnError() {
        return continueOnError;
    }

    public void setContinueOnError(Boolean continueOnError) {
        this.continueOnError = continueOnError;
    }
}
