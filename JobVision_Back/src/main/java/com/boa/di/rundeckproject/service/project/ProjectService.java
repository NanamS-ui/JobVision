package com.boa.di.rundeckproject.service.project;

import com.boa.di.rundeckproject.dto.ProjectDTO;
import com.boa.di.rundeckproject.dto.ProjectStatsDTO;
import com.boa.di.rundeckproject.dto.ProjectStatsViewDTO;
import com.boa.di.rundeckproject.model.Project;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface ProjectService {
    List<Project> findAll();
    ResponseEntity<String> createProject(String name, String description, Integer idService);
    ResponseEntity<String> createProjectWithNodes(String name, String description, Integer idService, List<String> nodeNames);
    ResponseEntity<String> deleteProject(String name);
    ResponseEntity<String> getProjectByName(String projectName);
    List<Project> searchByName(String query);
    ResponseEntity<String> updateProjectConfig(String projectName, Map<String, String> newConfig);
    ProjectStatsDTO getProjectStats();
    List<ProjectStatsViewDTO> getAllProjectStatsViews();
    List<ProjectStatsViewDTO> searchProjectStatsByName(String query);
    List<ProjectDTO> getProjectsByServiceId(String idService);
}
