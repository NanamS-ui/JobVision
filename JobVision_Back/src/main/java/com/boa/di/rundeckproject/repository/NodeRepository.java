package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.dto.NodeNameDTO;
import com.boa.di.rundeckproject.model.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface NodeRepository extends JpaRepository<Node, String> {
    Node findNodeByNodename(String nodename);
    Node findNodeById(Long id);
    Optional<Node> findById(Long id);
    @Query("SELECT n FROM Node n " +
            "LEFT JOIN FETCH n.sshPath " +
            "LEFT JOIN FETCH n.nodeProjects np " +
            "LEFT JOIN FETCH np.project " +
            "WHERE LOWER(n.nodename) LIKE LOWER(CONCAT(:query, '%'))")
    List<Node> autocompleteByNodename(@Param("query") String query);
    List<Node> findAllByIdIn(Collection<Long> ids);

    @Query("SELECT new com.boa.di.rundeckproject.dto.NodeNameDTO(n.nodename, n.hostname) FROM Node n")
    List<NodeNameDTO> findAllNodeNames();
}
