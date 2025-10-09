package com.boa.di.rundeckproject.dto.job;

import java.util.List;

public class RunCommandDTO {

    private String projectId;
    private String command;
    private List<String> nodeIds;

    public RunCommandDTO() {
    }

    public RunCommandDTO(String projectId, String command, List<String> nodeIds) {
        this.projectId = projectId;
        this.command = command;
        this.nodeIds = nodeIds;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }

    public List<String> getNodeIds() {
        return nodeIds;
    }

    public void setNodeIds(List<String> nodeIds) {
        this.nodeIds = nodeIds;
    }
}
