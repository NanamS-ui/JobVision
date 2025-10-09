package com.boa.di.rundeckproject.service.service;

import com.boa.di.rundeckproject.dto.ServiceDailySummaryDTO;
import com.boa.di.rundeckproject.dto.ServiceDetailsDTO;
import com.boa.di.rundeckproject.dto.ServiceFlatViewDTO;
import com.boa.di.rundeckproject.model.Service;

import java.sql.SQLException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ServiceService {
    Service createService(Service service);

    Optional<Service> getServiceById(Integer id);

    List<Service> getAllServices();

    Service updateService(Integer id, Service updatedService);

    void deleteService(Integer id);

    List<Service> autocompleteByName(String query);
    String getSuccessRate(String serviceName, String timeRange);
    String getResponseTimeTrends(String serviceName, String timeRange);
    Map<String, Double> parseSuccessRateAsJson(String json) throws Exception;
    Map<String, Double> parseResponseTimeTrendsAsJson(String json) throws Exception;
    List<ServiceDailySummaryDTO> getSummaries(String serviceName) throws SQLException;
    ServiceDetailsDTO buildFromFlatView(List<ServiceFlatViewDTO> flatList);
}
