package com.boa.di.rundeckproject.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class CloudflareTunnelService {

    private final AtomicReference<String> publicUrl = new AtomicReference<>();
    private final String urlServer;

    public CloudflareTunnelService(@Value("${spring.url}") String urlServer) {
        this.urlServer = urlServer;
    }


    @PostConstruct
    public void startTunnel() {
        ProcessBuilder pb = new ProcessBuilder(
                "cloudflared", "tunnel", "--url", urlServer
        );
        pb.redirectErrorStream(true);

        try {
            Process process = pb.start();

            new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.contains("trycloudflare.com")) {
                            String url = line.replaceAll(
                                    ".*(https://[a-zA-Z0-9.-]+\\.trycloudflare\\.com).*",
                                    "$1"
                            );
                            publicUrl.set(url);
                            System.out.println("Cloudflare Tunnel disponible : " + url);
                        }
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }).start();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public String getPublicUrl() {
        return publicUrl.get();
    }
}
