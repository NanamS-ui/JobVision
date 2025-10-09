package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "node")
public class Node implements Serializable {
    @Id
    @Column(name = "id_node", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nodename")
    private String nodename;

    @Column(name = "hostname")
    private String hostname;

    @Column(name = "username")
    private String username;

    @Column(name = "os_family_")
    private String osFamily;

    @Column(name = "os_name_")
    private String osName;

    @Column(name = "os_arch_")
    private String osArch;

    @Column(name = "tags_")
    private String tags;

    @Column(name = "description_")
    private String description;

    @Column(name = "enabled_")
    private Boolean enabled = true;

    @Column(name = "created_at_")
    private LocalDateTime createdAt;

    @Column(name = "updated_at_")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "id_ssh_path")
    private SshPath sshPath;

    @OneToMany(mappedBy = "node")
    private List<NodeProject> nodeProjects;

    public Node() {
    }

    public Node(Long idNode, String nodename, String hostname, String username, String osFamily, String osName, String osArch, String tags, String description, Boolean enabled, LocalDateTime createdAt, LocalDateTime updatedAt, SshPath sshPath) {
        this.id = idNode;
        this.nodename = nodename;
        this.hostname = hostname;
        this.username = username;
        this.osFamily = osFamily;
        this.osName = osName;
        this.osArch = osArch;
        this.tags = tags;
        this.description = description;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.sshPath = sshPath;

    }

    // Getters et setters
    public Long getIdNode() {
        return id;
    }

    public void setIdNode(Long idNode) {
        this.id = idNode;
    }

    public String getNodename() {
        return nodename;
    }

    public void setNodename(String nodename) {
        this.nodename = nodename;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getOsFamily() {
        return osFamily;
    }

    public void setOsFamily(String osFamily) {
        this.osFamily = osFamily;
    }

    public String getOsName() {
        return osName;
    }

    public void setOsName(String osName) {
        this.osName = osName;
    }

    public String getOsArch() {
        return osArch;
    }

    public void setOsArch(String osArch) {
        this.osArch = osArch;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public SshPath getSshPath() {
        return sshPath;
    }

    public void setSshPath(SshPath sshPath) {
        this.sshPath = sshPath;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<NodeProject> getNodeProjects() {
        return nodeProjects;
    }

    public void setNodeProjects(List<NodeProject> nodeProjects) {
        this.nodeProjects = nodeProjects;
    }
}
