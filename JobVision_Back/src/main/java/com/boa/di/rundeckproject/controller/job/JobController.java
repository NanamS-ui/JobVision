package com.boa.di.rundeckproject.controller.job;

import com.boa.di.rundeckproject.dto.*;
import com.boa.di.rundeckproject.error.ErrorDetail;
import com.boa.di.rundeckproject.model.Job;
import com.boa.di.rundeckproject.model.Node;
import com.boa.di.rundeckproject.model.NodeProject;
import com.boa.di.rundeckproject.repository.JobRepository;
import com.boa.di.rundeckproject.repository.NodeRepository;
import com.boa.di.rundeckproject.service.job.JobService;
import com.boa.di.rundeckproject.service.node.NodeService;
import com.boa.di.rundeckproject.success.SuccessDetail;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.PathResource;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService jobService;
    private final JobRepository jobRepository;
    private final NodeService nodeService;
    private final NodeRepository nodeRepository;

    @Autowired
    public JobController(JobService jobService, JobRepository jobRepository, NodeService nodeService, NodeRepository nodeRepository) {
        this.jobService = jobService;
        this.jobRepository = jobRepository;
        this.nodeService = nodeService;
        this.nodeRepository = nodeRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllJobs(HttpServletRequest request) {
        String path = request.getRequestURI();

        try {
            List<Job> jobs = jobRepository.findAll();
            List<JobDTO> jobDTOs = new ArrayList<>();

            for (Job job : jobs) {
                jobDTOs.add(jobService.getJobDetails(job));
            }

            SuccessDetail success = new SuccessDetail(
                    200,
                    "Liste des jobs récupérée avec succès",
                    System.currentTimeMillis(),
                    path,
                    jobDTOs
            );

            return ResponseEntity.ok(success);

        } catch (Exception ex) {
            ErrorDetail error = new ErrorDetail(
                    500,
                    "Erreur lors de la récupération des jobs",
                    System.currentTimeMillis(),
                    path,
                    ex.getMessage()
            );

            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobRequestDTO requestDto, HttpServletRequest request) {
        try {
            Job job = requestDto.getJob();
            List<Node> nodes = requestDto.getNodes();

            ResponseEntity<String> response = jobService.createJob(job, nodes);

            int status = response.getStatusCodeValue();
            String message = response.getStatusCode().is2xxSuccessful() ? "Job created successfully" : "Failed to create job";

            if (response.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.status(status).body(new SuccessDetail(
                        status, message, System.currentTimeMillis(), request.getRequestURI(), response.getBody()));
            } else {
                return ResponseEntity.status(status).body(new ErrorDetail(
                        status, message, System.currentTimeMillis(), request.getRequestURI(), response.getBody()));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "An unexpected error occurred",
                    System.currentTimeMillis(),
                    request.getRequestURI(),
                    e.getMessage()));
        }
    }


    @PutMapping("/update")
    public ResponseEntity<String> updateJob(@Param("idJob") Long idJob, @RequestBody JobRequestDTO jobRequestDTO) {
        Job job = jobRequestDTO.getJob();
        List<Node> nodes = jobRequestDTO.getNodes();

        return jobService.updateJob(idJob,job, nodes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJobForUpdate(@PathVariable Long id) {
        return jobService.getJobById(id);
    }

    @GetMapping("/details-job/{id}")
    public ResponseEntity<JobDTO> getJobDetails(@PathVariable Long id) {
        try {
            JobDTO dto = jobService.getJobDetailsById(id);
            return ResponseEntity.ok(dto);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/{id}/run")
    public ResponseEntity<?> runJobWithOptions(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> options,
            HttpServletRequest request
    ) {
        if (options == null) {
            options = Map.of();
        }

        try {
            ResponseEntity<String> response = jobService.runJob(id, options);

            if (response.getStatusCode().is2xxSuccessful()) {
                SuccessDetail success = new SuccessDetail(
                        response.getStatusCodeValue(),
                        "Job exécuté avec succès",
                        System.currentTimeMillis(),
                        request.getRequestURI(),
                        response.getBody()
                );
                return ResponseEntity.ok(success);
            } else {
                ErrorDetail error = new ErrorDetail(
                        response.getStatusCodeValue(),
                        "Échec de l’exécution du job",
                        System.currentTimeMillis(),
                        request.getRequestURI(),
                        response.getBody()
                );
                return ResponseEntity.status(response.getStatusCode()).body(error);
            }

        } catch (Exception ex) {
            ErrorDetail error = new ErrorDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Erreur lors de l’exécution du job",
                    System.currentTimeMillis(),
                    request.getRequestURI(),
                    ex.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/{executionId}/stop")
    public ResponseEntity<String> stopJob(@PathVariable Long executionId) {
        return jobService.stopJob(executionId);
    }

    @DeleteMapping("/delete-job/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id) {
        try {
            return jobService.deleteJob(id); // délègue au service
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression du job : " + ex.getMessage());
        }
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<JobStatsListDTO>> autocompleteJobs(@RequestParam String query) {
        List<JobStatsListDTO> results = jobService.autocompleteJobs(query);
        return ResponseEntity.ok(results);
    }
    @GetMapping("/uuid/{uuid}")
    public ResponseEntity<?> getJobByUuid(@PathVariable String uuid, HttpServletRequest request) {
        String path = request.getRequestURI();

        try {
            JobDTO jobDTO = jobService.getJobByUuid(uuid);

            SuccessDetail success = new SuccessDetail(
                    200,
                    "Job récupéré avec succès",
                    System.currentTimeMillis(),
                    path,
                    jobDTO
            );

            return ResponseEntity.ok(success);

        } catch (EntityNotFoundException e) {
            ErrorDetail error = new ErrorDetail(
                    404,
                    "Job non trouvé",
                    System.currentTimeMillis(),
                    path,
                    e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);

        } catch (Exception ex) {
            ErrorDetail error = new ErrorDetail(
                    500,
                    "Erreur lors de la récupération du job",
                    System.currentTimeMillis(),
                    path,
                    ex.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}/details/response")
    public ResponseEntity<JobDetailDTO> getJobDetailsResponse(@PathVariable Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        JobDetailDTO detail = jobService.getJobDetailsResponse(job);
        return ResponseEntity.ok(detail);
    }

    @GetMapping("/{idJob}/nodes")
    public ResponseEntity<List<NodeDTO>> getNodesByJob(@PathVariable Long idJob) {
        List<NodeDTO> nodes = nodeService.getNodesByJobId(idJob);
        if (nodes.isEmpty()) {
            return ResponseEntity.noContent().build();  // 204 No Content si pas de noeuds
        }
        return ResponseEntity.ok(nodes);  // 200 OK avec la liste
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<?> exportJob(
            @PathVariable Long id,
            @RequestParam(defaultValue = "yaml") String format
    ) {
        Job job = jobRepository.findById(id).orElse(null);
        if (job == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Job not found with id " + id);
        }

        try {
            Path exportedFile = jobService.generateExportJobAndReturnPath(job, format);

            if (!Files.exists(exportedFile)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Export file not found.");
            }

            PathResource resource = new PathResource(exportedFile);
            String contentType = Files.probeContentType(exportedFile);
            String fileName = exportedFile.getFileName().toString();

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to export job: " + e.getMessage());
        }
    }

    @GetMapping("/priority")
    public ResponseEntity<List<JobDTO>> getPriorityJobs() {
        List<JobDTO> jobDTOs = jobService.getPriorityJobs();
        return ResponseEntity.ok(jobDTOs);
    }

    @GetMapping("/names")
    public List<JobNameDTO> getJobs() {
        return jobRepository.findAllJobNames();
    }

    @GetMapping("/no-deleted/names")
    public List<JobNameDTO> getJobsNoDeleted() {
        return jobRepository.findAllJobNamesNotDeleted();
    }

    @GetMapping("/by-project-service")
    public ResponseEntity<List<JobNameDTO>> getJobsByProjectAndService(
            @RequestParam Long projectId
    ) {
        try {
            List<JobNameDTO> jobs = jobService.getJobsByProjectAndService(projectId);
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            e.printStackTrace(); // log pour voir l'erreur exacte
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
