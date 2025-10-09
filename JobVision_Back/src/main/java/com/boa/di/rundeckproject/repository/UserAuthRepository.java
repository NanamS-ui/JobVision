package com.boa.di.rundeckproject.repository;

import com.boa.di.rundeckproject.model.Service;
import com.boa.di.rundeckproject.model.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAuthRepository extends JpaRepository<UserAuth, Integer> {
    UserAuth findUserAuthByMatricule(String matricule);
    List<UserAuth> findByService(Service service);
    @Query("SELECT u FROM UserAuth u WHERE u.service.id = :serviceId")
    List<UserAuth> findByServiceId(@Param("serviceId") Integer serviceId);

    @Override
    Optional<UserAuth> findById(Integer integer);

    Optional<UserAuth> findByMatricule(String matricule);
}
