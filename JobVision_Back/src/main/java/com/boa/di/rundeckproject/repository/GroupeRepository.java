package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.Groupe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GroupeRepository extends JpaRepository<Groupe, Long> {
    @Query("SELECT g FROM Groupe g WHERE g.id IN (SELECT cnp.id FROM ContactNotificationPreference cnp)")
    List<Groupe> findGroupesWithNotificationPreference();

    // Groupes qui n'ont PAS de préférences
    @Query(value = """
        SELECT g.id_groupe, g.name_groupe, g.description, g.created_at, g.updated_at
        FROM groupe g
        LEFT JOIN contact_notification_preference cnp ON g.id_groupe = cnp.id_groupe
        WHERE cnp.id_contact_notification_preference IS NULL
""", nativeQuery = true)
    List<Groupe> findGroupesWithoutNotificationPreference();


}
