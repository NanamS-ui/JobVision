package com.boa.di.rundeckproject.dto.job;

public class DailyDurationDTO {
    private String date; // Format: yyyy-MM-dd
    private double averageDuration;

    public DailyDurationDTO(String date, double averageDuration) {
        this.date = date;
        this.averageDuration = averageDuration;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public double getAverageDuration() {
        return averageDuration;
    }

    public void setAverageDuration(double averageDuration) {
        this.averageDuration = averageDuration;
    }
}