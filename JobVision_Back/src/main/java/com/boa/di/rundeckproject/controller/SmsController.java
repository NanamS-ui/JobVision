package com.boa.di.rundeckproject.controller;

import com.boa.di.rundeckproject.service.MapiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/sms")
public class SmsController {

    private final MapiService mapiService;

    public SmsController(MapiService mapiService) {
        this.mapiService = mapiService;
    }

    @PostMapping("/sendBulkSms")
    public ResponseEntity<?> sendBulkSms(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", false, "message", "Le fichier est vide"));
        }

        File tempFile = null;
        try {
            tempFile = File.createTempFile("mapi-upload-", "-" + file.getOriginalFilename());
            file.transferTo(tempFile);

            String response = mapiService.sendBulkSms(tempFile.getAbsolutePath());

            return ResponseEntity.ok(Map.of("status", true, "response", response));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("status", false, "message", "Erreur lors de l'envoi du fichier : " + e.getMessage()));
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    @PostMapping("/sendSingleSms")
    public Map<String, Object> sendSingleSms(@RequestBody Map<String, String> payload) {
        String phoneNumber = payload.get("phoneNumber");
        String message = payload.get("message");

        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return Map.of(
                    "status", false,
                    "message", "Le numéro de téléphone est obligatoire"
            );
        }

        if (message == null || message.isEmpty()) {
            return Map.of(
                    "status", false,
                    "message", "Le message est obligatoire"
            );
        }

        try {
            mapiService.sendSingleSms(phoneNumber, message);
            return Map.of(
                    "status", true,
                    "message", "SMS envoyé avec succès"
            );
        } catch (IOException e) {
            e.printStackTrace();
            return Map.of(
                    "status", false,
                    "message", "Erreur lors de l'envoi du SMS : " + e.getMessage()
            );
        }
    }
}
