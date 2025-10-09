package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.MapiToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MapiTokenRepository extends JpaRepository<MapiToken, Long> {
}
