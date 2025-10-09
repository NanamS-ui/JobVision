package com.boa.di.rundeckproject.dto;

public class NodeNameDTO {
    private String nodename;
    private String hostname;

    public NodeNameDTO(String nodename, String hostname) {
        this.nodename = nodename;
        this.hostname = hostname;
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
}
