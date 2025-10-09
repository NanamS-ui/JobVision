package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Project findProjectByNameAndDescription(String name, String description);
    List<Project> findByNameContainingIgnoreCase(String name);
    @Query(value = "SELECT COUNT(*) FROM project", nativeQuery = true)
    long getTotalProjects();
    @Query(value = "SELECT COUNT(*) FROM execution_my", nativeQuery = true)
    long getTotalExecutions();
    @Query(value = """
        SELECT ROUND(SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2)
        FROM execution_my
    """, nativeQuery = true)
    double getSuccessRate();
    @Query(value = """
        SELECT ROUND(AVG(duration_ms) / 1000.0, 2)
        FROM execution_my
        WHERE duration_ms IS NOT NULL
    """, nativeQuery = true)
    double getAverageExecutionDuration();

    @Query(value = """
    SELECT 
        (SUM(CASE WHEN e.status = 'succeeded' THEN 1 ELSE 0 END) * 100.0 / COUNT(e.id_execution)) AS success_rate
    FROM 
        project p
    JOIN 
        job j ON j.id_project = p.id
    LEFT JOIN 
        execution_my e ON e.id_job = j.id_job
    WHERE 
        p.id = :projectId
    GROUP BY 
        p.id
""", nativeQuery = true)
    Double calculateSuccessRateForProject(@Param("projectId") Long projectId);

    Project findProjectById(Long id);
    Project findProjectByName(String name);

    List<Project> findByService_Name(String serviceName);
}