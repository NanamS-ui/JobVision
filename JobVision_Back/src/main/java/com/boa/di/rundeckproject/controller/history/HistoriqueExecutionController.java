package com.boa.di.rundeckproject.controller.history;

import com.boa.di.rundeckproject.dto.HistoriqueExecutionGroupedDTO;
import com.boa.di.rundeckproject.service.history.HistoriqueExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historique")
public class HistoriqueExecutionController {

    private final HistoriqueExecutionService historiqueExecutionService;

    public HistoriqueExecutionController(HistoriqueExecutionService historiqueExecutionService) {
        this.historiqueExecutionService = historiqueExecutionService;
    }

    @GetMapping("/job/{jobId}")
    public List<HistoriqueExecutionGroupedDTO> getHistoriqueByJobId(@PathVariable Long jobId) {
        return historiqueExecutionService.getLast10HistoriqueGroupedLogs(jobId);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<HistoriqueExecutionGroupedDTO>> searchExecutions(
            @RequestParam Long idJob,
            @RequestParam(required = false) String nodeName,
            @RequestParam(required = false) String dateStart,
            @RequestParam(required = false) String dateEnd,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (page < 0) {
            page = 0;
        }
        if (size <= 0) {
            size = 10;
        }

        List<HistoriqueExecutionGroupedDTO> results = historiqueExecutionService.searchExecutions(idJob, nodeName, dateStart, dateEnd, status);

        int total = results.size();
        int start = Math.min(page * size, total);
        int end = Math.min(start + size, total);
        List<HistoriqueExecutionGroupedDTO> content = results.subList(start, end);

        Page<HistoriqueExecutionGroupedDTO> paged = new PageImpl<>(content, PageRequest.of(page, size), total);
        return ResponseEntity.ok(paged);
    }
}
