package com.boa.di.rundeckproject.dto;

import com.boa.di.rundeckproject.class_enum.ServiceStatus;

import java.time.LocalDate;

public class ServiceDailySummaryDTO {

    private Long id;
    private LocalDate dateSummary;
    private Integer totalExecutions;
    private Integer successfulExecutions;
    private Float avgResponseTimeMs;
    private Float successRatePercent;
    private Float errorRatePercent;
    private ServiceStatus status;

    // Champs de la table Service
    private Integer serviceId;
    private String serviceName;
    private String serviceDescription;
    private String daysReported;

    // Constructeur sans initialisation forcée de dateSummary
    public ServiceDailySummaryDTO() {}

    public ServiceDailySummaryDTO(Long id, LocalDate dateSummary, Integer totalExecutions, Integer successfulExecutions, Float avgResponseTimeMs, Float successRatePercent, Float errorRatePercent, ServiceStatus status, Integer serviceId, String serviceName, String serviceDescription, String daysReported) {
        this.id = id;
        this.dateSummary = dateSummary;
        this.totalExecutions = totalExecutions;
        this.successfulExecutions = successfulExecutions;
        this.avgResponseTimeMs = avgResponseTimeMs;
        this.successRatePercent = successRatePercent;
        this.errorRatePercent = errorRatePercent;
        this.status = status;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.serviceDescription = serviceDescription;
        this.daysReported = daysReported;
    }

    public String getDaysReported() {
        return daysReported;
    }

    public void setDaysReported(String daysReported) {
        this.daysReported = daysReported;
    }

    // Getters & Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDateSummary() { return dateSummary; }
    public void setDateSummary(LocalDate dateSummary) { this.dateSummary = dateSummary; }

    public Integer getTotalExecutions() { return totalExecutions; }
    public void setTotalExecutions(Integer totalExecutions) {
        this.totalExecutions = (totalExecutions != null) ? totalExecutions : 0;
    }

    public Integer getSuccessfulExecutions() { return successfulExecutions; }
    public void setSuccessfulExecutions(Integer successfulExecutions) {
        this.successfulExecutions = (successfulExecutions != null) ? successfulExecutions : 0;
    }

    public Float getAvgResponseTimeMs() { return avgResponseTimeMs; }
    public void setAvgResponseTimeMs(Float avgResponseTimeMs) {
        this.avgResponseTimeMs = (avgResponseTimeMs != null) ? avgResponseTimeMs : 0.0f;
    }

    public Float getSuccessRatePercent() { return successRatePercent; }
    public void setSuccessRatePercent(Float successRatePercent) {
        this.successRatePercent = (successRatePercent != null) ? successRatePercent : 0.0f;
    }

    public Float getErrorRatePercent() { return errorRatePercent; }
    public void setErrorRatePercent(Float errorRatePercent) {
        this.errorRatePercent = (errorRatePercent != null) ? errorRatePercent : 0.0f;
    }

    public ServiceStatus getStatus() { return status; }
    public void setStatus(ServiceStatus status) {
        this.status = (status != null) ? status : ServiceStatus.UNKNOWN;
    }

    public Integer getServiceId() { return serviceId; }
    public void setServiceId(Integer serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getServiceDescription() { return serviceDescription; }
    public void setServiceDescription(String serviceDescription) { this.serviceDescription = serviceDescription; }
}
