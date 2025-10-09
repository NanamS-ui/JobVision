package com.boa.di.rundeckproject.dto;

import com.boa.di.rundeckproject.model.ExecutionStateResponse;
import java.util.List;

public class JobDetailDTO {
    private JobDTO job;
    private ExecutionStateResponse executionState;

    public JobDetailDTO() {
    }

    public JobDetailDTO(JobDTO job, ExecutionStateResponse executionState) {
        this.job = job;
        this.executionState = executionState;
    }

    public JobDTO getJob() {
        return job;
    }

    public void setJob(JobDTO job) {
        this.job = job;
    }

    public ExecutionStateResponse getExecutionState() {
        return executionState;
    }

    public void setExecutionState(ExecutionStateResponse executionState) {
        this.executionState = executionState;
    }
}
