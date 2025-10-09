package com.boa.di.rundeckproject.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "blacklisted_tokens")
public class BlacklistedToken {

    @Id
    private String token;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    public BlacklistedToken() {}

    public BlacklistedToken(String token, LocalDateTime expiryDate) {
        this.token = token;
        this.expiryDate = expiryDate;
    }

    public String getToken() {
        return token;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }
}
