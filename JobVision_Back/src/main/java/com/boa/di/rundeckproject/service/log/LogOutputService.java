package com.boa.di.rundeckproject.service.log;

import com.boa.di.rundeckproject.dto.LogFilterDTO;
import com.boa.di.rundeckproject.dto.LogOutputDTO;
import com.boa.di.rundeckproject.dto.LogOutputViewDTO;
import com.boa.di.rundeckproject.model.ExecutionMy;
import com.boa.di.rundeckproject.model.LogCountsResponse;
import com.boa.di.rundeckproject.model.LogOutput;

import java.util.List;

public interface LogOutputService {
    List<LogOutputDTO> getLogsByNodeNameDTO(String nodeName);
    List<LogOutputDTO> getLogsByIdNodeDTO(String idNode);
    List<LogOutputDTO> getLogsByNodeNameAndExecutionId(String nodeName, Long executionId, String stepCtx);

    List<LogOutputDTO> getLogsByExecutionIdRun(Long executionId);

    List<LogOutputViewDTO> getRecentLogs();
    List<LogOutputViewDTO> getFilteredLogs(LogFilterDTO filter);
    LogCountsResponse getLogCounts();
    List<LogOutputDTO> getLogsByExecutionId(Long executionId);
}
