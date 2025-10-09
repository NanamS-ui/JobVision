package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.dto.JobNameDTO;
import com.boa.di.rundeckproject.model.Job;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    Optional<Job> findJobByUuid(String uuid);

    Optional<Job> findJobByName(String name);
    List<Job> findByNameContainingIgnoreCase(String name);
    @Query(value = """
    SELECT * FROM job 
    WHERE id_project = :projectId 
    AND is_deleted = false
    ORDER BY created_at DESC 
    LIMIT 2
""", nativeQuery = true)
    List<Job> findTop2RecentJobsByProjectId(@Param("projectId") Long projectId);

    // Total jobs count
    @Query(value = "SELECT COUNT(*) FROM job WHERE is_deleted = false", nativeQuery = true)
    int countTotalJobs();

    // Running jobs count (jobs avec exécution en cours)
    @Query(value = "SELECT COUNT(DISTINCT e.id_job) " +
            "FROM execution_my e " +
            "JOIN job j ON e.id_job = j.id_job " +
            "WHERE e.status = 'running' " +
            "AND j.is_deleted = false",
            nativeQuery = true)
    int countRunningJobs();


    @Query(value = """
        SELECT COUNT(*) FROM job WHERE id_job NOT IN (
            SELECT DISTINCT id_job FROM execution_my WHERE status = 'running'
        )
    """, nativeQuery = true)
    int countPendingJobs();

    @Query(value = """
    SELECT COUNT(*) FROM (
        SELECT em.id_job
        FROM execution_my em
        INNER JOIN (
            SELECT id_job, MAX(date_started) AS latest
            FROM execution_my
            GROUP BY id_job
        ) latest_exec ON em.id_job = latest_exec.id_job AND em.date_started = latest_exec.latest
        WHERE em.status = 'running'
    ) AS last_running_jobs
    """, nativeQuery = true)
    int countJobsLastExecutionRunning();

    @Query(value = """
    SELECT COUNT(*) FROM (
        SELECT em.id_job
        FROM execution_my em
        INNER JOIN (
            SELECT id_job, MAX(date_started) AS latest
            FROM execution_my
            GROUP BY id_job
        ) latest_exec ON em.id_job = latest_exec.id_job AND em.date_started = latest_exec.latest
        INNER JOIN job j ON em.id_job = j.id_job
        WHERE em.status = 'succeeded'
          AND j.is_deleted = false
    ) AS last_succeeded_jobs
    """, nativeQuery = true)
    int countJobsLastExecutionSucceeded();

    @Query(value = """
    SELECT COUNT(*) FROM (
        SELECT em.id_job
        FROM execution_my em
        INNER JOIN (
            SELECT id_job, MAX(date_started) AS latest
            FROM execution_my
            GROUP BY id_job
        ) latest_exec ON em.id_job = latest_exec.id_job AND em.date_started = latest_exec.latest
        INNER JOIN job j ON em.id_job = j.id_job
        WHERE em.status = 'failed'
          AND j.is_deleted = false
    ) AS last_failed_jobs
    """, nativeQuery = true)
    int countJobsLastExecutionFailed();


    @Query("SELECT j FROM Job j WHERE j.priority = true AND j.isDeleted = false ")
    List<Job> findPriorityJobs();

    @Query("SELECT new com.boa.di.rundeckproject.dto.JobNameDTO(j.name, j.id) FROM Job j")
    List<JobNameDTO> findAllJobNames();

    @Query("SELECT new com.boa.di.rundeckproject.dto.JobNameDTO(j.name, j.id) FROM Job j WHERE j.isDeleted = false")
    List<JobNameDTO> findAllJobNamesNotDeleted();
}
