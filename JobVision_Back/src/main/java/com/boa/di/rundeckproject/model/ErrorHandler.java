package com.boa.di.rundeckproject.model;

import com.boa.di.rundeckproject.class_enum.HandlerType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "errorhandler")
public class ErrorHandler {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_errorhandler")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_job", nullable = false)
    private Job job;

    @OneToOne
    @JoinColumn(name = "id_workflow_step_my", nullable = false)
    private WorkflowStepMy step;

    @Enumerated(EnumType.STRING)
    @Column(name = "handler_type", nullable = false, length = 50)
    private HandlerType handlerType;

    @Lob
    @Column(name = "handler_command")
    private String handlerCommand;

    @Column(name = "handler_description", length = 255)
    private String handlerDescription;

    @Column(name = "continue_on_error")
    private Boolean continueOnError = false;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    // --- getters et setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public WorkflowStepMy getStep() {
        return step;
    }

    public void setStep(WorkflowStepMy step) {
        this.step = step;
    }

    public HandlerType getHandlerType() {
        return handlerType;
    }

    public void setHandlerType(HandlerType handlerType) {
        this.handlerType = handlerType;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getHandlerCommand() {
        return handlerCommand;
    }

    public void setHandlerCommand(String handlerCommand) {
        this.handlerCommand = handlerCommand;
    }

    public String getHandlerDescription() {
        return handlerDescription;
    }

    public void setHandlerDescription(String handlerDescription) {
        this.handlerDescription = handlerDescription;
    }

    public Boolean getContinueOnError() {
        return continueOnError;
    }

    public void setContinueOnError(Boolean continueOnError) {
        this.continueOnError = continueOnError;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
