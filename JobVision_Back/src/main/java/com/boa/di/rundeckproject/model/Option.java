package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "workflow_option")
public class Option {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_option")
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "required")
    private boolean required;

    @Column(name = "default_value", length = 255)
    private String defaultValue;

    @Column(name = "allowed_values", columnDefinition = "TEXT")
    private String allowedValues;

    @Column(name = "multivalued")
    private boolean multivalued;

    @Column(name = "secure")
    private boolean secure;

    @Column(name = "value_exposed")
    private boolean valueExposed;

    @Column(name = "regex", length = 255)
    private String regex;

    @ManyToOne
    @JoinColumn(name = "id_workflow", nullable = false)
    private WorkflowMy workflow;

    // Getters & Setters
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

    public WorkflowMy getWorkflow() {
        return workflow;
    }

    public void setWorkflow(WorkflowMy workflow) {
        this.workflow = workflow;
    }
}