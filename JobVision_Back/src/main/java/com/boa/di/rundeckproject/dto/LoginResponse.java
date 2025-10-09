package com.boa.di.rundeckproject.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private String token; // optionnel, si tu arrives à récupérer la session

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public LoginResponse(boolean success, String message, String token) {
        this.success = success;
        this.message = message;
        this.token = token;
    }

    // getters et setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSessionId() { return token; }
    public void setSessionId(String token) { this.token = token; }
}
