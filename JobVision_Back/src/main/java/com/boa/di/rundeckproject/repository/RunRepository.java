package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.Run;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RunRepository extends JpaRepository<Run, Long> {
    Run findByExecutionId(Long executionId);
}
