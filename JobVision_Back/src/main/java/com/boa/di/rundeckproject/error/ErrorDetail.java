package com.boa.di.rundeckproject.error;

import org.springframework.http.HttpStatus;

public class ErrorDetail {
    private int status;
    private String message;
    private long timestamp;
    private String path;
    private String detail;

    public ErrorDetail() {
    }

    // Constructeur
    public ErrorDetail(int status, String message, long timestamp, String path, String detail) {
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
        this.path = path;
        this.detail = detail;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    // Getters
    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public String getPath() {
        return path;
    }

    public String getDetail() {
        return detail;
    }

    // Méthode utilitaire pour obtenir le texte du statut HTTP
    public String getStatusText() {
        return HttpStatus.valueOf(status).getReasonPhrase();
    }
}
