package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.Contact;
import com.boa.di.rundeckproject.model.ContactNotificationPreference;
import com.boa.di.rundeckproject.model.Groupe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactNotificationPreferenceRepository extends JpaRepository<ContactNotificationPreference, Long> {
    ContactNotificationPreference findByGroupeContact_Id(Long idGroupe);
    ContactNotificationPreference findByContact_Id(Long idContact);

    @Query("""
      SELECT DISTINCT cnp.groupeContact
      FROM ContactNotificationPreference cnp
      WHERE cnp.groupeContact IS NOT NULL
        AND cnp.id NOT IN (
          SELECT nm.contactNotificationPreference.id
          FROM NotificationMy nm
          WHERE nm.job.id = :jobId
        )
      """)
    List<Groupe> findAvailableGroupesForJob(@Param("jobId") Long jobId);

    /**
     * Liste des contacts qui ont une préférence *et* qui n'ont pas encore de NotificationMy pour ce job.
     */
    @Query("""
      SELECT DISTINCT cnp.contact
      FROM ContactNotificationPreference cnp
      WHERE cnp.contact IS NOT NULL
        AND cnp.id NOT IN (
          SELECT nm.contactNotificationPreference.id
          FROM NotificationMy nm
          WHERE nm.job.id = :jobId
        )
      """)
    List<Contact> findAvailableContactsForJob(@Param("jobId") Long jobId);
}
