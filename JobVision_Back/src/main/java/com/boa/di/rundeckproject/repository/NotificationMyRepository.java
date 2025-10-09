package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.NotificationMy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationMyRepository extends JpaRepository<NotificationMy, Long> {
    // Ajoute ici des méthodes spécifiques si besoin
    List<NotificationMy> findByJob_IdAndIsEnabledTrue(Long jobId);
    List<NotificationMy> findByJob_Id(Long jobId);
}
