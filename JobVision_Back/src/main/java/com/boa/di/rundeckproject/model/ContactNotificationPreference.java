package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "contact_notification_preference")
public class ContactNotificationPreference implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contact_notification_preference")
    private Long id;

    @Column(name = "notify_on_failed", nullable = false)
    private Boolean notifyOnFailed = false;

    @Column(name = "notify_on_recovery", nullable = false)
    private Boolean notifyOnRecovery = false;

    @Column(name = "notify_on_success", nullable = false)
    private Boolean notifyOnSuccess = false;

    @Column(name = "notify_on_start", nullable = false)
    private Boolean notifyOnStart = false;

    @Column(name = "channel_email", nullable = false)
    private Boolean channelEmail = true;

    @Column(name = "channel_sms", nullable = false)
    private Boolean channelSms = false;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_groupe", referencedColumnName = "id_groupe")
    private Groupe groupeContact;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_contact", referencedColumnName = "id_contact")
    private Contact contact;

    // Getters & Setters

    public Boolean getNotifyOnStart() {
        return notifyOnStart;
    }

    public void setNotifyOnStart(Boolean notifyOnStart) {
        this.notifyOnStart = notifyOnStart;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Groupe getGroupeContact() {
        return groupeContact;
    }

    public void setGroupeContact(Groupe groupeContact) {
        this.groupeContact = groupeContact;
    }

    public Contact getContact() {
        return contact;
    }

    public void setContact(Contact contact) {
        this.contact = contact;
    }
}
