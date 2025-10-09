package com.boa.di.rundeckproject.service.history;


import com.boa.di.rundeckproject.dto.HistoriqueExecutionGroupedDTO;

import java.util.List;

public interface HistoriqueExecutionService {
    List<HistoriqueExecutionGroupedDTO> getLast10HistoriqueGroupedLogs(Long jobId);
    List<HistoriqueExecutionGroupedDTO> searchExecutions(Long idJob, String nodeName, String dateStart, String dateEnd, String status);
}
