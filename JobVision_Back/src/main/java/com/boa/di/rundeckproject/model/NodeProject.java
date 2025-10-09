package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "node_project")
public class NodeProject {

    @EmbeddedId
    private NodeProjectId id;

    @ManyToOne
    @MapsId("nodeId")
    @JoinColumn(name = "id_node")
    private Node node;

    @ManyToOne
    @MapsId("projectId")
    @JoinColumn(name = "id_project")
    private Project project;

    public NodeProject() {}

    public NodeProject(Node node, Project project) {
        this.node = node;
        this.project = project;
        this.id = new NodeProjectId(node.getIdNode(), project.getId());
    }

    // Getters and Setters ...
    public NodeProjectId getId() {
        return id;
    }

    public void setId(NodeProjectId id) {
        this.id = id;
    }

    public Node getNode() {
        return node;
    }

    public void setNode(Node node) {
        this.node = node;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }
}
