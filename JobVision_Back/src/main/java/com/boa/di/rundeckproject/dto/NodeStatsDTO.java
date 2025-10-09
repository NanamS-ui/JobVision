package com.boa.di.rundeckproject.dto;

import java.util.List;
import java.util.Map;

public class NodeStatsDTO {
    private long totalEnabledNodes;
    private long nodesInFilters;
    private long jobsOnActiveNodes;
    private long distinctOsFamilies;
    private Map<String, Long> osNodeCountMap;
    private Map<String, Long> nodeJobCountMap;

    private List<NodeDTO> nodes;
    // Constructeurs
    public NodeStatsDTO() {
    }

    public NodeStatsDTO(long totalEnabledNodes, long nodesInFilters, long jobsOnActiveNodes, long distinctOsFamilies) {
        this.totalEnabledNodes = totalEnabledNodes;
        this.nodesInFilters = nodesInFilters;
        this.jobsOnActiveNodes = jobsOnActiveNodes;
        this.distinctOsFamilies = distinctOsFamilies;
    }

    public NodeStatsDTO(long totalEnabledNodes, long nodesInFilters, long jobsOnActiveNodes, long distinctOsFamilies, Map<String, Long> osNodeCountMap, Map<String, Long> nodeJobCountMap, List<NodeDTO> nodes) {
        this.totalEnabledNodes = totalEnabledNodes;
        this.nodesInFilters = nodesInFilters;
        this.jobsOnActiveNodes = jobsOnActiveNodes;
        this.distinctOsFamilies = distinctOsFamilies;
        this.osNodeCountMap = osNodeCountMap;
        this.nodeJobCountMap = nodeJobCountMap;
        this.nodes = nodes;
    }

    // Getters et Setters
    public long getTotalEnabledNodes() {
        return totalEnabledNodes;
    }

    public void setTotalEnabledNodes(long totalEnabledNodes) {
        this.totalEnabledNodes = totalEnabledNodes;
    }

    public long getNodesInFilters() {
        return nodesInFilters;
    }

    public void setNodesInFilters(long nodesInFilters) {
        this.nodesInFilters = nodesInFilters;
    }

    public long getJobsOnActiveNodes() {
        return jobsOnActiveNodes;
    }

    public void setJobsOnActiveNodes(long jobsOnActiveNodes) {
        this.jobsOnActiveNodes = jobsOnActiveNodes;
    }

    public long getDistinctOsFamilies() {
        return distinctOsFamilies;
    }

    public void setDistinctOsFamilies(long distinctOsFamilies) {
        this.distinctOsFamilies = distinctOsFamilies;
    }

    public Map<String, Long> getOsNodeCountMap() {
        return osNodeCountMap;
    }

    public void setOsNodeCountMap(Map<String, Long> osNodeCountMap) {
        this.osNodeCountMap = osNodeCountMap;
    }

    public Map<String, Long> getNodeJobCountMap() {
        return nodeJobCountMap;
    }

    public void setNodeJobCountMap(Map<String, Long> nodeJobCountMap) {
        this.nodeJobCountMap = nodeJobCountMap;
    }

    public List<NodeDTO> getNodes() {
        return nodes;
    }

    public void setNodes(List<NodeDTO> nodes) {
        this.nodes = nodes;
    }

    @Override
    public String toString() {
        return "NodeStatsDTO{" +
                "totalEnabledNodes=" + totalEnabledNodes +
                ", nodesInFilters=" + nodesInFilters +
                ", jobsOnActiveNodes=" + jobsOnActiveNodes +
                ", distinctOsFamilies=" + distinctOsFamilies +
                '}';
    }
}
