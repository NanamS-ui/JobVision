package com.boa.di.rundeckproject.service.node;

import com.boa.di.rundeckproject.dto.NodeDTO;
import com.boa.di.rundeckproject.dto.NodeStatsDTO;
import com.boa.di.rundeckproject.dto.ServiceDTO;
import com.boa.di.rundeckproject.model.Node;
import com.boa.di.rundeckproject.model.NodeProject;
import com.boa.di.rundeckproject.model.Project;
import com.boa.di.rundeckproject.model.SshPath;
import com.boa.di.rundeckproject.repository.NodeProjectRepository;
import com.boa.di.rundeckproject.repository.NodeRepository;
import com.boa.di.rundeckproject.repository.ProjectRepository;
import com.boa.di.rundeckproject.repository.SshPathRepository;
import com.boa.di.rundeckproject.service.RundeckService;
import com.boa.di.rundeckproject.util.MapperUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.representer.Representer;

import javax.sql.DataSource;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NodeServiceImpl implements NodeService {
    private final RundeckService rundeckService;
    private final NodeRepository nodeRepository;
    @Value("${rundeck.project.resources.path}")
    private String rundeckProjectBasePath;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final NodeProjectRepository nodeProjectRepository;
    private final DataSource dataSource;
    private final ProjectRepository projectRepository;
    private final SshPathRepository sshPathRepository;

    @Autowired
    public NodeServiceImpl(RundeckService rundeckService, NodeRepository nodeRepository, JdbcTemplate jdbcTemplate, NodeProjectRepository nodeProjectRepository, DataSource dataSource, ProjectRepository projectRepository, SshPathRepository sshPathRepository) {
        this.rundeckService = rundeckService;
        this.nodeRepository = nodeRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.nodeProjectRepository = nodeProjectRepository;
        this.dataSource = dataSource;
        this.projectRepository = projectRepository;
        this.sshPathRepository = sshPathRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public List<NodeDTO> autocompleteNodename(String query) {
        List<Node> nodes = nodeRepository.autocompleteByNodename(query);
        return nodes.stream()
                .map(MapperUtil::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<Node> getAllNodes(Project project) throws Exception {
        String path = "/project/" + project.getName() + "/resources";
        String responseBody = rundeckService.get(path, String.class).getBody();

        List<Node> nodes = new ArrayList<>();
        JsonNode rootNode = objectMapper.readTree(responseBody);

        Iterator<Map.Entry<String, JsonNode>> fields = rootNode.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            JsonNode nodeData = entry.getValue();

            Node node = new Node();
            String nodename = nodeData.path("nodename").asText("");

            // Récupérer depuis la base selon le nom
            Node existingNode = nodeRepository.findNodeByNodename(nodename);
            if (existingNode != null) {
                node.setIdNode(existingNode.getIdNode());
            }
            node.setNodename(nodename);
            node.setHostname(nodeData.path("hostname").asText(""));
            node.setUsername(nodeData.path("username").asText(""));
            node.setOsFamily(nodeData.path("osFamily").asText(""));
            node.setOsName(nodeData.path("osName").asText(""));
            node.setOsArch(nodeData.path("osArch").asText(""));
            node.setTags(nodeData.path("tags").asText(""));
            node.setDescription(nodeData.path("description").asText(""));
            node.setEnabled(true);
            node.setCreatedAt(LocalDateTime.now());
            node.setUpdatedAt(LocalDateTime.now());

            // SSH path
            SshPath sshPath = null;
            String authType = nodeData.path("ssh-authentication").asText("");

            if (!"localhost".equalsIgnoreCase(nodename)) {
                sshPath = new SshPath();
                sshPath.setKeyType(authType);
                sshPath.setSshPort(nodeData.path("ssh-port").asText(""));

                if ("privateKey".equalsIgnoreCase(authType)) {
                    sshPath.setKeyStorage(nodeData.path("ssh-key-storage-path").asText(""));
                    sshPath.setYamlStorageKey("ssh-key-storage-path");
                } else if ("password".equalsIgnoreCase(authType)) {
                    sshPath.setKeyStorage(nodeData.path("ssh-password-storage-path").asText(""));
                    sshPath.setYamlStorageKey("ssh-password-storage-path");
                } else {
                    throw new IllegalArgumentException("Type d'authentification SSH non reconnu: " + authType);
                }
            }

            node.setSshPath(sshPath);
            nodes.add(node);
        }

        return nodes;
    }


    @Override
    @Transactional
    public void createNodeYaml(Node newNode, List<Project> projects) throws Exception {
        // Vérification des champs requis
        if (newNode.getNodename() == null || newNode.getNodename().isBlank()) {
            throw new IllegalArgumentException("Le champ 'nodename' est requis.");
        }
        if (newNode.getHostname() == null || newNode.getHostname().isBlank()) {
            throw new IllegalArgumentException("Le champ 'hostname' est requis.");
        }
        if (newNode.getUsername() == null || newNode.getUsername().isBlank()) {
            throw new IllegalArgumentException("Le champ 'username' est requis.");
        }

        // Enregistrer le node d'abord pour s'assurer qu'il a un ID valide
        newNode.setCreatedAt(LocalDateTime.now());
        newNode.setUpdatedAt(LocalDateTime.now());
        Node savedNode = nodeRepository.save(newNode);

        // Convertir le node en map YAML
        Map<String, Object> nodeMap = nodeToMap(savedNode);

        for (Project project : projects) {
            String basePath = rundeckProjectBasePath + project.getName() + "/etc";
            File dir = new File(basePath);
            if (!dir.exists() && !dir.mkdirs()) {
                throw new IOException("Impossible de créer le répertoire : " + basePath);
            }

            File yamlFile = new File(dir, "resources.yaml");
            Map<String, Map<String, Object>> yamlData = new LinkedHashMap<>();

            // Lire YAML existant
            if (yamlFile.exists()) {
                try (FileReader reader = new FileReader(yamlFile)) {
                    Yaml yaml = new Yaml();
                    Object data = yaml.load(reader);
                    if (data instanceof Map<?, ?> mapData) {
                        for (Map.Entry<?, ?> entry : mapData.entrySet()) {
                            if (entry.getKey() instanceof String key && entry.getValue() instanceof Map value) {
                                yamlData.put(key, (Map<String, Object>) value);
                            }
                        }
                    }
                } catch (IOException e) {
                    throw new IOException("Erreur lors de la lecture du fichier YAML : " + yamlFile.getPath(), e);
                }
            }

            // Ajouter ou mettre à jour le node dans le YAML
            yamlData.put(savedNode.getNodename(), nodeMap);

            // Configurer YAML output
            DumperOptions options = new DumperOptions();
            options.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
            options.setPrettyFlow(true);
            options.setDefaultScalarStyle(DumperOptions.ScalarStyle.PLAIN);
            options.setIndent(2);
            options.setIndicatorIndent(2);

            Representer representer = new Representer(options);
            representer.getPropertyUtils().setSkipMissingProperties(true);
            Yaml yaml = new Yaml(representer);

            // Écrire dans le fichier YAML
            try (FileWriter writer = new FileWriter(yamlFile)) {
                yaml.dump(yamlData, writer);
            } catch (IOException e) {
                throw new IOException("Erreur lors de l'écriture du fichier YAML : " + yamlFile.getPath(), e);
            }

            // Enregistrer l’association node ↔ projet
            NodeProject nodeProject = new NodeProject(savedNode, project);
            nodeProjectRepository.save(nodeProject);
        }
    }

    @Override
    @Transactional
    public void updateNodeYaml(Node updatedNode, List<Project> projects) throws Exception {
        if (updatedNode.getId() == null) {
            throw new IllegalArgumentException("L'ID du node est requis pour la mise à jour.");
        }

        Node existingNode = nodeRepository.findById(updatedNode.getId())
                .orElseThrow(() -> new EntityNotFoundException("Node non trouvé avec l'ID : " + updatedNode.getId()));

        SshPath sshPath = sshPathRepository.findSshPathById(updatedNode.getSshPath().getIdSshPath())
                .orElseThrow(()-> new EntityNotFoundException("SSH non trouvé avec l'ID : " + updatedNode.getId()));
        // Mise à jour des champs
        existingNode.setNodename(updatedNode.getNodename());
        existingNode.setHostname(updatedNode.getHostname());
        existingNode.setUsername(updatedNode.getUsername());
        existingNode.setOsFamily(updatedNode.getOsFamily());
        existingNode.setOsName(updatedNode.getOsName());
        existingNode.setOsArch(updatedNode.getOsArch());
        existingNode.setTags(updatedNode.getTags());
        existingNode.setDescription(updatedNode.getDescription());
        existingNode.setSshPath(sshPath);
        existingNode.setUpdatedAt(LocalDateTime.now());

        Node savedNode = nodeRepository.save(existingNode);

        Map<String, Object> nodeMap = nodeToMap(savedNode);

        // Supprime les anciennes associations NodeProject avant les nouvelles (à faire une fois hors boucle)
        nodeProjectRepository.deleteByNode(savedNode);

        for (Project proj : projects) {
            // Récupérer le project à jour depuis la base par son ID
            Project projectFromDb = projectRepository.findById(proj.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Projet non trouvé avec l'ID : " + proj.getId()));

            String basePath = rundeckProjectBasePath + projectFromDb.getName() + "/etc";
            File dir = new File(basePath);
            if (!dir.exists() && !dir.mkdirs()) {
                throw new IOException("Impossible de créer le répertoire : " + basePath);
            }

            File yamlFile = new File(dir, "resources.yaml");
            Map<String, Map<String, Object>> yamlData = new LinkedHashMap<>();

            // Lecture YAML existant
            if (yamlFile.exists()) {
                try (FileReader reader = new FileReader(yamlFile)) {
                    Yaml yaml = new Yaml();
                    Object data = yaml.load(reader);
                    if (data instanceof Map<?, ?> mapData) {
                        for (Map.Entry<?, ?> entry : mapData.entrySet()) {
                            if (entry.getKey() instanceof String key && entry.getValue() instanceof Map value) {
                                yamlData.put(key, (Map<String, Object>) value);
                            }
                        }
                    }
                } catch (IOException e) {
                    throw new IOException("Erreur lors de la lecture du fichier YAML : " + yamlFile.getPath(), e);
                }
            }

            // Mise à jour ou insertion du node
            yamlData.put(savedNode.getNodename(), nodeMap);

            // Écriture YAML
            DumperOptions options = new DumperOptions();
            options.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
            options.setPrettyFlow(true);
            options.setDefaultScalarStyle(DumperOptions.ScalarStyle.PLAIN);
            options.setIndent(2);
            options.setIndicatorIndent(2);

            Representer representer = new Representer(options);
            representer.getPropertyUtils().setSkipMissingProperties(true);
            Yaml yaml = new Yaml(representer);

            try (FileWriter writer = new FileWriter(yamlFile)) {
                yaml.dump(yamlData, writer);
            } catch (IOException e) {
                throw new IOException("Erreur lors de l'écriture du fichier YAML : " + yamlFile.getPath(), e);
            }

            // Enregistrement de la nouvelle association NodeProject avec l'objet projectFromDb
            NodeProject nodeProject = new NodeProject(savedNode, projectFromDb);
            nodeProjectRepository.save(nodeProject);
        }
    }

    @Override
    @Transactional
    public void deleteNodeYaml(Long nodeId) throws Exception {
        if (nodeId == null) {
            throw new IllegalArgumentException("L'ID du node est requis pour la suppression.");
        }

        Node node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new EntityNotFoundException("Node non trouvé avec l'ID : " + nodeId));

        String nodename = node.getNodename();

        // Récupère tous les projets associés
        List<NodeProject> nodeProjects = nodeProjectRepository.findNodeProjectByNode(node);

        for (NodeProject nodeProject : nodeProjects) {
            Project project = nodeProject.getProject();
            String basePath = rundeckProjectBasePath + project.getName() + "/etc";
            File yamlFile = new File(basePath, "resources.yaml");

            if (yamlFile.exists()) {
                Map<String, Map<String, Object>> yamlData = new LinkedHashMap<>();

                // Lecture YAML existant
                try (FileReader reader = new FileReader(yamlFile)) {
                    Yaml yaml = new Yaml();
                    Object data = yaml.load(reader);
                    if (data instanceof Map<?, ?> mapData) {
                        for (Map.Entry<?, ?> entry : mapData.entrySet()) {
                            if (entry.getKey() instanceof String key && entry.getValue() instanceof Map value) {
                                yamlData.put(key, (Map<String, Object>) value);
                            }
                        }
                    }
                } catch (IOException e) {
                    throw new IOException("Erreur lors de la lecture du fichier YAML : " + yamlFile.getPath(), e);
                }

                yamlData.remove(nodename);

                DumperOptions options = new DumperOptions();
                options.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
                options.setPrettyFlow(true);
                options.setDefaultScalarStyle(DumperOptions.ScalarStyle.PLAIN);
                options.setIndent(2);
                options.setIndicatorIndent(2);

                Representer representer = new Representer(options);
                representer.getPropertyUtils().setSkipMissingProperties(true);
                Yaml yaml = new Yaml(representer);

                try (FileWriter writer = new FileWriter(yamlFile)) {
                    yaml.dump(yamlData, writer);
                } catch (IOException e) {
                    throw new IOException("Erreur lors de l'écriture du fichier YAML : " + yamlFile.getPath(), e);
                }
            }
        }

        nodeProjectRepository.deleteByNode(node);

        nodeRepository.delete(node);
    }


    private Map<String, Object> nodeToMap(Node node) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("nodename", node.getNodename());
        map.put("hostname", node.getHostname());
        map.put("description", node.getDescription());
        map.put("osFamily", node.getOsFamily());
        map.put("username", node.getUsername());

        if (node.getSshPath() != null) {
            String keyType = node.getSshPath().getKeyType();

            if (keyType != null) {
                map.put("ssh-authentication", keyType);

                if ("password".equalsIgnoreCase(keyType)) {
                    map.put("ssh-password-storage-path", node.getSshPath().getKeyStorage());
                } else if ("privateKey".equalsIgnoreCase(keyType)) {
                    map.put("ssh-key-storage-path", node.getSshPath().getKeyStorage());
                }
            }

            if (node.getSshPath().getSshPort() != null) {
                map.put("ssh-port", node.getSshPath().getSshPort());
            }
        }

        map.put("tags", node.getTags());
        return map;
    }


    @Override
    public NodeStatsDTO getStatsNode() {
        String statsSql = "SELECT * FROM node_statistics_view";
        NodeStatsDTO dto = jdbcTemplate.queryForObject(statsSql, (rs, rowNum) -> mapToNodeStatsDTO(rs));

        String osCountSql = """
            SELECT os_name_ AS os, COUNT(*) AS node_count
            FROM node
            WHERE os_name_ IS NOT NULL
            GROUP BY os_name_
            ORDER BY node_count DESC
        """;

        Map<String, Long> osNodeCountMap = new LinkedHashMap<>();
        jdbcTemplate.query(osCountSql, rs -> {
            osNodeCountMap.put(rs.getString("os"), rs.getLong("node_count"));
        });
        dto.setOsNodeCountMap(osNodeCountMap);

        // Requête 2 – Nombre de jobs par node
        String nodeJobSql = """
            SELECT n.nodename AS node, COUNT(j.id_job) AS job_count
            FROM node n
            JOIN node_filter nf ON nf.filter_node LIKE CONCAT('%', n.nodename, '%')
            JOIN job j ON j.id_node_filter = nf.id_node_filter
            GROUP BY n.nodename
            ORDER BY job_count DESC
        """;

        Map<String, Long> nodeJobCountMap = new LinkedHashMap<>();
        jdbcTemplate.query(nodeJobSql, rs -> {
            nodeJobCountMap.put(rs.getString("node"), rs.getLong("job_count"));
        });
        dto.setNodeJobCountMap(nodeJobCountMap);

        List<Node> nodes = nodeRepository.findAll();
        List<NodeDTO> nodeDTOs = nodes.stream()
                .map(MapperUtil::toDto)
                .collect(Collectors.toList());

        dto.setNodes(nodeDTOs);

        return dto;
    }

    private NodeStatsDTO mapToNodeStatsDTO(ResultSet rs) throws SQLException {
        NodeStatsDTO dto = new NodeStatsDTO();
        dto.setTotalEnabledNodes(rs.getLong("total_enabled_nodes"));
        dto.setNodesInFilters(rs.getLong("nodes_in_filters"));
        dto.setJobsOnActiveNodes(rs.getLong("jobs_on_active_nodes"));
        dto.setDistinctOsFamilies(rs.getLong("distinct_os_families"));
        return dto;
    }

    @Override
    public void insertNode(Node node) throws SQLException {
        String sql = """
            INSERT INTO node (
                hostname,
                nodename,
                username,
                os_family_,
                os_name_,
                os_arch_,
                tags_,
                description_,
                enabled_,
                created_at_,
                updated_at_,
                id_ssh_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, node.getHostname());
            stmt.setString(2, node.getNodename());
            stmt.setString(3, node.getUsername());
            stmt.setString(4, node.getOsFamily());
            stmt.setString(5, node.getOsName());
            stmt.setString(6, node.getOsArch());
            stmt.setString(7, node.getTags());
            stmt.setString(8, node.getDescription());
            stmt.setBoolean(9, true);
            stmt.setTimestamp(10, new Timestamp(System.currentTimeMillis()));
            stmt.setTimestamp(11, new Timestamp(System.currentTimeMillis()));
            stmt.setLong(12, node.getSshPath().getId());

            stmt.executeUpdate();
        }
    }

    @Override
    public List<NodeDTO> getNodesByJobId(Long idJob) {
        String filterNode;
        try {
            filterNode = jdbcTemplate.queryForObject(
                    """
                    SELECT nf.filter_node
                    FROM job j
                    JOIN node_filter nf ON j.id_node_filter = nf.id_node_filter
                    WHERE j.id_job = ?
                    """,
                    String.class,
                    idJob
            );
        } catch (EmptyResultDataAccessException e) {
            return Collections.emptyList();
        }

        if (filterNode == null || filterNode.isBlank()) {
            return Collections.emptyList();
        }

        if (filterNode.startsWith("name:")) {
            filterNode = filterNode.substring("name:".length());
        }

        return Arrays.stream(filterNode.split(","))
                .map(String::trim)
                .map(nodeRepository::findNodeByNodename)
                .filter(Objects::nonNull)
                .map(MapperUtil::toDto)    // <-- conversion Node -> NodeDTO
                .collect(Collectors.toList());
    }

}