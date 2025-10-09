package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    @Query("SELECT c FROM Contact c WHERE c.id IN (SELECT cnp.id FROM ContactNotificationPreference cnp WHERE cnp.id IS NOT NULL)")
    List<Contact> findContactsWithDirectNotificationPreference();

    @Query("SELECT c FROM Contact c LEFT JOIN c.notificationPreference p WHERE p IS NULL")
    List<Contact> findContactsWithoutNotificationPreference();

}
