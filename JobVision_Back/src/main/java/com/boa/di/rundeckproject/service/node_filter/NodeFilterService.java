package com.boa.di.rundeckproject.service.node_filter;

import com.boa.di.rundeckproject.model.Node;

import java.util.List;

public interface NodeFilterService {
    String getFiltersNodes(List<Node> listNodes);

    List<Node> extractNodesFromFilter(String filterString);
}
