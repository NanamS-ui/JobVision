package com.boa.di.rundeckproject.controller.service;

import com.boa.di.rundeckproject.dto.ServiceDailySummaryDTO;
import com.boa.di.rundeckproject.dto.ServiceMonitoringDTO;
import com.boa.di.rundeckproject.service.service.ServiceService;
import com.boa.di.rundeckproject.util.TimeRangeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ServiceMonitoringController {

    @Autowired
    private final ServiceService serviceService;

    public ServiceMonitoringController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @GetMapping("/monitoring/services")
    public ResponseEntity<?> getServiceMonitoring(
            @RequestParam(defaultValue = "all") String serviceName,
            @RequestParam(defaultValue = "1d") String timeRange) {

        try {
            String rawSuccessRate = serviceService.getSuccessRate(serviceName, timeRange);
            Map<String, Double> successRate = serviceService.parseSuccessRateAsJson(rawSuccessRate);

            String rawResponseTime = serviceService.getResponseTimeTrends(serviceName, timeRange);
            Map<String, Double> responseTimeTrends = serviceService.parseResponseTimeTrendsAsJson(rawResponseTime);

            List<ServiceDailySummaryDTO> summaries = serviceService.getSummaries(serviceName);

        ServiceMonitoringDTO dto = new ServiceMonitoringDTO(successRate, responseTimeTrends, summaries);
            return ResponseEntity.ok(dto);

        } catch (IllegalArgumentException e) {
            // Par exemple erreur dans convertTimeRangeToMillis ou param invalide
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid input parameter: " + e.getMessage());
        } catch (Exception e) {
            // Erreur inattendue
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }
    }
}
