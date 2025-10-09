package com.boa.di.rundeckproject.service.dashboard;

import com.boa.di.rundeckproject.dto.dashboard.DashboardDTO;

public interface DashboardService {
    DashboardDTO getDashboardDataByDate(String dateDebut, String dateFin) throws Exception;

    DashboardDTO getDashboardData(String timeRange) throws Exception;

    DashboardDTO getDashboardDataRecentExecution() throws Exception;
}
