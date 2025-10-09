package com.boa.di.rundeckproject.dto;

import com.boa.di.rundeckproject.model.SshPath;

import java.util.List;
import java.util.Map;

public class SshPathStatsDTO {
    private long totalKeys;
    private Map<String, Long> keyTypeMap;
    private long uniquePaths;
    private Map<String, Long> nodeCountByKeyType;
    private List<SshPath> sshPaths;

    public SshPathStatsDTO(long totalKeys, Map<String, Long> keyTypeMap, long uniquePaths) {
        this.totalKeys = totalKeys;
        this.keyTypeMap = keyTypeMap;
        this.uniquePaths = uniquePaths;
    }

    public SshPathStatsDTO(long totalKeys, Map<String, Long> keyTypeMap, long uniquePaths, Map<String, Long> nodeCountByKeyType) {
        this.totalKeys = totalKeys;
        this.keyTypeMap = keyTypeMap;
        this.uniquePaths = uniquePaths;
        this.nodeCountByKeyType = nodeCountByKeyType;
    }

    public SshPathStatsDTO(long totalKeys, Map<String, Long> keyTypeMap, long uniquePaths, Map<String, Long> nodeCountByKeyType, List<SshPath> sshPaths) {
        this.totalKeys = totalKeys;
        this.keyTypeMap = keyTypeMap;
        this.uniquePaths = uniquePaths;
        this.nodeCountByKeyType = nodeCountByKeyType;
        this.sshPaths = sshPaths;
    }

    public List<SshPath> getSshPaths() {
        return sshPaths;
    }

    public void setSshPaths(List<SshPath> sshPaths) {
        this.sshPaths = sshPaths;
    }

    // Getters & Setters
    public long getTotalKeys() {
        return totalKeys;
    }

    public void setTotalKeys(long totalKeys) {
        this.totalKeys = totalKeys;
    }

    public Map<String, Long> getKeyTypeMap() {
        return keyTypeMap;
    }

    public void setKeyTypeMap(Map<String, Long> keyTypeMap) {
        this.keyTypeMap = keyTypeMap;
    }

    public long getUniquePaths() {
        return uniquePaths;
    }

    public void setUniquePaths(long uniquePaths) {
        this.uniquePaths = uniquePaths;
    }

    public Map<String, Long> getNodeCountByKeyType() {
        return nodeCountByKeyType;
    }

    public void setNodeCountByKeyType(Map<String, Long> nodeCountByKeyType) {
        this.nodeCountByKeyType = nodeCountByKeyType;
    }
}
