package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.SshPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SshPathRepository extends JpaRepository<SshPath, String> {
    @Query("SELECT COUNT(s) FROM SshPath s")
    long countTotalKeys();

    @Query("SELECT s.keyType, COUNT(s) FROM SshPath s GROUP BY s.keyType")
    List<Object[]> countByKeyType();

    @Query("SELECT COUNT(DISTINCT s.sshPort) FROM SshPath s WHERE s.sshPort IS NOT NULL")
    long countDistinctSshPorts();

    @Query("SELECT s.keyType AS keyType, COUNT(n.id) AS nodeCount " +
            "FROM Node n JOIN n.sshPath s " +
            "GROUP BY s.keyType")
    List<KeyTypeNodeCount> countNodesByKeyType();

    Optional<SshPath> findSshPathById(Long id);

    interface KeyTypeNodeCount {
        String getKeyType();
        Long getNodeCount();
    }
}