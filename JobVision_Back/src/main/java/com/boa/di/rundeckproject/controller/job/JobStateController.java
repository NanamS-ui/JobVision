package com.boa.di.rundeckproject.controller.job;

import com.boa.di.rundeckproject.dto.JobStateDTO;
import com.boa.di.rundeckproject.dto.job.GlobalStatsDTO;
import com.boa.di.rundeckproject.dto.job.StatisticsByJobDTO;
import com.boa.di.rundeckproject.service.job.JobService;
import com.boa.di.rundeckproject.service.job.JobStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
public class JobStateController {
    private final JobService jobService;
    private final JobStatisticsService jobStatisticsService;

    @Autowired
    public JobStateController(JobService jobService, JobStatisticsService jobStatisticsService) {
        this.jobService = jobService;
        this.jobStatisticsService = jobStatisticsService;
    }

    @GetMapping("/stats")
    public ResponseEntity<JobStateDTO> getJobCounts() {
        JobStateDTO jobStateDTO = jobService.getJobCounts();
        return ResponseEntity.ok(jobStateDTO);
    }

    @GetMapping("/{id}/state")
    public StatisticsByJobDTO getJobStatistics(
            @PathVariable("id") Long jobId,
            @RequestParam(name = "timeRange", defaultValue = "thisWeek") String timeRange
    ) throws Exception {
        return jobStatisticsService.getStatisticsByJob(jobId, timeRange);
    }

    @GetMapping("/stats/global")
    public GlobalStatsDTO getGlobalStats(
            @RequestParam(defaultValue = "all") String serviceId,
            @RequestParam(defaultValue = "thisWeek") String timeRange
    ) throws Exception {
        return jobStatisticsService.getGlobalDashboard(serviceId, timeRange);
    }

    @GetMapping("/stats/date")
    public StatisticsByJobDTO getDateStatistics(
            @PathVariable("id") Long jobId,
            @RequestParam(name = "timeRange", defaultValue = "lastWeek") String timeRange
    ) throws Exception {
        return jobStatisticsService.getStatisticsByJob(jobId, timeRange);
    }

    @GetMapping("/state/{jobId}/date")
    public ResponseEntity<?> getStatisticsByJobByDate(
            @PathVariable("jobId") Long jobId,
            @RequestParam(value = "dateDebut", required = false) String dateDebut,
            @RequestParam(value = "dateFin", required = false) String dateFin
    ) {
        try {
            StatisticsByJobDTO dto = jobStatisticsService.getStatisticsByJobByDate(jobId, dateDebut, dateFin);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors du calcul des statistiques : " + e.getMessage());
        }
    }

    @GetMapping("/global/date")
    public ResponseEntity<?> getGlobalDashboardByDate(
            @RequestParam(required = false) String serviceId,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin
    ) {
        try {
            GlobalStatsDTO result = jobStatisticsService.getGlobalDashboardByDate(serviceId, dateDebut, dateFin);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors de la récupération des statistiques : " + e.getMessage());
        }
    }
}
