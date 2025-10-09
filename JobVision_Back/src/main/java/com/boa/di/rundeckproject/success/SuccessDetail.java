package com.boa.di.rundeckproject.success;

public class SuccessDetail {
    private int status;
    private String message;
    private long timestamp;
    private String path;
    private Object data;

    public SuccessDetail(int status, String message, long timestamp, String path, Object data) {
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
        this.path = path;
        this.data = data;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}

