package com.boa.di.rundeckproject.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ProjectDTO {
    private Long id;
    private Long version;
    private LocalDateTime dateCreated;
    private LocalDateTime lastUpdated;
    private String name;
    private String description;
    private String state;
    private List<JobDTO> jobs;

    // Constructeurs
    public ProjectDTO() {}

    public ProjectDTO(Long id, Long version, LocalDateTime dateCreated, LocalDateTime lastUpdated,
                      String name, String description, String state) {
        this.id = id;
        this.version = version;
        this.dateCreated = dateCreated;
        this.lastUpdated = lastUpdated;
        this.name = name;
        this.description = description;
        this.state = state;
    }

    public ProjectDTO(Long id, Long version, LocalDateTime dateCreated, LocalDateTime lastUpdated, String name, String description, String state, List<JobDTO> jobs) {
        this.id = id;
        this.version = version;
        this.dateCreated = dateCreated;
        this.lastUpdated = lastUpdated;
        this.name = name;
        this.description = description;
        this.state = state;
        this.jobs = jobs;
    }

    // Getters & Setters (omitted for brevity)


    public List<JobDTO> getJobs() {
        return jobs;
    }

    public void setJobs(List<JobDTO> jobs) {
        this.jobs = jobs;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public LocalDateTime getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(LocalDateTime dateCreated) {
        this.dateCreated = dateCreated;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
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

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}
