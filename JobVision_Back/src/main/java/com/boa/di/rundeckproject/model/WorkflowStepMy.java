package com.boa.di.rundeckproject.model;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workflowstep_my")
public class WorkflowStepMy implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_workflow_step_my")
    private Long id;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "plugin_type", length = 100)
    private String pluginType;

    @Column(name = "command", columnDefinition = "TEXT")
    private String command;

    @Column(name = "node_step")
    private Boolean nodeStep = true;

    @Column(name = "keepgoing_on_success")
    private Boolean keepgoingOnSuccess = true;

    @Column(name = "keepgoing_on_failure", length = 50)
    private String keepgoingOnFailure = "FALSE";

    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "script", columnDefinition = "TEXT")
    private String script;

    @Column(name = "script_type", length = 20)
    private String scriptType;

    @Column(name = "args", length = 50)
    private String args;

    @Column(name = "file_path", columnDefinition = "TEXT")
    private String filePath;

    @Column(name = "interpreter")
    private String interpreter;

    @Column(name = "job_ref")
    private String jobRef;

    @ManyToOne
    @JoinColumn(name = "id_workflow", nullable = false)
    private WorkflowMy workflow;

    @OneToOne(mappedBy = "step", cascade = CascadeType.ALL, orphanRemoval = true)
    private ErrorHandler errorHandler;

    @Transient
    private JobRef jobRef_;

    public WorkflowStepMy() {
    }


    public ErrorHandler getErrorHandler() {
        return errorHandler;
    }

    public void setErrorHandler(ErrorHandler errorHandler) {
        this.errorHandler = errorHandler;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(Integer stepNumber) {
        this.stepNumber = stepNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPluginType() {
        return pluginType;
    }

    public void setPluginType(String pluginType) {
        this.pluginType = pluginType;
    }

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }

    public Boolean getNodeStep() {
        return nodeStep;
    }

    public void setNodeStep(Boolean nodeStep) {
        this.nodeStep = nodeStep;
    }

    public Boolean getKeepgoingOnSuccess() {
        return keepgoingOnSuccess;
    }

    public void setKeepgoingOnSuccess(Boolean keepgoingOnSuccess) {
        this.keepgoingOnSuccess = keepgoingOnSuccess;
    }

    public String getKeepgoingOnFailure() {
        return keepgoingOnFailure;
    }

    public void setKeepgoingOnFailure(String keepgoingOnFailure) {
        this.keepgoingOnFailure = keepgoingOnFailure;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getScript() {
        return script;
    }

    public void setScript(String script) {
        this.script = script;
    }

    public String getScriptType() {
        return scriptType;
    }

    public void setScriptType(String scriptType) {
        this.scriptType = scriptType;
    }

    public String getArgs() {
        return args;
    }

    public void setArgs(String args) {
        this.args = args;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getInterpreter() {
        return interpreter;
    }

    public void setInterpreter(String interpreter) {
        this.interpreter = interpreter;
    }

    public WorkflowMy getWorkflow() {
        return workflow;
    }

    public void setWorkflow(WorkflowMy workflow) {
        this.workflow = workflow;
    }

    public String getJobRef() {
        return jobRef;
    }

    public void setJobRef(String jobRef) {
        this.jobRef = jobRef;
    }

    public JobRef getJobRef_() {
        return jobRef_;
    }

    public void setJobRef_(JobRef jobRef_) {
        this.jobRef_ = jobRef_;
    }
}