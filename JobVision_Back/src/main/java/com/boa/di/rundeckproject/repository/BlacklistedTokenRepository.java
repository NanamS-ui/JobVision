package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, String> {
    boolean existsByToken(String token);
}