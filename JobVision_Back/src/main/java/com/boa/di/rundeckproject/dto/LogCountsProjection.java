package com.boa.di.rundeckproject.dto;

public interface LogCountsProjection {
    long getTotalLogs();
    long getNormalCount();
    long getErrorCount();
    long getWarnCount();
}