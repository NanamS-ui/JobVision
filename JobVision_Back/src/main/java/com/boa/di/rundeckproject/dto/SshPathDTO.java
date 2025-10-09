package com.boa.di.rundeckproject.dto;

public class SshPathDTO {
    private Long id;
    private String keyStorage;
    private String keyType;
    private String sshPort;
    private String nameKeyPrivate;
    private String password;
    private String privateKeyContent;
    private String name;

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKeyStorage() {
        return keyStorage;
    }

    public void setKeyStorage(String keyStorage) {
        this.keyStorage = keyStorage;
    }

    public String getKeyType() {
        return keyType;
    }

    public void setKeyType(String keyType) {
        this.keyType = keyType;
    }

    public String getSshPort() {
        return sshPort;
    }

    public void setSshPort(String sshPort) {
        this.sshPort = sshPort;
    }

    public String getNameKeyPrivate() {
        return nameKeyPrivate;
    }

    public void setNameKeyPrivate(String nameKeyPrivate) {
        this.nameKeyPrivate = nameKeyPrivate;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPrivateKeyContent() {
        return privateKeyContent;
    }

    public void setPrivateKeyContent(String privateKeyContent) {
        this.privateKeyContent = privateKeyContent;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
