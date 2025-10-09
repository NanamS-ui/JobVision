package com.boa.di.rundeckproject.service.project;

import com.boa.di.rundeckproject.dto.JobDTO;
import com.boa.di.rundeckproject.dto.ProjectDTO;
import com.boa.di.rundeckproject.dto.ProjectStatsDTO;
import com.boa.di.rundeckproject.dto.ProjectStatsViewDTO;
import com.boa.di.rundeckproject.model.Job;
import com.boa.di.rundeckproject.model.Node;
import com.boa.di.rundeckproject.model.NodeProject;
import com.boa.di.rundeckproject.model.Project;
import com.boa.di.rundeckproject.repository.JobRepository;
import com.boa.di.rundeckproject.repository.NodeProjectRepository;
import com.boa.di.rundeckproject.repository.NodeRepository;
import com.boa.di.rundeckproject.repository.ProjectRepository;
import com.boa.di.rundeckproject.repository.ServiceRepository;
import com.boa.di.rundeckproject.service.RundeckService;
import com.boa.di.rundeckproject.service.job.JobService;
import com.boa.di.rundeckproject.util.MapperUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {
    @Autowired
    private final ProjectRepository projectRepository;
    private final RundeckService rundeckService;
    private final ServiceRepository serviceRepository;
    private final JobRepository jobRepository;
    private final JobService jobService;
    private final NodeRepository nodeRepository;
    private final NodeProjectRepository nodeProjectRepository;
    @Value("${rundeck.project.resources.path}")
    private String rundeckProjectBasePath;

    public ProjectServiceImpl(ProjectRepository projectRepository, RundeckService rundeckService, ServiceRepository serviceRepository, JobRepository jobRepository, JobService jobService, NodeRepository nodeRepository, NodeProjectRepository nodeProjectRepository) {
        this.projectRepository = projectRepository;
        this.rundeckService = rundeckService;
        this.serviceRepository = serviceRepository;
        this.jobRepository = jobRepository;
        this.jobService = jobService;
        this.nodeRepository = nodeRepository;
        this.nodeProjectRepository = nodeProjectRepository;
    }

    @Override
    public List<Project> findAll(){return projectRepository.findAll();}

    @Transactional
    public ResponseEntity<String> createProject(String name, String description, Integer idService) {
        Map<String, Object> body = new HashMap<>();
        body.put("name", name);
        body.put("description", description);

        String etcPath = rundeckProjectBasePath + name + "/etc";
        File etcDir = new File(etcPath);
        if (!etcDir.exists() && !etcDir.mkdirs()) {
            throw new RuntimeException("Impossible de créer le répertoire : " + etcPath);
        }
        File yamlFile = new File(etcDir, "resources.yaml");
        if (!yamlFile.exists()) {
            try (FileWriter writer = new FileWriter(yamlFile)) {
                writer.write(""); // vide ou YAML initial si besoin
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de la création du fichier YAML", e);
            }
        }

        // Construire la config complète, incluant la source nodes
        Map<String, String> config = new HashMap<>();
        config.put("project.description", description);
        config.put("resources.source.1.type", "file");
        config.put("resources.source.1.config.file", yamlFile.getAbsolutePath());
        config.put("resources.source.1.config.format", "resourceyaml");
        config.put("resources.source.1.config.includeServerNode", "true");
        config.put("resources.source.1.config.generateFileAutomatically", "false");

        body.put("config", config);

        ResponseEntity<String> response = rundeckService.post("/projects", body, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            Project project = projectRepository.findProjectByNameAndDescription(name, description);
            com.boa.di.rundeckproject.model.Service service = serviceRepository.findById(Long.valueOf(idService))
                    .orElseThrow(() -> new RuntimeException("Service non trouvé avec ID: " + idService));
            project.setService(service);
            projectRepository.save(project);
        }

        return response;
    }

    @Transactional
    public ResponseEntity<String> createProjectWithNodes(String name, String description, Integer idService, List<String> nodeNames) {
        ResponseEntity<String> response = createProject(name, description, idService);
        if (!response.getStatusCode().is2xxSuccessful()) {
            return response;
        }

        Project project = projectRepository.findProjectByNameAndDescription(name, description);
        if (project == null) {
            return response; // safeguard
        }

        if (nodeNames == null || nodeNames.isEmpty()) {
            return response;
        }

        String etcPath = rundeckProjectBasePath + name + "/etc";
        File dir = new File(etcPath);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new RuntimeException("Impossible de créer le répertoire : " + etcPath);
        }

        File yamlFile = new File(dir, "resources.yaml");

        Map<String, Map<String, Object>> yamlData = new LinkedHashMap<>();
        if (yamlFile.exists()) {
            try (java.io.FileReader reader = new java.io.FileReader(yamlFile)) {
                org.yaml.snakeyaml.Yaml yaml = new org.yaml.snakeyaml.Yaml();
                Object data = yaml.load(reader);
                if (data instanceof Map<?, ?> mapData) {
                    for (Map.Entry<?, ?> entry : mapData.entrySet()) {
                        if (entry.getKey() instanceof String key && entry.getValue() instanceof Map value) {
                            yamlData.put(key, (Map<String, Object>) value);
                        }
                    }
                }
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de la lecture du fichier YAML : " + yamlFile.getPath(), e);
            }
        }

        for (String nodename : nodeNames) {
            Node node = nodeRepository.findNodeByNodename(nodename);
            if (node == null) {
                continue;
            }

            Map<String, Object> nodeMap = new LinkedHashMap<>();
            nodeMap.put("nodename", node.getNodename());
            nodeMap.put("hostname", node.getHostname());
            nodeMap.put("description", node.getDescription());
            nodeMap.put("osFamily", node.getOsFamily());
            nodeMap.put("username", node.getUsername());
            if (node.getSshPath() != null) {
                String keyType = node.getSshPath().getKeyType();
                if (keyType != null) {
                    nodeMap.put("ssh-authentication", keyType);
                    if ("password".equalsIgnoreCase(keyType)) {
                        nodeMap.put("ssh-password-storage-path", node.getSshPath().getKeyStorage());
                    } else if ("privateKey".equalsIgnoreCase(keyType)) {
                        nodeMap.put("ssh-key-storage-path", node.getSshPath().getKeyStorage());
                    }
                }
                if (node.getSshPath().getSshPort() != null) {
                    nodeMap.put("ssh-port", node.getSshPath().getSshPort());
                }
            }
            nodeMap.put("tags", node.getTags());

            yamlData.put(node.getNodename(), nodeMap);

            NodeProject nodeProject = new NodeProject(node, project);
            nodeProjectRepository.save(nodeProject);
        }

        org.yaml.snakeyaml.DumperOptions options = new org.yaml.snakeyaml.DumperOptions();
        options.setDefaultFlowStyle(org.yaml.snakeyaml.DumperOptions.FlowStyle.BLOCK);
        options.setPrettyFlow(true);
        options.setDefaultScalarStyle(org.yaml.snakeyaml.DumperOptions.ScalarStyle.PLAIN);
        options.setIndent(2);
        options.setIndicatorIndent(2);
        org.yaml.snakeyaml.representer.Representer representer = new org.yaml.snakeyaml.representer.Representer(options);
        representer.getPropertyUtils().setSkipMissingProperties(true);
        org.yaml.snakeyaml.Yaml yamlOut = new org.yaml.snakeyaml.Yaml(representer);
        try (java.io.FileWriter writer = new java.io.FileWriter(yamlFile)) {
            yamlOut.dump(yamlData, writer);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'écriture du fichier YAML : " + yamlFile.getPath(), e);
        }

        return response;
    }

    @Override
    public ResponseEntity<String> getProjectByName(String projectName) {
        String path = "/project/" + projectName;
        return rundeckService.get(path, String.class);
    }

    @Override
    public ResponseEntity<String> deleteProject(String name) {
        return rundeckService.delete("/project/" + name, String.class);
    }

    @Override
    public List<Project> searchByName(String query) {
        return projectRepository.findByNameContainingIgnoreCase(query);
    }

    @Override
    public ResponseEntity<String> updateProjectConfig(String projectName, Map<String, String> newConfig) {
        String url = rundeckService.getApiUrl() + "/projects/" + projectName + "/config";
        HttpHeaders headers = rundeckService.createHeaders();
        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(newConfig, headers);
        return rundeckService.getRestTemplate().exchange(url, HttpMethod.POST, requestEntity, String.class);
    }

    @Override
    public ProjectStatsDTO getProjectStats() {
        long totalProjects = projectRepository.getTotalProjects();
        long totalExecutions = projectRepository.getTotalExecutions();
        double successRate = projectRepository.getSuccessRate();
        double avgDurationMs = projectRepository.getAverageExecutionDuration();
        List<ProjectStatsViewDTO> projectStatsViewDTOS = getAllProjectStatsViews();

        // Conversion duration ms -> sec
        double avgDurationSec = avgDurationMs / 1000.0;

        return new ProjectStatsDTO(
                totalProjects,
                totalExecutions,
                successRate,
                avgDurationSec,
                projectStatsViewDTOS
        );
    }

    @Override
    public List<ProjectStatsViewDTO> getAllProjectStatsViews() {
        List<Project> projects = projectRepository.findAll();

        return projects.stream().map(project -> {
            Long projectId = project.getId();
            Double progress = projectRepository.calculateSuccessRateForProject(projectId);
            if (progress == null) progress = 0.0;

            List<Job> recentJobs = jobRepository.findTop2RecentJobsByProjectId(projectId);
            List<JobDTO> recentJobDTOs = recentJobs.stream()
                    .map(jobService::getJobDetails)
                    .collect(Collectors.toList());

            ProjectDTO projectDTO = MapperUtil.toProjectDTO(project);

            return new ProjectStatsViewDTO(projectDTO, progress, recentJobDTOs);
        }).collect(Collectors.toList());
    }

    @Override
    public List<ProjectStatsViewDTO> searchProjectStatsByName(String query) {
        List<Project> projects = projectRepository.findByNameContainingIgnoreCase(query);

        return projects.stream().map(project -> {
            Long projectId = project.getId();

            Double progress = projectRepository.calculateSuccessRateForProject(projectId);
            if (progress == null) progress = 0.0;

            List<Job> recentJobs = jobRepository.findTop2RecentJobsByProjectId(projectId);
            List<JobDTO> recentJobDTOs = recentJobs.stream()
                    .map(jobService::getJobDetails)
                    .collect(Collectors.toList());

            ProjectDTO projectDTO = MapperUtil.toProjectDTO(project);

            return new ProjectStatsViewDTO(projectDTO, progress, recentJobDTOs);
        }).collect(Collectors.toList());
    }

    @Override
    public List<ProjectDTO> getProjectsByServiceId(String idService) {
        List<Project> projects = projectRepository.findByService_Name(idService);
        return projects.stream()
                .map(MapperUtil::toProjectDTO) // utilise ton mapper ici
                .collect(Collectors.toList());
    }

}