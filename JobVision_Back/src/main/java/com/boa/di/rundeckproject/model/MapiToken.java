package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mapi_token")
public class MapiToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_value", nullable = false)
    private String tokenValue;

    @Column(name = "last_update")
    private LocalDateTime lastUpdate;

    // Getters et setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTokenValue() { return tokenValue; }
    public void setTokenValue(String tokenValue) { this.tokenValue = tokenValue; }

    public LocalDateTime getLastUpdate() { return lastUpdate; }
    public void setLastUpdate(LocalDateTime lastUpdate) { this.lastUpdate = lastUpdate; }
}
