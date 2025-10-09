package com.boa.di.rundeckproject.dto;

import java.util.List;

public class ProjectStatsDTO {
    private long totalProjects;
    private long totalExecutions;
    private double successRatePercent;
    private double avgExecutionDurationSec;
    private List<ProjectStatsViewDTO> projects;

    public ProjectStatsDTO(long totalProjects, long totalExecutions, double successRatePercent, double avgExecutionDurationSec, List<ProjectStatsViewDTO> projects) {
        this.totalProjects = totalProjects;
        this.totalExecutions = totalExecutions;
        this.successRatePercent = successRatePercent;
        this.avgExecutionDurationSec = avgExecutionDurationSec;
        this.projects = projects;
    }

    public List<ProjectStatsViewDTO> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectStatsViewDTO> projects) {
        this.projects = projects;
    }

    // Getters and Setters
    public long getTotalProjects() { return totalProjects; }
    public void setTotalProjects(long totalProjects) { this.totalProjects = totalProjects; }

    public long getTotalExecutions() { return totalExecutions; }
    public void setTotalExecutions(long totalExecutions) { this.totalExecutions = totalExecutions; }

    public double getSuccessRatePercent() { return successRatePercent; }
    public void setSuccessRatePercent(double successRatePercent) { this.successRatePercent = successRatePercent; }

    public double getAvgExecutionDurationSec() { return avgExecutionDurationSec; }
    public void setAvgExecutionDurationSec(double avgExecutionDurationSec) { this.avgExecutionDurationSec = avgExecutionDurationSec; }
}
