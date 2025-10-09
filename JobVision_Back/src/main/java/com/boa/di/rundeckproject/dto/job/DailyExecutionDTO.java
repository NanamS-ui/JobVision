package com.boa.di.rundeckproject.dto.job;

public class DailyExecutionDTO {
    private String date; // Format: yyyy-MM-dd
    private long count;

    public DailyExecutionDTO(String date, long count) {
        this.date = date;
        this.count = count;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}