package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.Node;
import com.boa.di.rundeckproject.model.NodeProject;
import com.boa.di.rundeckproject.model.NodeProjectId;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NodeProjectRepository extends JpaRepository<NodeProject, NodeProjectId> {
    @Transactional
    void deleteByNode(Node node);

    List<NodeProject> findNodeProjectByNode(Node node);
}
