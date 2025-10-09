package com.boa.di.rundeckproject.dto.dashboard;

public class StatusCount {
    private String status;
    private long count;

    public StatusCount(String status, long count) {
        this.status = status;
        this.count = count;
    }

    // getters/setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
