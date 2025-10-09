package com.boa.di.rundeckproject.model;

import java.util.List;
import java.util.Map;

public class RundeckExecutionStateResponse {
    private Long executionId;
    private String serverNode;
    private Map<String, List<NodeStepState>> nodes;

    // getters et setters

    public static class NodeStepState {
        private String executionState;
        private String stepctx;

        // getters et setters
        public String getExecutionState() { return executionState; }
        public void setExecutionState(String executionState) { this.executionState = executionState; }
        public String getStepctx() { return stepctx; }
        public void setStepctx(String stepctx) { this.stepctx = stepctx; }
    }

    public Long getExecutionId() { return executionId; }
    public void setExecutionId(Long executionId) { this.executionId = executionId; }
    public String getServerNode() { return serverNode; }
    public void setServerNode(String serverNode) { this.serverNode = serverNode; }
    public Map<String, List<NodeStepState>> getNodes() { return nodes; }
    public void setNodes(Map<String, List<NodeStepState>> nodes) { this.nodes = nodes; }
}
