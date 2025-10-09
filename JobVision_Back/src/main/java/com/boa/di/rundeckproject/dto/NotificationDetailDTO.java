package com.boa.di.rundeckproject.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notification_details_view")
public class NotificationDetailDTO {
    @Id
    @Column(name = "id_contact_notification_preference") // clé primaire de la vue
    private Long idContactNotificationPreference;

    @Column(name = "id_contact")
    private Long idContact;

    @Column(name = "contact_nom")
    private String contactNom;

    @Column(name = "contact_prenom")
    private String contactPrenom;

    @Column(name = "email")
    private String email;

    @Column(name = "telephone")
    private String telephone;

    @Column(name = "id_groupe")
    private Long idGroupe;

    @Column(name = "name_groupe")
    private String nameGroupe;

    @Column(name = "groupe_description")
    private String groupeDescription;

    @Column(name = "notify_on_failed")
    private Boolean notifyOnFailed;

    @Column(name = "notify_on_recovery")
    private Boolean notifyOnRecovery;

    @Column(name = "notify_on_success")
    private Boolean notifyOnSuccess;

    @Column(name = "notify_on_start")
    private Boolean notifyOnStart;

    @Column(name = "channel_email")
    private Boolean channelEmail;

    @Column(name = "channel_sms")
    private Boolean channelSms;

    @Column(name = "type_preference")
    private String typePreference;

    public Long getIdContactNotificationPreference() {
        return idContactNotificationPreference;
    }

    public void setIdContactNotificationPreference(Long idContactNotificationPreference) {
        this.idContactNotificationPreference = idContactNotificationPreference;
    }

    public Long getIdContact() {
        return idContact;
    }

    public void setIdContact(Long idContact) {
        this.idContact = idContact;
    }

    public String getContactNom() {
        return contactNom;
    }

    public void setContactNom(String contactNom) {
        this.contactNom = contactNom;
    }

    public String getContactPrenom() {
        return contactPrenom;
    }

    public void setContactPrenom(String contactPrenom) {
        this.contactPrenom = contactPrenom;
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

    public Long getIdGroupe() {
        return idGroupe;
    }

    public void setIdGroupe(Long idGroupe) {
        this.idGroupe = idGroupe;
    }

    public String getNameGroupe() {
        return nameGroupe;
    }

    public void setNameGroupe(String nameGroupe) {
        this.nameGroupe = nameGroupe;
    }

    public String getGroupeDescription() {
        return groupeDescription;
    }

    public void setGroupeDescription(String groupeDescription) {
        this.groupeDescription = groupeDescription;
    }

    public Boolean getNotifyOnFailed() {
        return notifyOnFailed;
    }

    public void setNotifyOnFailed(Boolean notifyOnFailed) {
        this.notifyOnFailed = notifyOnFailed;
    }

    public Boolean getNotifyOnRecovery() {
        return notifyOnRecovery;
    }

    public void setNotifyOnRecovery(Boolean notifyOnRecovery) {
        this.notifyOnRecovery = notifyOnRecovery;
    }

    public Boolean getNotifyOnSuccess() {
        return notifyOnSuccess;
    }

    public void setNotifyOnSuccess(Boolean notifyOnSuccess) {
        this.notifyOnSuccess = notifyOnSuccess;
    }

    public Boolean getNotifyOnStart() {
        return notifyOnStart;
    }

    public void setNotifyOnStart(Boolean notifyOnStart) {
        this.notifyOnStart = notifyOnStart;
    }

    public Boolean getChannelEmail() {
        return channelEmail;
    }

    public void setChannelEmail(Boolean channelEmail) {
        this.channelEmail = channelEmail;
    }

    public Boolean getChannelSms() {
        return channelSms;
    }

    public void setChannelSms(Boolean channelSms) {
        this.channelSms = channelSms;
    }

    public String getTypePreference() {
        return typePreference;
    }

    public void setTypePreference(String typePreference) {
        this.typePreference = typePreference;
    }
}
