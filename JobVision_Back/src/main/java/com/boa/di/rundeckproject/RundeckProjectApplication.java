package com.boa.di.rundeckproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RundeckProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(RundeckProjectApplication.class, args);
    }

}
