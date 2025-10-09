package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.NotificationLogDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationLogDetailsRepository extends JpaRepository<NotificationLogDetails, Long> {

    @Query(value = """
        SELECT n FROM NotificationLogDetails n
        WHERE (:jobId IS NULL OR n.jobId = :jobId)
          AND (:contactId IS NULL OR n.contactId = :contactId)
          AND (:groupeId IS NULL OR n.groupeId = :groupeId)
          AND (:typeNotification IS NULL OR n.typeNotification = :typeNotification)
          AND (:startDate IS NULL OR n.sentAt >= :startDate)
          AND (:endDate IS NULL OR n.sentAt <= :endDate)
        ORDER BY n.sentAt DESC
    """,
           countQuery = """
        SELECT COUNT(n) FROM NotificationLogDetails n
        WHERE (:jobId IS NULL OR n.jobId = :jobId)
          AND (:contactId IS NULL OR n.contactId = :contactId)
          AND (:groupeId IS NULL OR n.groupeId = :groupeId)
          AND (:typeNotification IS NULL OR n.typeNotification = :typeNotification)
          AND (:startDate IS NULL OR n.sentAt >= :startDate)
          AND (:endDate IS NULL OR n.sentAt <= :endDate)
    """)
    Page<NotificationLogDetails> searchLogs(
            @Param("jobId") Long jobId,
            @Param("contactId") Long contactId,
            @Param("groupeId") Long groupeId,
            @Param("typeNotification") String typeNotification,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    List<NotificationLogDetails> findTop10ByOrderBySentAtDesc();
}
