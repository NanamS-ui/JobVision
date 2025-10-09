package com.boa.di.rundeckproject.controller.dashboard;

import com.boa.di.rundeckproject.dto.dashboard.DashboardDTO;
import com.boa.di.rundeckproject.service.dashboard.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @Autowired
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(@RequestParam(defaultValue = "lastWeek") String timeRange) {
        try {
            DashboardDTO dashboardData = dashboardService.getDashboardData(timeRange);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/by-date")
    public ResponseEntity<DashboardDTO> getDashboardByDate(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            DashboardDTO dashboardData = dashboardService.getDashboardDataByDate(startDate, endDate);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/executions")
    public ResponseEntity<DashboardDTO> getDashboardRecentExecution() {
        try {
            DashboardDTO dashboardData = dashboardService.getDashboardDataRecentExecution();
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
