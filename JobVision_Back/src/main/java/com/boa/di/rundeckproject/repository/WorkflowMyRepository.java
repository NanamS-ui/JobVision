package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.Job;
import com.boa.di.rundeckproject.model.WorkflowMy;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkflowMyRepository extends JpaRepository<WorkflowMy, Long> {
    WorkflowMy findByJob(Job existingJob);
    @Modifying
    @Transactional
    @Query("DELETE FROM WorkflowMy w WHERE w.id = :id")
    void deleteWorkflowById(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM workflow_my WHERE id_workflow = :id", nativeQuery = true)
    void deleteWorkflowNative(@Param("id") Long id);
}
