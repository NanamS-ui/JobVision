package com.boa.di.rundeckproject.dto;

public class GroupeDTO {

    private Long id;
    private String nameGroupe;
    private String description;

    public GroupeDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNameGroupe() {
        return nameGroupe;
    }

    public void setNameGroupe(String nameGroupe) {
        this.nameGroupe = nameGroupe;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
