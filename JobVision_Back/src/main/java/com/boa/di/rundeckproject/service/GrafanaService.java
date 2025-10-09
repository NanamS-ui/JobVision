package com.boa.di.rundeckproject.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GrafanaService {

    @Value("${grafana.url}")
    private String grafanaUrl;

    @Value("${grafana.apiKey}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        // Ajout du header Authorization avec Bearer token
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    public String send(String queryJson) {
        HttpEntity<String> entity = new HttpEntity<>(queryJson, createHeaders());
        ResponseEntity<String> response = restTemplate.exchange(
                grafanaUrl + "/ds/query",
                HttpMethod.POST,
                entity,
                String.class
        );
        return response.getBody();
    }
}
