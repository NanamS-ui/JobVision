package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "ssh_path")
public class SshPath implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ssh_path", nullable = false)
    private Long id;

    @Column(name = "key_storage", nullable = false, length = 50)
    private String keyStorage;

    @Column(name = "key_type", nullable = false, length = 50)
    private String keyType;

    @Column(name = "ssh_port", length = 255)
    private String sshPort;

    @Column(name = "name_key_private", length = 255)
    private String nameKeyPrivate;

    @Column(name = "password", length = 50)
    private String password;

    @Column(name = "private_key_content")
    private String privateKeyContent;

    @Column(name = "name", length = 255)
    private String name;

    @Transient
    private String yamlStorageKey;

    public SshPath() {
    }

    public SshPath(Long idSshPath, String keyStorage, String keyType, String sshPort, String nameKeyPrivate) {
        this.id = idSshPath;
        this.keyStorage = keyStorage;
        this.keyType = keyType;
        this.sshPort = sshPort;
        this.nameKeyPrivate = nameKeyPrivate;
    }

    public SshPath(Long idSshPath, String keyStorage, String keyType, String sshPort, String nameKeyPrivate, String password) {
        this.id = idSshPath;
        this.keyStorage = keyStorage;
        this.keyType = keyType;
        this.sshPort = sshPort;
        this.nameKeyPrivate = nameKeyPrivate;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdSshPath() {
        return id;
    }

    public void setIdSshPath(Long idSshPath) {
        this.id = idSshPath;
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

    public String getYamlStorageKey() {
        return yamlStorageKey;
    }
    public void setYamlStorageKey(String yamlStorageKey) {
        this.yamlStorageKey = yamlStorageKey;
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