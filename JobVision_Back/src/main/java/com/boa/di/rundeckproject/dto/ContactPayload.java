// --- dto/ContactPayload.java ---
package com.boa.di.rundeckproject.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ContactPayload {
    public Long id;
    public String nom;
    public String prenom;
    public String email;
    public String telephone;

    public List<Long> groupes;
    public List<String> nomsGroupes;
    public LocalDateTime createAt;
    public LocalDateTime updateAt;

    public ContactPayload() {
    }

    public ContactPayload(String nom, String prenom, String email, String telephone, List<Long> groupes, List<String> nomsGroupes) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.groupes = groupes;
        this.nomsGroupes = nomsGroupes;
    }

    public ContactPayload(Long id, String nom, String prenom, String email, String telephone, List<Long> groupes, List<String> nomsGroupes) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.groupes = groupes;
        this.nomsGroupes = nomsGroupes;
    }

    public ContactPayload(Long id, String nom, String prenom, String email, String telephone, List<Long> groupes, List<String> nomsGroupes, LocalDateTime createAt, LocalDateTime updateAt) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.groupes = groupes;
        this.nomsGroupes = nomsGroupes;
        this.createAt = createAt;
        this.updateAt = updateAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public List<Long> getGroupes() {
        return groupes;
    }

    public void setGroupes(List<Long> groupes) {
        this.groupes = groupes;
    }

    public List<String> getNomsGroupes() {
        return nomsGroupes;
    }

    public void setNomsGroupes(List<String> nomsGroupes) {
        this.nomsGroupes = nomsGroupes;
    }

    public LocalDateTime getCreateAt() {
        return createAt;
    }

    public void setCreateAt(LocalDateTime createAt) {
        this.createAt = createAt;
    }

    public LocalDateTime getUpdateAt() {
        return updateAt;
    }

    public void setUpdateAt(LocalDateTime updateAt) {
        this.updateAt = updateAt;
    }
}
