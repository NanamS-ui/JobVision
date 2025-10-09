package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.dto.ServiceFlatViewDTO;
import com.boa.di.rundeckproject.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findServiceByNameContainingIgnoreCase(String name);
    @Query(value = "SELECT * FROM service_details_view WHERE id_service = :idService AND is_deleted = false", nativeQuery = true)
    List<ServiceFlatViewDTO> findByServiceId(@Param("idService") Integer idService);
}
