package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByVal(String val);
}
