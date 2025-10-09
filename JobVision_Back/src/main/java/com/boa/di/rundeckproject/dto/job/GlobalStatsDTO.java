package com.boa.di.rundeckproject.dto.job;

import java.util.List;
public class GlobalStatsDTO {
    private long totalExecutions;
    private long totalSucceeded;
    private long totalFailed;
    private long totalRunning;
    private double averageExecutionTime;
    private List<DailyExecutionDTO> dailyExecutions;
    private List<DailyDurationDTO> dailyAverageDurations;
    private List<StatusDistributionDTO> statusDistribution;
    private List<ProjectDistributionDTO> projectDistribution;

    // Getters and setters
    public double getAverageExecutionTime() {
        return averageExecutionTime;
    }

    public void setAverageExecutionTime(double averageExecutionTime) {
        this.averageExecutionTime = averageExecutionTime;
    }

    public long getTotalExecutions() {
        return totalExecutions;
    }

    public void setTotalExecutions(long totalExecutions) {
        this.totalExecutions = totalExecutions;
    }

    public long getTotalSucceeded() {
        return totalSucceeded;
    }

    public void setTotalSucceeded(long totalSucceeded) {
        this.totalSucceeded = totalSucceeded;
    }

    public long getTotalFailed() {
        return totalFailed;
    }

    public void setTotalFailed(long totalFailed) {
        this.totalFailed = totalFailed;
    }

    public long getTotalRunning() {
        return totalRunning;
    }

    public void setTotalRunning(long totalRunning) {
        this.totalRunning = totalRunning;
    }

    public List<DailyExecutionDTO> getDailyExecutions() {
        return dailyExecutions;
    }

    public void setDailyExecutions(List<DailyExecutionDTO> dailyExecutions) {
        this.dailyExecutions = dailyExecutions;
    }

    public List<DailyDurationDTO> getDailyAverageDurations() {
        return dailyAverageDurations;
    }

    public void setDailyAverageDurations(List<DailyDurationDTO> dailyAverageDurations) {
        this.dailyAverageDurations = dailyAverageDurations;
    }

    public List<StatusDistributionDTO> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(List<StatusDistributionDTO> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public List<ProjectDistributionDTO> getProjectDistribution() {
        return projectDistribution;
    }

    public void setProjectDistribution(List<ProjectDistributionDTO> projectDistribution) {
        this.projectDistribution = projectDistribution;
    }
}
