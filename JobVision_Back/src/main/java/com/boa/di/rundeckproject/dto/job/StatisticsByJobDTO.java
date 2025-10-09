package com.boa.di.rundeckproject.dto.job;

import java.util.List;

public class StatisticsByJobDTO {

    // Vue d’ensemble
    private long totalExecutions;
    private double successRate;
    private double failureRate;
    private double averageDuration;
    private String lastExecutionDate;

    // Graphiques
    private List<DailyExecutionDTO> dailyExecutions; // 📆 Évolution quotidienne
    private List<StatusDistributionDTO> statusDistribution; // 🧩 Répartition par statut
    private List<DailyDurationDTO> dailyAverageDuration; // ⏳ Durée moyenne par jour
    private List<HourlyActivityDTO> hourlyActivity; // 🕒 Activité par heure

    // Getters & setters...

    public long getTotalExecutions() {
        return totalExecutions;
    }

    public void setTotalExecutions(long totalExecutions) {
        this.totalExecutions = totalExecutions;
    }

    public double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(double successRate) {
        this.successRate = successRate;
    }

    public double getFailureRate() {
        return failureRate;
    }

    public void setFailureRate(double failureRate) {
        this.failureRate = failureRate;
    }

    public double getAverageDuration() {
        return averageDuration;
    }

    public void setAverageDuration(double averageDuration) {
        this.averageDuration = averageDuration;
    }

    public String getLastExecutionDate() {
        return lastExecutionDate;
    }

    public void setLastExecutionDate(String lastExecutionDate) {
        this.lastExecutionDate = lastExecutionDate;
    }

    public List<DailyExecutionDTO> getDailyExecutions() {
        return dailyExecutions;
    }

    public void setDailyExecutions(List<DailyExecutionDTO> dailyExecutions) {
        this.dailyExecutions = dailyExecutions;
    }

    public List<StatusDistributionDTO> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(List<StatusDistributionDTO> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public List<DailyDurationDTO> getDailyAverageDuration() {
        return dailyAverageDuration;
    }

    public void setDailyAverageDuration(List<DailyDurationDTO> dailyAverageDuration) {
        this.dailyAverageDuration = dailyAverageDuration;
    }

    public List<HourlyActivityDTO> getHourlyActivity() {
        return hourlyActivity;
    }

    public void setHourlyActivity(List<HourlyActivityDTO> hourlyActivity) {
        this.hourlyActivity = hourlyActivity;
    }
}
