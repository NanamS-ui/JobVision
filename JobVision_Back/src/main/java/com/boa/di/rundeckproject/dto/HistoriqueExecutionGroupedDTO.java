package com.boa.di.rundeckproject.dto;

import java.time.LocalDateTime;
import java.util.List;

public class HistoriqueExecutionGroupedDTO {
    private Long executionId;
    private LocalDateTime dateExecution;
    private LocalDateTime dateStarted;
    private LocalDateTime dateEnded;
    private Long duration;

    private List<NodeExecutionDTO> nodes;
    private String status;
    private boolean over;

    // === Getters / Setters ===

    public Long getExecutionId() {
        return executionId;
    }

    public void setExecutionId(Long executionId) {
        this.executionId = executionId;
    }

    public LocalDateTime getDateExecution() {
        return dateExecution;
    }

    public void setDateExecution(LocalDateTime dateExecution) {
        this.dateExecution = dateExecution;
    }

    public LocalDateTime getDateStarted() {
        return dateStarted;
    }

    public void setDateStarted(LocalDateTime dateStarted) {
        this.dateStarted = dateStarted;
    }

    public LocalDateTime getDateEnded() {
        return dateEnded;
    }

    public void setDateEnded(LocalDateTime dateEnded) {
        this.dateEnded = dateEnded;
    }

    public Long getDuration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public List<NodeExecutionDTO> getNodes() {
        return nodes;
    }

    public void setNodes(List<NodeExecutionDTO> nodes) {
        this.nodes = nodes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isOver() {
        return over;
    }

    public void setOver(boolean over) {
        this.over = over;
    }
}
