package com.boa.di.rundeckproject.model;

public class LogCountsResponse {
    private long totalLogs;
    private long normalCount;
    private long errorCount;
    private long warnCount;

    public LogCountsResponse() {}

    public LogCountsResponse(long totalLogs, long normalCount, long errorCount, long warnCount) {
        this.totalLogs = totalLogs;
        this.normalCount = normalCount;
        this.errorCount = errorCount;
        this.warnCount = warnCount;
    }

    // Getters et setters

    public long getTotalLogs() {
        return totalLogs;
    }

    public void setTotalLogs(long totalLogs) {
        this.totalLogs = totalLogs;
    }

    public long getNormalCount() {
        return normalCount;
    }

    public void setNormalCount(long normalCount) {
        this.normalCount = normalCount;
    }

    public long getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(long errorCount) {
        this.errorCount = errorCount;
    }

    public long getWarnCount() {
        return warnCount;
    }

    public void setWarnCount(long warnCount) {
        this.warnCount = warnCount;
    }
}