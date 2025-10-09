package com.boa.di.rundeckproject.listener;

import com.boa.di.rundeckproject.service.RundeckService;
import com.boa.di.rundeckproject.service.user_auth.UserAuthService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RundeckStarter {
    private final RundeckService rundeckService;

    public RundeckStarter(RundeckService rundeckService) {
        this.rundeckService = rundeckService;
    }

    // @PostConstruct
    // public void init() throws IOException {
    //     rundeckService.startRundeck();
    // }

    // @PreDestroy
    // public void cleanup() throws IOException {
    //     rundeckService.stopRundeck();
    // }
}