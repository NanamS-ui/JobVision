package com.boa.di.rundeckproject.model;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class NodeProjectId implements Serializable {

    @Column(name = "id_node")
    private Long nodeId;

    @Column(name = "id_project")
    private Long projectId;

    public NodeProjectId() {}

    public NodeProjectId(Long nodeId, Long projectId) {
        this.nodeId = nodeId;
        this.projectId = projectId;
    }

    // Getters, Setters, equals(), and hashCode() ...

    public Long getNodeId() {
        return nodeId;
    }

    public void setNodeId(Long nodeId) {
        this.nodeId = nodeId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
}
