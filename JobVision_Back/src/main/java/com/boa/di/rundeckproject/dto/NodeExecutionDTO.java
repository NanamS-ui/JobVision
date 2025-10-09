package com.boa.di.rundeckproject.dto;

import java.util.List;

public class NodeExecutionDTO {
    private Long nodeId;
    private String nodeName;
    private List<StepLogDTO> steps;

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public Long getNodeId() {
        return nodeId;
    }

    public void setNodeId(Long nodeId) {
        this.nodeId = nodeId;
    }

    public List<StepLogDTO> getSteps() {
        return steps;
    }

    public void setSteps(List<StepLogDTO> steps) {
        this.steps = steps;
    }
}
