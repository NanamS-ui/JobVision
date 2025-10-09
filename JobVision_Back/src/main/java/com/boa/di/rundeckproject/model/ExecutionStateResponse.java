package com.boa.di.rundeckproject.model;

import com.boa.di.rundeckproject.dto.LogOutputDTO;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ExecutionStateResponse {
    private long executionId;
    private String serverNode;
    private String executionState;
    private String updateTime;
    private String startTime;
    private String endTime;
    private boolean completed;
    private List<String> allNodes;
    private int stepCount;
    private List<Step> steps;
    private Map<String, List<NodeStep>> nodes;
    private List<String> targetNodes;
    private double progress;

    public static class NodeStep {
        private String executionState;
        private String stepctx;

        public String getExecutionState() {return executionState;}
        public void setExecutionState(String executionState) {this.executionState = executionState;}
        public String getStepctx() {return stepctx;}
        public void setStepctx(String stepctx) {this.stepctx = stepctx;}
    }

    public static class Step {
        private String id;
        private String stepctx;
        private String executionState;
        private String startTime;
        private String updateTime;
        private String endTime;
        private int duration;
        private boolean nodeStep;
        private Map<String, NodeState> nodeStates;

        public String getId() {return id;}
        public void setId(String id) {this.id = id;}
        public String getStepctx() {return stepctx;}
        public void setStepctx(String stepctx) {this.stepctx = stepctx;}
        public String getExecutionState() {return executionState;}
        public void setExecutionState(String executionState) {this.executionState = executionState;}
        public String getStartTime() {return startTime;}
        public void setStartTime(String startTime) {this.startTime = startTime;}
        public String getUpdateTime() {return updateTime;}
        public void setUpdateTime(String updateTime) {this.updateTime = updateTime;}
        public String getEndTime() {return endTime;}
        public void setEndTime(String endTime) {this.endTime = endTime;}
        public int getDuration() {return duration;}
        public void setDuration(int duration) {this.duration = duration;}
        public boolean isNodeStep() {return nodeStep;}
        public void setNodeStep(boolean nodeStep) {this.nodeStep = nodeStep;}
        public Map<String, NodeState> getNodeStates() {return nodeStates;}
        public void setNodeStates(Map<String, NodeState> nodeStates) {this.nodeStates = nodeStates;}

        public static class NodeState {
            private int duration;
            private String executionState;
            private String startTime;
            private String updateTime;
            private String endTime;
            private Double progressStatePerNode;
            private List<LogOutputDTO> logs;

            public Double getProgressStatePerNode() {return progressStatePerNode;}
            public void setProgressStatePerNode(Double progressStatePerNode) {this.progressStatePerNode = progressStatePerNode;}
            public int getDuration() {return duration;}
            public void setDuration(int duration) {this.duration = duration;}
            public String getExecutionState() {return executionState;}
            public void setExecutionState(String executionState) {this.executionState = executionState;}
            public String getStartTime() {return startTime;}
            public void setStartTime(String startTime) {this.startTime = startTime;}
            public String getUpdateTime() {return updateTime;}
            public void setUpdateTime(String updateTime) {this.updateTime = updateTime;}
            public String getEndTime() {return endTime;}
            public void setEndTime(String endTime) {this.endTime = endTime;}
            public List<LogOutputDTO> getLogs() {return logs;}
            public void setLogs(List<LogOutputDTO> logs) {this.logs = logs;}
        }
    }

    // Getters and setters for outer class
    public long getExecutionId() {
        return executionId;
    }

    public void setExecutionId(long executionId) {
        this.executionId = executionId;
    }

    public String getServerNode() {
        return serverNode;
    }

    public void setServerNode(String serverNode) {
        this.serverNode = serverNode;
    }

    public String getExecutionState() {
        return executionState;
    }

    public void setExecutionState(String executionState) {
        this.executionState = executionState;
    }

    public String getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(String updateTime) {
        this.updateTime = updateTime;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public List<String> getAllNodes() {
        return allNodes;
    }

    public void setAllNodes(List<String> allNodes) {
        this.allNodes = allNodes;
    }

    public int getStepCount() {
        return stepCount;
    }

    public void setStepCount(int stepCount) {
        this.stepCount = stepCount;
    }

    public List<Step> getSteps() {
        return steps;
    }

    public void setSteps(List<Step> steps) {
        this.steps = steps;
    }

    public Map<String, List<NodeStep>> getNodes() {
        return nodes;
    }

    public void setNodes(Map<String, List<NodeStep>> nodes) {
        this.nodes = nodes;
    }

    public List<String> getTargetNodes() {
        return targetNodes;
    }

    public void setTargetNodes(List<String> targetNodes) {
        this.targetNodes = targetNodes;
    }

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }

}
