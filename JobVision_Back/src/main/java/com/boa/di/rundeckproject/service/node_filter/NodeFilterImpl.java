package com.boa.di.rundeckproject.service.node_filter;

import com.boa.di.rundeckproject.model.Node;
import com.boa.di.rundeckproject.repository.NodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class NodeFilterImpl implements NodeFilterService {
    private final NodeRepository nodeRepository;

    @Autowired
    public NodeFilterImpl(NodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }

    @Override
    public String getFiltersNodes(List<Node> listNodes) {
        if (listNodes == null || listNodes.isEmpty()) {
            return "";
        }
        String names = listNodes.stream()
                .map(Node::getNodename)
                .collect(Collectors.joining(","));

        return "name:" + names;
    }

    @Override
    public List<Node> extractNodesFromFilter(String filterString) {
        if (filterString == null || filterString.isBlank()) return List.of();

        // On vérifie si le filtre commence par "name:"
        if (filterString.startsWith("name:")) {
            // On enlève le préfixe "name:"
            String namesOnly = filterString.substring("name:".length());

            // On split les noms par virgule et on nettoie
            String[] names = namesOnly.split(",");
            return Arrays.stream(names)
                    .map(String::trim)
                    .map(nodeRepository::findNodeByNodename)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        }

        // Si d'autres formats sont possibles, à gérer ici
        return List.of();
    }


}
