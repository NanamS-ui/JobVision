package com.boa.di.rundeckproject.controller;

import com.boa.di.rundeckproject.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;


    @Autowired
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }
}
