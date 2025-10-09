package com.boa.di.rundeckproject.dto;

import com.boa.di.rundeckproject.model.ExecutionStateResponse;
import com.boa.di.rundeckproject.model.JobRef;

import java.util.List;
import java.util.Map;

public class WorkflowStepMyDTO {
    private Integer stepNumber;
    private String name;
    private String description;
    private String pluginType;
    private String command;
    private Boolean nodeStep;
    private Boolean keepgoingOnSuccess;
    private String keepgoingOnFailure;
    private String script;
    private String scriptType;
    private String args;
    private String filePath;
    private String interpreter;
    private String jobRef;
    private JobRef jobRefObj;
    private String executionState;
    private ErrorHandlerDTO errorHandlers;
    private Map<String, ExecutionStateResponse.Step.NodeState> nodeStates;

    // Getters, Setters, Constructeurs
    public ErrorHandlerDTO getErrorHandlers() {
        return errorHandlers;
    }

    public void setErrorHandlers(ErrorHandlerDTO errorHandlers) {
        this.errorHandlers = errorHandlers;
    }

    public String getExecutionState() {
        return executionState;
    }

    public void setExecutionState(String executionState) {
        this.executionState = executionState;
    }

    public Map<String, ExecutionStateResponse.Step.NodeState> getNodeStates() {
        return nodeStates;
    }

    public void setNodeStates(Map<String, ExecutionStateResponse.Step.NodeState> nodeStates) {
        this.nodeStates = nodeStates;
    }

    public Integer getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(Integer stepNumber) {
        this.stepNumber = stepNumber;
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

    public String getPluginType() {
        return pluginType;
    }

    public void setPluginType(String pluginType) {
        this.pluginType = pluginType;
    }

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }

    public Boolean getNodeStep() {
        return nodeStep;
    }

    public void setNodeStep(Boolean nodeStep) {
        this.nodeStep = nodeStep;
    }

    public Boolean getKeepgoingOnSuccess() {
        return keepgoingOnSuccess;
    }

    public void setKeepgoingOnSuccess(Boolean keepgoingOnSuccess) {
        this.keepgoingOnSuccess = keepgoingOnSuccess;
    }

    public String getKeepgoingOnFailure() {
        return keepgoingOnFailure;
    }

    public void setKeepgoingOnFailure(String keepgoingOnFailure) {
        this.keepgoingOnFailure = keepgoingOnFailure;
    }

    public String getScript() {
        return script;
    }

    public void setScript(String script) {
        this.script = script;
    }

    public String getScriptType() {
        return scriptType;
    }

    public void setScriptType(String scriptType) {
        this.scriptType = scriptType;
    }

    public String getArgs() {
        return args;
    }

    public void setArgs(String args) {
        this.args = args;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getInterpreter() {
        return interpreter;
    }

    public void setInterpreter(String interpreter) {
        this.interpreter = interpreter;
    }

    public String getJobRef() {
        return jobRef;
    }

    public void setJobRef(String jobRef) {
        this.jobRef = jobRef;
    }

    public JobRef getJobRefObj() {
        return jobRefObj;
    }

    public void setJobRefObj(JobRef jobRefObj) {
        this.jobRefObj = jobRefObj;
    }
}

