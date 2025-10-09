package com.boa.di.rundeckproject.dto;

import java.util.List;

public class JobStateDTO {
    private int totalJobs;
    private int runningJobs;
    private int successfulJobs;
    private int failedJobs;
    private List<JobStatsListDTO> jobStats;

    public JobStateDTO(int totalJobs, int runningJobs) {
        this.totalJobs = totalJobs;
        this.runningJobs = runningJobs;
    }

    public JobStateDTO(int totalJobs, int runningJobs, int successfulJobs, int failedJobs, List<JobStatsListDTO> jobStats) {
        this.totalJobs = totalJobs;
        this.runningJobs = runningJobs;
        this.successfulJobs = successfulJobs;
        this.failedJobs = failedJobs;
        this.jobStats = jobStats;
    }

    // Getters & setters

    public JobStateDTO(int totalJobs, int runningJobs, int successfulJobs, int failedJobs) {
        this.totalJobs = totalJobs;
        this.runningJobs = runningJobs;
        this.successfulJobs = successfulJobs;
        this.failedJobs = failedJobs;
    }

    public int getSuccessfulJobs() {
        return successfulJobs;
    }

    public void setSuccessfulJobs(int successfulJobs) {
        this.successfulJobs = successfulJobs;
    }

    public int getFailedJobs() {
        return failedJobs;
    }

    public void setFailedJobs(int failedJobs) {
        this.failedJobs = failedJobs;
    }

    public int getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(int totalJobs) {
        this.totalJobs = totalJobs;
    }

    public int getRunningJobs() {
        return runningJobs;
    }

    public void setRunningJobs(int runningJobs) {
        this.runningJobs = runningJobs;
    }

    public List<JobStatsListDTO> getJobStats() {
        return jobStats;
    }

    public void setJobStats(List<JobStatsListDTO> jobStats) {
        this.jobStats = jobStats;
    }
}
