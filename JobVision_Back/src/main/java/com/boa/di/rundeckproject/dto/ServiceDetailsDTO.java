package com.boa.di.rundeckproject.dto;

import java.util.List;

public class ServiceDetailsDTO {
    private ServiceDTO service;
    private List<ProjectDTO> projects;


    public ServiceDetailsDTO() {}

    public ServiceDetailsDTO(ServiceDTO service, List<ProjectDTO> projects) {
        this.service = service;
        this.projects = projects;
    }

    public ServiceDTO getService() {
        return service;
    }

    public void setService(ServiceDTO service) {
        this.service = service;
    }

    public List<ProjectDTO> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectDTO> projects) {
        this.projects = projects;
    }

    @Override
    public String toString() {
        return "ServiceDetailsDTO{" +
                "service=" + service +
                ", projects=" + projects +
                '}';
    }
}
