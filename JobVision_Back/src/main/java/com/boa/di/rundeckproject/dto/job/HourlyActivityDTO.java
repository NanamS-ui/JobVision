package com.boa.di.rundeckproject.dto.job;

public class HourlyActivityDTO {
    private int hour; // 0 - 23
    private long count;

    public HourlyActivityDTO(int hour, long count) {
        this.hour = hour;
        this.count = count;
    }

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}