package com.boa.di.rundeckproject.dto;

import java.util.List;

public class ServiceDTO {
    private Integer id;
    private String name;
    private String description;
    private List<ProjectDTO> projects;


    // Constructeurs
    public ServiceDTO() {}

    public ServiceDTO(Integer id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    public ServiceDTO(Integer id, String name, String description, List<ProjectDTO> projects) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.projects = projects;
    }

    // Getters & Setters (omitted for brevity)

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public List<ProjectDTO> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectDTO> projects) {
        this.projects = projects;
    }
}
