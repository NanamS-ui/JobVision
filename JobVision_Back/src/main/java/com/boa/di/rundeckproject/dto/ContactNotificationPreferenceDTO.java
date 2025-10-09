package com.boa.di.rundeckproject.dto;

public class ContactNotificationPreferenceDTO {
    private Long id;
    private Boolean notifyOnFailed;
    private Boolean notifyOnRecovery;
    private Boolean notifyOnSuccess;
    private Boolean notifyOnStart;
    private Boolean channelEmail;
    private Boolean channelSms;
    private Long id_group_contact; // Integer pour nullable
    private Long id_contact;
    private ContactDTO contact;
    private GroupeDTO groupe;

    // Constructeurs

    public ContactNotificationPreferenceDTO() {}

    public ContactNotificationPreferenceDTO(Boolean notifyOnFailed, Boolean notifyOnRecovery, Boolean notifyOnSuccess,
                                            Boolean channelEmail, Boolean channelSms,
                                            Long id_group_contact, Long id_contact) {
        this.notifyOnFailed = notifyOnFailed;
        this.notifyOnRecovery = notifyOnRecovery;
        this.notifyOnSuccess = notifyOnSuccess;
        this.channelEmail = channelEmail;
        this.channelSms = channelSms;
        this.id_group_contact = id_group_contact;
        this.id_contact = id_contact;
    }

    public ContactNotificationPreferenceDTO(Boolean notifyOnFailed, Boolean notifyOnRecovery, Boolean notifyOnSuccess, Boolean channelEmail, Boolean channelSms, Long id_group_contact, Long id_contact, ContactDTO contact, GroupeDTO groupe) {
        this.notifyOnFailed = notifyOnFailed;
        this.notifyOnRecovery = notifyOnRecovery;
        this.notifyOnSuccess = notifyOnSuccess;
        this.channelEmail = channelEmail;
        this.channelSms = channelSms;
        this.id_group_contact = id_group_contact;
        this.id_contact = id_contact;
        this.contact = contact;
        this.groupe = groupe;
    }

    public ContactNotificationPreferenceDTO(Long id, Boolean notifyOnFailed, Boolean notifyOnRecovery, Boolean notifyOnSuccess, Boolean notifyOnStart, Boolean channelEmail, Boolean channelSms, Long id_group_contact, Long id_contact, ContactDTO contact, GroupeDTO groupe) {
        this.id = id;
        this.notifyOnFailed = notifyOnFailed;
        this.notifyOnRecovery = notifyOnRecovery;
        this.notifyOnSuccess = notifyOnSuccess;
        this.notifyOnStart = notifyOnStart;
        this.channelEmail = channelEmail;
        this.channelSms = channelSms;
        this.id_group_contact = id_group_contact;
        this.id_contact = id_contact;
        this.contact = contact;
        this.groupe = groupe;
    }

    public ContactNotificationPreferenceDTO(Long id, Boolean notifyOnFailed, Boolean notifyOnRecovery, Boolean notifyOnSuccess, Boolean notifyOnStart, Boolean channelEmail, Boolean channelSms) {
        this.id = id;
        this.notifyOnFailed = notifyOnFailed;
        this.notifyOnRecovery = notifyOnRecovery;
        this.notifyOnSuccess = notifyOnSuccess;
        this.notifyOnStart = notifyOnStart;
        this.channelEmail = channelEmail;
        this.channelSms = channelSms;
    }

    public Boolean getNotifyOnStart() {
        return notifyOnStart;
    }

    public void setNotifyOnStart(Boolean notifyOnStart) {
        this.notifyOnStart = notifyOnStart;
    }

    public ContactDTO getContact() {
        return contact;
    }

    public void setContact(ContactDTO contact) {
        this.contact = contact;
    }

    public GroupeDTO getGroupe() {
        return groupe;
    }

    public void setGroupe(GroupeDTO groupe) {
        this.groupe = groupe;
    }

    // Getters & Setters

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

    public Long getId_group_contact() {
        return id_group_contact;
    }

    public void setId_group_contact(Long id_group_contact) {
        this.id_group_contact = id_group_contact;
    }

    public Long getId_contact() {
        return id_contact;
    }

    public void setId_contact(Long id_contact) {
        this.id_contact = id_contact;
    }
}
