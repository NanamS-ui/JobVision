package com.boa.di.rundeckproject.controller.project;

import com.boa.di.rundeckproject.dto.ProjectStatsDTO;
import com.boa.di.rundeckproject.service.project.ProjectService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects/stats")
public class ProjectStatsController {
    private final ProjectService projectStatsService;

    public ProjectStatsController(ProjectService projectStatsService) {
        this.projectStatsService = projectStatsService;
    }

    @GetMapping()
    public ProjectStatsDTO getProjectStats() {
        return projectStatsService.getProjectStats();
    }
}
