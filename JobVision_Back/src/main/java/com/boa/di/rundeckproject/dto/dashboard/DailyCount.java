package com.boa.di.rundeckproject.dto.dashboard;

public class DailyCount {
    private String date; // ISO string date, ou LocalDate si tu préfères
    private long count;
    // getters/setters

    public DailyCount(String date, long count) {
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