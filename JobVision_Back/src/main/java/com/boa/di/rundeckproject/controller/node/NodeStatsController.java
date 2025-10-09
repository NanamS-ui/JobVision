package com.boa.di.rundeckproject.controller.node;

import com.boa.di.rundeckproject.dto.NodeStatsDTO;
import com.boa.di.rundeckproject.service.node.NodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NodeStatsController {

    @Autowired
    private NodeService nodeStatsService;

    @GetMapping("/api/nodes/stats")
    public NodeStatsDTO getNodeStats() {
        return nodeStatsService.getStatsNode();
    }
}
