package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.WorkflowStepMy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowStepMyRepository extends JpaRepository<WorkflowStepMy, Long> {
    List<WorkflowStepMy> findAllByWorkflowId(Long id);
}
