package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.dto.NotificationDetailDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationDetailRepository extends JpaRepository<NotificationDetailDTO, Long> {
    List<NotificationDetailDTO> findByIdContact(Long contactId);
    List<NotificationDetailDTO> findByIdGroupe(Long groupeId);
}
