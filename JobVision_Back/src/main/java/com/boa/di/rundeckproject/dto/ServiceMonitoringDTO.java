package com.boa.di.rundeckproject.dto;

import java.util.List;
import java.util.Map;

public class ServiceMonitoringDTO {

    private Map<String, Double> successRate;       // clé : date ISO String "yyyy-MM-dd"
    private Map<String, Double> responseTimeTrends; // clé : date ISO String "yyyy-MM-dd"
    private List<ServiceDailySummaryDTO> serviceDto;

    public ServiceMonitoringDTO() {
    }

    public ServiceMonitoringDTO(Map<String, Double> successRate, Map<String, Double> responseTimeTrends, List<ServiceDailySummaryDTO> serviceDto) {
        this.successRate = successRate;
        this.responseTimeTrends = responseTimeTrends;
        this.serviceDto = serviceDto;
    }

    public Map<String, Double> getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(Map<String, Double> successRate) {
        this.successRate = successRate;
    }

    public Map<String, Double> getResponseTimeTrends() {
        return responseTimeTrends;
    }

    public void setResponseTimeTrends(Map<String, Double> responseTimeTrends) {
        this.responseTimeTrends = responseTimeTrends;
    }

    public List<ServiceDailySummaryDTO> getServiceDto() {
        return serviceDto;
    }

    public void setServiceDto(List<ServiceDailySummaryDTO> serviceDto) {
        this.serviceDto = serviceDto;
    }
}
