package com.boa.di.rundeckproject.model;

import com.boa.di.rundeckproject.class_enum.ServiceStatus;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "service_daily_summary")
public class ServiceDailySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_summary")
    private Long id;

    @Column(name = "date_summary")
    private LocalDate dateSummary;

    @Column(name = "total_executions")
    private Integer totalExecutions;

    @Column(name = "successful_executions")
    private Integer successfulExecutions;

    @Column(name = "avg_response_time_ms")
    private Float avgResponseTimeMs;

    @Column(name = "success_rate_percent")
    private Float successRatePercent;

    @Column(name = "error_rate_percent")
    private Float errorRatePercent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ServiceStatus status;

    @ManyToOne
    @JoinColumn(name = "id_service")
    private Service service;

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDateSummary() {
        return dateSummary;
    }

    public void setDateSummary(LocalDate dateSummary) {
        this.dateSummary = dateSummary;
    }

    public Integer getTotalExecutions() {
        return totalExecutions;
    }

    public void setTotalExecutions(Integer totalExecutions) {
        this.totalExecutions = totalExecutions;
    }

    public Integer getSuccessfulExecutions() {
        return successfulExecutions;
    }

    public void setSuccessfulExecutions(Integer successfulExecutions) {
        this.successfulExecutions = successfulExecutions;
    }

    public Float getAvgResponseTimeMs() {
        return avgResponseTimeMs;
    }

    public void setAvgResponseTimeMs(Float avgResponseTimeMs) {
        this.avgResponseTimeMs = avgResponseTimeMs;
    }

    public Float getSuccessRatePercent() {
        return successRatePercent;
    }

    public void setSuccessRatePercent(Float successRatePercent) {
        this.successRatePercent = successRatePercent;
    }

    public Float getErrorRatePercent() {
        return errorRatePercent;
    }

    public void setErrorRatePercent(Float errorRatePercent) {
        this.errorRatePercent = errorRatePercent;
    }

    public ServiceStatus getStatus() {
        return status;
    }

    public void setStatus(ServiceStatus status) {
        this.status = status;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }
}
