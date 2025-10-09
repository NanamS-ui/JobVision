package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.HistoriqueExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriqueExecutionRepository extends JpaRepository<HistoriqueExecution, Long> {
    List<HistoriqueExecution> findTop10ByJobIdOrderByDateExecutionDesc(Long jobId);
    List<HistoriqueExecution> findByJobIdOrderByDateExecutionDesc(Long jobId);
    List<HistoriqueExecution> findByProcessedFalse();
}
