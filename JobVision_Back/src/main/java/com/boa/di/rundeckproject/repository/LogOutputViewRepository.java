package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.dto.LogOutputViewDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface LogOutputViewRepository extends JpaRepository<LogOutputViewDTO, Long> {

    @Query(value = """
    SELECT 
        lo.id_log_output AS idLogOutput,
        lo.log_message AS logMessage,
        lo.log_level AS logLevel,
        lo.step_ctx AS stepCtx,
        lo.step_number AS stepNumber,
        lo.created_at_ AS createdAt,
        lo.absolute_time AS absoluteTime,
        lo.local_time AS `localTime`,
        lo.id_execution AS idExecution,
        lo.user_ AS user,
        lo.id_node AS idNode,
        lo.nodename AS nodename,
        lo.hostname AS hostname,
        lo.id_job AS idJob,
        lo.job_name AS jobName,
        lo.job_description AS jobDescription
    FROM log_output_view lo
        WHERE job_deleted = false
    ORDER BY lo.created_at_ DESC
    LIMIT 10
    """, nativeQuery = true)
    List<Map<String, Object>> findRecentLogsRaw();

    @Query(value = """
    SELECT 
        lo.id_log_output AS idLogOutput,
        lo.log_message AS logMessage,
        lo.log_level AS logLevel,
        lo.step_ctx AS stepCtx,
        lo.step_number AS stepNumber,
        lo.created_at_ AS createdAt,
        lo.absolute_time AS absoluteTime,
        lo.local_time AS `localTime`,
        lo.id_execution AS idExecution,
        lo.user_ AS user,
        lo.id_node AS idNode,
        lo.nodename AS nodename,
        lo.hostname AS hostname,
        lo.id_job AS idJob,
        lo.job_name AS jobName,
        lo.job_description AS jobDescription
    FROM log_output_view lo
    WHERE (:logLevel IS NULL OR lo.log_level = :logLevel)
      AND (:user IS NULL OR LOWER(lo.user_) LIKE LOWER(CONCAT('%', :user, '%')))
      AND (:jobName IS NULL OR LOWER(lo.job_name) = LOWER(:jobName))
      AND (:hostname IS NULL OR lo.nodename = :hostname)
      AND (:startDate IS NULL OR lo.created_at_ >= :startDate)
      AND (:endDate IS NULL OR lo.created_at_ <= :endDate)
      AND job_deleted = false
    ORDER BY lo.created_at_ DESC
    """, nativeQuery = true)
    List<Map<String, Object>> searchLogsRaw(
            @Param("logLevel") String logLevel,
            @Param("user") String user,
            @Param("jobName") String jobName,
            @Param("hostname") String hostname,
            @Param("startDate") java.sql.Timestamp startDate,
            @Param("endDate") java.sql.Timestamp endDate
    );
}
