package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByJobId(Long jobId);
    List<NotificationLog> findByContactNotificationPreferenceId(Long contactNotificationPreferenceId);
    List<NotificationLog> findByIsSentFalse();

}
