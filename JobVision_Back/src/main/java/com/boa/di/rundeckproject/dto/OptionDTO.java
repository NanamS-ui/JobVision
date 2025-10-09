package com.boa.di.rundeckproject.dto;

public class OptionDTO {

    private Long id;
    private String name;
    private String description;
    private boolean required;
    private String defaultValue;
    private String allowedValues;
    private boolean multivalued;
    private boolean secure;
    private boolean valueExposed;
    private String regex;
    private Long workflowId;

    // ✅ Getters & Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }

    public String getAllowedValues() {
        return allowedValues;
    }

    public void setAllowedValues(String allowedValues) {
        this.allowedValues = allowedValues;
    }

    public boolean isMultivalued() {
        return multivalued;
    }

    public void setMultivalued(boolean multivalued) {
        this.multivalued = multivalued;
    }

    public boolean isSecure() {
        return secure;
    }

    public void setSecure(boolean secure) {
        this.secure = secure;
    }

    public boolean isValueExposed() {
        return valueExposed;
    }

    public void setValueExposed(boolean valueExposed) {
        this.valueExposed = valueExposed;
    }

    public String getRegex() {
        return regex;
    }

    public void setRegex(String regex) {
        this.regex = regex;
    }

    public Long getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(Long workflowId) {
        this.workflowId = workflowId;
    }
}