package com.boa.di.rundeckproject.model;
import jakarta.persistence.*;

@Entity
@Table(name = "contact_groupe")
public class ContactGroupe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_contact", nullable = false)
    private Contact contact;

    @ManyToOne
    @JoinColumn(name = "id_groupe", nullable = false)
    private Groupe groupe;

    // Getters and setters...
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Contact getContact() {
        return contact;
    }

    public void setContact(Contact contact) {
        this.contact = contact;
    }

    public Groupe getGroupe() {
        return groupe;
    }

    public void setGroupe(Groupe groupe) {
        this.groupe = groupe;
    }
}
