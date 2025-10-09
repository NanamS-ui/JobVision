package com.boa.di.rundeckproject.dto;

import java.util.Objects;

public class StepLogDTO {
    private String stepCtx;
    private String logMessage;
    private String status_step;  // nouveau champ

    public String getStepCtx() {
        return stepCtx;
    }

    public void setStepCtx(String stepCtx) {
        this.stepCtx = stepCtx;
    }

    public String getLogMessage() {
        return logMessage;
    }

    public void setLogMessage(String logMessage) {
        this.logMessage = logMessage;
    }

    public String getStatus() {
        return status_step;
    }

    public void setStatus(String status) {
        this.status_step = status;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StepLogDTO)) return false;
        StepLogDTO that = (StepLogDTO) o;
        return Objects.equals(stepCtx, that.stepCtx) &&
                Objects.equals(logMessage, that.logMessage) &&
                Objects.equals(status_step, that.status_step);
    }

    @Override
    public int hashCode() {
        return Objects.hash(stepCtx, logMessage, status_step);
    }
}
