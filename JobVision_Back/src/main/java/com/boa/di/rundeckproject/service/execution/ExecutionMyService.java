package com.boa.di.rundeckproject.service.execution;

import com.boa.di.rundeckproject.dto.ExecutionMyDTO;
import com.boa.di.rundeckproject.model.ExecutionMy;
import com.boa.di.rundeckproject.model.ExecutionStateResponse;

import java.util.List;
import java.util.Map;

public interface ExecutionMyService {
    List<ExecutionMyDTO> getAllExecutions();
    List<ExecutionMyDTO> getExecutionsByJobId(Long jobId);
    double getExecutionProgressFromState(long executionId);
    ExecutionStateResponse getExecutionProgressFromStateDetail(long executionId);
    Map<String, Double> getExecutionProgressPerNode(long executionId);
    Long getLastExecutionIdByJobUuid(String jobUuid);
    Long getLastExecutionIdByJobUuidDB(String jobUuid);
    ExecutionMyDTO toExecutionMyDTO(ExecutionMy execution);
}
