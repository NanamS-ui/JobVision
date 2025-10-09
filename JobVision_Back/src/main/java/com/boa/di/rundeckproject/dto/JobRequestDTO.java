package com.boa.di.rundeckproject.dto;

import com.boa.di.rundeckproject.model.Job;
import com.boa.di.rundeckproject.model.Node;

import java.util.List;

public class JobRequestDTO {
    private Job job;
    private List<Node> nodes;


    // Getters et setters
    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public List<Node> getNodes() {
        return nodes;
    }

    public void setNodes(List<Node> nodes) {
        this.nodes = nodes;
    }
}
