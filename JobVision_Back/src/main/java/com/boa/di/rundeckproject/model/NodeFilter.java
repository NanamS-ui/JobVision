package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "node_filter")
public class NodeFilter implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_node_filter")
    private Long id;

    @Column(name = "filter_node", columnDefinition = "TEXT")
    private String filterNode;

    public NodeFilter() {
    }

    public NodeFilter(String filterNode) {
        this.filterNode = filterNode;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilterNode() {
        return filterNode;
    }

    public void setFilterNode(String filterNode) {
        this.filterNode = filterNode;
    }
}