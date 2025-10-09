package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.Contact;
import com.boa.di.rundeckproject.model.ContactGroupe;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContactGroupeRepository extends JpaRepository<ContactGroupe, Long> {
    @Transactional
    @Modifying
    @Query("DELETE FROM ContactGroupe cg WHERE cg.contact.id = :contactId")
    void deleteByContactId(@Param("contactId") Long contactId);
    List<ContactGroupe> findByContact(Contact contact);

    List<ContactGroupe> findByGroupe_Id(Long idGroupe);
}
