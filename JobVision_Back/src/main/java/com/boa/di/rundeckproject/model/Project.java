package com.boa.di.rundeckproject.model;

import jakarta.persistence.Entity;
import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "project")
public class Project implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id_project;

    @Column(name = "version", nullable = false)
    private Long version;

    @Column(name = "date_created", nullable = false, updatable = false)
    private LocalDateTime dateCreated;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "state")
    private String state;

    @ManyToOne
    @JoinColumn(name = "id_service", nullable = false)
    private Service service;

    @OneToMany(mappedBy = "project")
    private List<NodeProject> nodeProjects;

    // Constructors
    public Project() {}

    // Getters and Setters
    public Long getId() {
        return id_project;
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

    public void setId(Long id) {
        this.id_project = id;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }

    // Lifecycle callbacks to manage dateCreated and lastUpdated automatically
    @PrePersist
    public void prePersist() {
        dateCreated = LocalDateTime.now();
        lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    public List<NodeProject> getNodeProjects() {
        return nodeProjects;
    }

    public void setNodeProjects(List<NodeProject> nodeProjects) {
        this.nodeProjects = nodeProjects;
    }
}