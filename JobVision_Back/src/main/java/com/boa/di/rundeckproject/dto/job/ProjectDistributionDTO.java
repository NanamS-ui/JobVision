package com.boa.di.rundeckproject.dto.job;

public class ProjectDistributionDTO {
    private String projectName;
    private long executionCount;

    public ProjectDistributionDTO(String projectName, long executionCount) {
        this.projectName = projectName;
        this.executionCount = executionCount;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public long getExecutionCount() {
        return executionCount;
    }

    public void setExecutionCount(long executionCount) {
        this.executionCount = executionCount;
    }
}
