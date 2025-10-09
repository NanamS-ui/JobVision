package com.boa.di.rundeckproject.dto;

import java.util.List;

public class ProjectStatsViewDTO {
    private ProjectDTO project;
    private double progress;
    private List<JobDTO> jobs;

    public ProjectStatsViewDTO(ProjectDTO project, double progress, List<JobDTO> jobs) {
        this.project = project;
        this.progress = progress;
        this.jobs = jobs;
    }

    // Getters and setters
    public ProjectDTO getProject() {
        return project;
    }

    public void setProject(ProjectDTO project) {
        this.project = project;
    }

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }

    public List<JobDTO> getJobs() {
        return jobs;
    }

    public void setJobs(List<JobDTO> jobs) {
        this.jobs = jobs;
    }
}
