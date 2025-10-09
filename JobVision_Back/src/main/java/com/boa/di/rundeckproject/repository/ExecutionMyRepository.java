package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.dto.dashboard.RecentExecution;
import com.boa.di.rundeckproject.model.ExecutionMy;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExecutionMyRepository extends JpaRepository<ExecutionMy, Long> {
    List<ExecutionMy> getExecutionsByJobId(Long jobId);
    List<ExecutionMy> findByProcessedFalse();
    Optional<ExecutionMy> findExecutionMyByExecutionIdRundeck(Long executionId);
    @Query("""
        SELECT e FROM ExecutionMy e 
        WHERE e.job.uuid = :jobUuid 
        ORDER BY e.dateStarted DESC
    """)
    List<ExecutionMy> findLastExecutionByJobUuid(@Param("jobUuid") String jobUuid, Pageable pageable);

    @Query("SELECT e FROM ExecutionMy e WHERE e.job.id = :idJob ORDER BY e.dateStarted DESC")
    List<ExecutionMy> findTop2ByJobIdOrderByDateStartedDesc(@Param("idJob") Long idJob);

    @Query("""
    SELECT new com.boa.di.rundeckproject.dto.dashboard.RecentExecution(
        e.executionIdRundeck, e.status, e.dateStarted, e.dateEnded, e.durationMs, j.name, p.name)
    FROM ExecutionMy e
    JOIN e.job j
    JOIN j.project p
    ORDER BY e.dateStarted DESC
""")
    List<RecentExecution> findRecentExecutionDTO(Pageable pageable);

}
