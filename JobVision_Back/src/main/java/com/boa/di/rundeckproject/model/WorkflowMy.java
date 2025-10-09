package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workflow_my")
public class WorkflowMy implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_workflow")
    private Long id;

    @Column(name = "strategy", length = 50)
    private String strategy = "node-first";

    @Column(name = "keepgoing")
    private Boolean keepgoing = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "threadcount")
    private Integer threadcount = 1;

    @OneToOne
    @JoinColumn(name = "id_job", nullable = false)
    private Job job;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Option> options;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkflowStepMy> steps;

    // Getters and Setters
    public List<Option> getOptions() {
        return options;
    }

    public void setOptions(List<Option> options) {
        this.options = options;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStrategy() {
        return strategy;
    }

    public void setStrategy(String strategy) {
        this.strategy = strategy;
    }

    public Boolean getKeepgoing() {
        return keepgoing;
    }

    public void setKeepgoing(Boolean keepgoing) {
        this.keepgoing = keepgoing;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public List<WorkflowStepMy> getSteps() {
        return steps;
    }

    public void setSteps(List<WorkflowStepMy> steps) {
        this.steps = steps;
    }

    public Integer getThreadcount() {
        return threadcount;
    }

    public void setThreadcount(Integer threadcount) {
        this.threadcount = threadcount;
    }
}