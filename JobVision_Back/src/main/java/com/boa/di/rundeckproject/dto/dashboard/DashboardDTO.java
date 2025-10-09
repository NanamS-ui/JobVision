package com.boa.di.rundeckproject.dto.dashboard;

import java.util.List;

public class DashboardDTO {
    private long totalExecutionsToday;
    private double successRateToday;
    private double avgDurationThisMonth;
    private int activeJobs;
    private List<DailyCount> executionsByDay;
    private List<StatusCount> executionStatusToday;
    private List<StatusCount> statusDistribution;
    private List<ProjectCount> projectDistribution;
    private List<RecentExecution> recentExecutions;
    // getters/setters

    public long getTotalExecutionsToday() {
        return totalExecutionsToday;
    }

    public void setTotalExecutionsToday(long totalExecutionsToday) {
        this.totalExecutionsToday = totalExecutionsToday;
    }

    public double getSuccessRateToday() {
        return successRateToday;
    }

    public void setSuccessRateToday(double successRateToday) {
        this.successRateToday = successRateToday;
    }

    public double getAvgDurationThisMonth() {
        return avgDurationThisMonth;
    }

    public void setAvgDurationThisMonth(double avgDurationThisMonth) {
        this.avgDurationThisMonth = avgDurationThisMonth;
    }

    public int getActiveJobs() {
        return activeJobs;
    }

    public void setActiveJobs(int activeJobs) {
        this.activeJobs = activeJobs;
    }

    public List<DailyCount> getExecutionsByDay() {
        return executionsByDay;
    }

    public void setExecutionsByDay(List<DailyCount> executionsByDay) {
        this.executionsByDay = executionsByDay;
    }

    public List<StatusCount> getExecutionStatusToday() {
        return executionStatusToday;
    }

    public void setExecutionStatusToday(List<StatusCount> executionStatusToday) {
        this.executionStatusToday = executionStatusToday;
    }

    public List<StatusCount> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(List<StatusCount> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public List<ProjectCount> getProjectDistribution() {
        return projectDistribution;
    }

    public void setProjectDistribution(List<ProjectCount> projectDistribution) {
        this.projectDistribution = projectDistribution;
    }

    public List<RecentExecution> getRecentExecutions() {
        return recentExecutions;
    }

    public void setRecentExecutions(List<RecentExecution> recentExecutions) {
        this.recentExecutions = recentExecutions;
    }
}
