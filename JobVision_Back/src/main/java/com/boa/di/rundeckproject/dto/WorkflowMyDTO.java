package com.boa.di.rundeckproject.dto;

import java.util.List;

public class WorkflowMyDTO {
    private String strategy;
    private Boolean keepgoing;
    private String description;
    private List<WorkflowStepMyDTO> steps;
    private List<OptionDTO> options;
    // Getters, Setters, Constructeurs
    public List<OptionDTO> getOptions() {
        return options;
    }

    public void setOptions(List<OptionDTO> options) {
        this.options = options;
    }

    public String getStrategy() {
        return strategy;
    }

    public void setStrategy(String strategy) {
        this.strategy = strategy;
    }

    public Boolean getKeepgoing() {
        return keepgoing;
    }

    public void setKeepgoing(Boolean keepgoing) {
        this.keepgoing = keepgoing;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<WorkflowStepMyDTO> getSteps() {
        return steps;
    }

    public void setSteps(List<WorkflowStepMyDTO> steps) {
        this.steps = steps;
    }
}
