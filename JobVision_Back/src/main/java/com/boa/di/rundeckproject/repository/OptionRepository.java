package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {
    @Query("SELECT o FROM Option o WHERE o.workflow.job.id = :jobId")
    List<Option> findOptionsByJobId(@Param("jobId") Long jobId);

    List<Option> findAllByWorkflowId(Long id);
}
