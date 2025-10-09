package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.dto.LogCountsProjection;
import com.boa.di.rundeckproject.model.ExecutionMy;
import com.boa.di.rundeckproject.model.LogOutput;
import com.boa.di.rundeckproject.model.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LogOutputRepository extends JpaRepository<LogOutput, Long> {
    List<LogOutput> findByNode(Node node);

    @Query("SELECT l FROM LogOutput l WHERE l.node.nodename = :nodename")
    List<LogOutput> findByNodeName(@Param("nodename") String nodename);

    @Query("SELECT l from LogOutput l where l.node.id = :idnode")
    List<LogOutput> findByNode(@Param("idnode") Long idnode);
    boolean existsByStepCtxAndLogMessageAndIdExecution(String stepctx, String logMessage, ExecutionMy idExecution);

    @Query("SELECT l FROM LogOutput l WHERE l.node.nodename = :nodeName AND l.idExecution.idExecution = :executionId AND l.stepCtx = :stepCtx ORDER BY l.absoluteTime ASC")
    List<LogOutput> findByNodeNameAndExecutionIdAndStepCtx(@Param("nodeName") String nodeName,
                                                           @Param("executionId") Long executionId,
                                                           @Param("stepCtx") String stepCtx);

    @Query("SELECT l FROM LogOutput l WHERE l.idExecution.idExecution = :executionId ORDER BY l.absoluteTime ASC")
    List<LogOutput> findByExecutionId(@Param("executionId") Long executionId);

    @Query(value = """
    SELECT
        COUNT(*) AS totalLogs,
        SUM(CASE WHEN log_level = 'NORMAL' THEN 1 ELSE 0 END) AS normalCount,
        SUM(CASE WHEN log_level = 'ERROR' THEN 1 ELSE 0 END) AS errorCount,
        SUM(CASE WHEN log_level = 'WARN' THEN 1 ELSE 0 END) AS warnCount
    FROM log_output
    """, nativeQuery = true)
    LogCountsProjection getLogCounts();
}
