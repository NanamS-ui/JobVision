package com.boa.di.rundeckproject.controller.node;

import com.boa.di.rundeckproject.dto.NodeDTO;
import com.boa.di.rundeckproject.dto.NodeNameDTO;
import com.boa.di.rundeckproject.dto.ProjectDTO;
import com.boa.di.rundeckproject.dto.ServiceDTO;
import com.boa.di.rundeckproject.error.ErrorDetail;
import com.boa.di.rundeckproject.model.Node;
import com.boa.di.rundeckproject.model.Project;
import com.boa.di.rundeckproject.model.SshPath;
import com.boa.di.rundeckproject.repository.NodeRepository;
import com.boa.di.rundeckproject.repository.ProjectRepository;
import com.boa.di.rundeckproject.repository.SshPathRepository;
import com.boa.di.rundeckproject.service.node.NodeService;
import com.boa.di.rundeckproject.success.SuccessDetail;
import com.boa.di.rundeckproject.util.MapperUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/nodes")
public class NodeController {

    private final NodeService nodeService;
    private final NodeRepository nodeRepository;
    private final ProjectRepository projectRepository;
    private final SshPathRepository sshPathRepository;

    public NodeController(NodeService nodeService, NodeRepository nodeRepository, ProjectRepository projectRepository, SshPathRepository sshPathRepository) {
        this.nodeService = nodeService;
        this.nodeRepository = nodeRepository;
        this.projectRepository = projectRepository;
        this.sshPathRepository = sshPathRepository;
    }


    @GetMapping("/list")
    public ResponseEntity<List<NodeDTO>> getAllNodes() {
        List<Node> nodes = nodeRepository.findAll();
        List<NodeDTO> nodeDTOs = nodes.stream()
                .map(MapperUtil::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(nodeDTOs);
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<NodeDTO>> autocompleteNodename(@RequestParam("query") String query) {
        List<NodeDTO> result = nodeService.autocompleteNodename(query);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/name/{nodeName}")
    public ResponseEntity<?> getNodeByName(@PathVariable String nodeName) {
        Node node = nodeRepository.findNodeByNodename(nodeName);
        return ResponseEntity.ok(node);
    }

    @GetMapping("/project")
    public ResponseEntity<List<NodeDTO>> getAllNodesByProject(@RequestParam("id_project") Long projectId) {
        try {
            Project project = projectRepository.findProjectById(projectId);

            if (project == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            List<Node> nodes = nodeService.getAllNodes(project);
            List<NodeDTO> nodeDtos = nodes.stream()
                    .map(MapperUtil::toDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(nodeDtos);

        } catch (Exception e) {
            e.printStackTrace(); // 👈 affiche l'erreur dans les logs
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/project-name")
    public ResponseEntity<List<NodeDTO>> getAllNodesByProjectName(@RequestParam("project_name") String projectId) {
        try {
            Project project = projectRepository.findProjectByName(projectId);

            if (project == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            List<Node> nodes = nodeService.getAllNodes(project);
            List<NodeDTO> nodeDtos = nodes.stream()
                    .map(MapperUtil::toDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(nodeDtos);

        } catch (Exception e) {
            e.printStackTrace(); // 👈 affiche l'erreur dans les logs
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @PostMapping
    public ResponseEntity<?> createNode(@RequestBody NodeDTO nodeDTO) {
        try {
            Node node = new Node();
            node.setNodename(nodeDTO.getNodename());
            node.setHostname(nodeDTO.getHostname());
            node.setUsername(nodeDTO.getUsername());
            node.setOsFamily(nodeDTO.getOsFamily());
            node.setOsName(nodeDTO.getOsName());
            node.setOsArch(nodeDTO.getOsArch());
            node.setTags(nodeDTO.getTags());
            node.setDescription(nodeDTO.getDescription());
            node.setEnabled(nodeDTO.getEnabled());

            if (nodeDTO.getSshPath() != null && nodeDTO.getSshPath().getId() != null) {
                Optional<SshPath> sshPath = sshPathRepository.findSshPathById(nodeDTO.getSshPath().getId());
                sshPath.ifPresent(node::setSshPath);
            }

            List<Long> projectIds = nodeDTO.getProjects().stream()
                    .map(ProjectDTO::getId)
                    .filter(Objects::nonNull)
                    .toList();

            List<Project> projects = projectRepository.findAllById(projectIds);

//            if (projects.isEmpty()) {
//                return ResponseEntity.badRequest().body("Aucun projet valide trouvé.");
//            }

            nodeService.createNodeYaml(node, projects);

            return ResponseEntity.ok("Node créé avec succès.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la création du node : " + e.getMessage());
        }
    }


    @GetMapping("/id/{id}")
    public ResponseEntity<?> getNodeById(@PathVariable("id") String idNode) {
        Optional<Node> nodeOpt = nodeRepository.findById(idNode);
        if (nodeOpt.isPresent()) {
            return ResponseEntity.ok(nodeOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorDetail(
                            HttpStatus.NOT_FOUND.value(),
                            "Node non trouvé",
                            Instant.now().toEpochMilli(),
                            "/api/node/" + idNode,
                            "Aucun node avec id = " + idNode
                    ));
        }
    }

    @PutMapping("/update-yaml")
    public ResponseEntity<String> updateNodeYaml(@RequestBody NodeDTO nodeDTO) {
        try {
            Node node = new Node();
            node.setId(nodeDTO.getId());
            node.setNodename(nodeDTO.getNodename());
            node.setHostname(nodeDTO.getHostname());
            node.setUsername(nodeDTO.getUsername());
            node.setOsFamily(nodeDTO.getOsFamily());
            node.setOsName(nodeDTO.getOsName());
            node.setOsArch(nodeDTO.getOsArch());
            node.setTags(nodeDTO.getTags());
            node.setDescription(nodeDTO.getDescription());
            node.setEnabled(Boolean.TRUE); // ou nodeDTO.getEnabled()

            if (nodeDTO.getSshPath() != null) {
                SshPath sshPath = new SshPath();
                sshPath.setId(nodeDTO.getSshPath().getId());
                node.setSshPath(sshPath);
            }

            List<Project> projects = nodeDTO.getProjects()
                    .stream()
                    .map(dto -> {
                        Project p = new Project();
                        p.setId(dto.getId());
                        return p;
                    })
                    .toList();

            nodeService.updateNodeYaml(node, projects);

            return ResponseEntity.ok("Node YAML updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la mise à jour du node YAML : " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNode(@PathVariable Long id) {
        try {
            nodeService.deleteNodeYaml(id);
            return ResponseEntity.ok("Node supprimé avec succès.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Node non trouvé : " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression : " + e.getMessage());
        }
    }

    @GetMapping("/names")
    public List<NodeNameDTO> getNodes() {
        return nodeRepository.findAllNodeNames();
    }
}
