package com.boa.di.rundeckproject.service;

import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.Map;

@Service
public class RundeckService {

    private final String token;
    private final String apiUrl;
    private final RestTemplate restTemplate;
    private Process rundeckProcess;
    private final Path pidFile = Paths.get("rundeck.pid");
    @Value("${rundeck.war.file}")
    private String warFilePath;

    public RundeckService(
            @Value("${rundeck.api.token}") String token,
            @Value("${rundeck.api.url}") String apiUrl
    ) {
        this.token = token;
        this.apiUrl = apiUrl;
        this.restTemplate = new RestTemplate();
    }

    public String getToken() {
        return token;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public RestTemplate getRestTemplate() {
        return restTemplate;
    }

    public HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Rundeck-Auth-Token", token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        return headers;
    }

    public String buildUrl(String path) {
        return apiUrl.endsWith("/") ? apiUrl + path : apiUrl + "/" + path;
    }

    public <T> ResponseEntity<T> get(String path, Class<T> responseType) {
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        return restTemplate.exchange(buildUrl(path), HttpMethod.GET, entity, responseType);
    }

    public <T> ResponseEntity<T> post(String path, Object body, Class<T> responseType) {
        HttpEntity<Object> entity = new HttpEntity<>(body, createHeaders());
        return restTemplate.exchange(buildUrl(path), HttpMethod.POST, entity, responseType);
    }

    public <T> ResponseEntity<T> send(String path, HttpMethod method, Object body, Class<T> responseType) {
        HttpEntity<Object> entity = new HttpEntity<>(body, createHeaders());
        return restTemplate.exchange(buildUrl(path), method, entity, responseType);
    }

    public <T> ResponseEntity<T> delete(String path, Class<T> responseType) {
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        return restTemplate.exchange(buildUrl(path), HttpMethod.DELETE, entity, responseType);
    }

    public <T> ResponseEntity<T> send(String path, HttpMethod method, HttpEntity<?> requestEntity, Class<T> responseType) {
        String url = apiUrl + "/" + path;
        return restTemplate.exchange(url, method, requestEntity, responseType);
    }

    public void startRundeck() throws IOException {
        ProcessBuilder builder = new ProcessBuilder("java", "-jar", warFilePath);
        builder.redirectOutput(ProcessBuilder.Redirect.INHERIT);
        builder.redirectError(ProcessBuilder.Redirect.INHERIT);
        this.rundeckProcess = builder.start();
        long pid = rundeckProcess.pid();

        Files.writeString(pidFile, String.valueOf(pid), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        System.out.println("Rundeck lancé avec PID : " + pid);
    }

    public void stopRundeck() throws IOException {
        if (Files.exists(pidFile)) {
            String pidStr = Files.readString(pidFile).trim();
            if (!pidStr.isEmpty()) {
                try {
                    long pid = Long.parseLong(pidStr);
                    Runtime.getRuntime().exec("taskkill /PID " + pid + " /F");
                    System.out.println("Rundeck arrêté avec PID : " + pid);
                    Files.delete(pidFile);
                } catch (NumberFormatException e) {
                    System.err.println("PID invalide dans le fichier: " + pidStr);
                }
            }
        } else {
            System.out.println("Pas de fichier PID trouvé, impossible d'arrêter Rundeck proprement.");
        }
    }

}
