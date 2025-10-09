package com.boa.di.rundeckproject.controller.project;

import com.boa.di.rundeckproject.dto.ProjectDTO;
import com.boa.di.rundeckproject.dto.ProjectStatsViewDTO;
import com.boa.di.rundeckproject.error.ErrorDetail;
import com.boa.di.rundeckproject.model.Project;
import com.boa.di.rundeckproject.service.project.ProjectService;
import com.boa.di.rundeckproject.success.SuccessDetail;
import com.boa.di.rundeckproject.util.MapperUtil;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        List<Project> projectList = projectService.findAll();
        List<ProjectDTO> projectDTOList = projectList.stream()
                .map(MapperUtil::toProjectDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(projectDTOList);
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestParam("projectName") String name,
                                           @RequestParam("projectDescription") String description,
                                           @RequestParam("idService") Integer idService,
                                           @RequestParam(value = "nodeNames", required = false) List<String> nodeNames,
                                           HttpServletRequest request) {
        try {
            ResponseEntity<String> response = (nodeNames == null || nodeNames.isEmpty())
                    ? projectService.createProject(name, description, idService)
                    : projectService.createProjectWithNodes(name, description, idService, nodeNames);

            if (response.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(
                        new SuccessDetail(
                                HttpStatus.CREATED.value(),
                                "Projet créé avec succès.",
                                System.currentTimeMillis(),
                                request.getRequestURI(),
                                null
                        )
                );
            } else {
                return ResponseEntity.status(response.getStatusCode()).body(new ErrorDetail(
                        response.getStatusCodeValue(),
                        "Échec de la création du projet dans Rundeck",
                        System.currentTimeMillis(),
                        "/api/projects",
                        response.getBody()
                ));
            }

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new ErrorDetail(
                    e.getStatusCode().value(),
                    "Erreur lors de la création du projet: " + e.getMessage(),
                    System.currentTimeMillis(),
                    "/api/projects",
                    e.getResponseBodyAsString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Erreur interne: " + e.getMessage(),
                    System.currentTimeMillis(),
                    "/api/projects",
                    null
            ));
        }
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<?> deleteProject(@PathVariable("name") String name) {
        try {
            ResponseEntity<String> deleteResponse = projectService.deleteProject(name);

            if (deleteResponse.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.ok("Projet supprimé avec succès.");
            } else {
                return ResponseEntity.status(deleteResponse.getStatusCode()).body(new ErrorDetail(
                        deleteResponse.getStatusCodeValue(),
                        deleteResponse.getBody(),
                        System.currentTimeMillis(),
                        "/api/projects",
                        null
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Erreur interne lors de la suppression: " + e.getMessage(),
                    System.currentTimeMillis(),
                    "/api/projects",
                    null
            ));
        }
    }

    @GetMapping("/search/{projectName}")
    public ResponseEntity<?> getProject(@PathVariable String projectName, HttpServletRequest request) {
        try {
            ResponseEntity<String> response = projectService.getProjectByName(projectName);

            if (response.getStatusCode().is2xxSuccessful()) {
                SuccessDetail success = new SuccessDetail(
                        response.getStatusCodeValue(),
                        "Projet récupéré avec succès",
                        System.currentTimeMillis(),
                        request.getRequestURI(),
                        response.getBody()
                );
                return ResponseEntity.ok(success);
            } else {
                ErrorDetail error = new ErrorDetail(
                        response.getStatusCodeValue(),
                        "Erreur lors de la récupération du projet",
                        System.currentTimeMillis(),
                        request.getRequestURI(),
                        response.getBody()
                );
                return ResponseEntity.status(response.getStatusCode()).body(error);
            }
        } catch (Exception e) {
            ErrorDetail error = new ErrorDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Une exception est survenue",
                    System.currentTimeMillis(),
                    request.getRequestURI(),
                    e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<?> autocomplete(@RequestParam("query") String query) {
        try {
            List<ProjectStatsViewDTO> result = projectService.searchProjectStatsByName(query);

            SuccessDetail success = new SuccessDetail(
                    200,
                    "Suggestions trouvées",
                    Instant.now().toEpochMilli(),
                    "/api/projects/autocomplete",
                    result
            );

            return ResponseEntity.ok(success);

        } catch (Exception e) {
            ErrorDetail error = new ErrorDetail(
                    500,
                    "Erreur pendant l'autocomplétion",
                    Instant.now().toEpochMilli(),
                    "/api/projects/autocomplete",
                    e.getMessage()
            );
            return ResponseEntity.status(500).body(error);
        }
    }


    @PostMapping("/projects/{projectName}/config")
    public ResponseEntity<?> updateProjectConfig(
            @PathVariable String projectName,
            @RequestBody Map<String, String> newConfig,
            HttpServletRequest request) {
        try {
            ResponseEntity<String> response = projectService.updateProjectConfig(projectName, newConfig);

            if (response.getStatusCode().is2xxSuccessful()) {
                SuccessDetail success = new SuccessDetail(
                        200,
                        "Configuration du projet mise à jour avec succès",
                        System.currentTimeMillis(),
                        request.getRequestURI(),
                        response.getBody()
                );
                return ResponseEntity.ok(success);
            } else {
                ErrorDetail error = new ErrorDetail(
                        response.getStatusCodeValue(),
                        "Erreur lors de la mise à jour de la configuration",
                        System.currentTimeMillis(),
                        request.getRequestURI(),
                        response.getBody()
                );
                return ResponseEntity.status(response.getStatusCode()).body(error);
            }
        } catch (Exception e) {
            ErrorDetail error = new ErrorDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Exception serveur : " + e.getMessage(),
                    System.currentTimeMillis(),
                    request.getRequestURI(),
                    e.toString()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/by-service/{idService}")
    public ResponseEntity<List<ProjectDTO>> getProjectsByService(@PathVariable String idService) {
        List<ProjectDTO> dtos = projectService.getProjectsByServiceId(idService);
        return ResponseEntity.ok(dtos);
    }
}
