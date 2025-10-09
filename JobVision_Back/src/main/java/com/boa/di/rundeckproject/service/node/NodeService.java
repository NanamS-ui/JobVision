package com.boa.di.rundeckproject.service.node;

import com.boa.di.rundeckproject.dto.NodeDTO;
import com.boa.di.rundeckproject.dto.NodeStatsDTO;
import com.boa.di.rundeckproject.dto.ServiceDTO;
import com.boa.di.rundeckproject.model.Node;
import com.boa.di.rundeckproject.model.Project;

import java.sql.SQLException;
import java.util.List;

public interface NodeService {
    List<Node> getAllNodes(Project project) throws Exception;
    void createNodeYaml(Node newNode, List<Project> projects) throws Exception;
    NodeStatsDTO getStatsNode();
    List<NodeDTO> autocompleteNodename(String query);
    void insertNode(Node node) throws SQLException;
    void updateNodeYaml(Node updatedNode, List<Project> projects) throws Exception;
    void deleteNodeYaml(Long nodeId) throws Exception;
    List<NodeDTO> getNodesByJobId(Long idJob);
}
