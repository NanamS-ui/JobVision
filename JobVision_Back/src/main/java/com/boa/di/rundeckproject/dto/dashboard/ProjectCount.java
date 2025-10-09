package com.boa.di.rundeckproject.dto.dashboard;

public class ProjectCount {
    private String projectName;
    private long count;

    // getters/setters

    public ProjectCount(String projectName, long count) {
        this.projectName = projectName;
        this.count = count;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
