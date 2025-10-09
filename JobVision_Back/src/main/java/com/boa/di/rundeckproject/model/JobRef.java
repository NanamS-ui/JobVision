package com.boa.di.rundeckproject.model;

public class JobRef {
    private String nameRef;
    private String uuid;// Nom du job référencé
    private String group;         // Groupe du job (optionnel)

    public JobRef() {}

    public String getNameRef() {
        return nameRef;
    }

    public void setNameRef(String nameRef) {
        this.nameRef = nameRef;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

}
