package com.boa.di.rundeckproject.service.user_auth;

import com.boa.di.rundeckproject.dto.UserAuthDTO;
import com.boa.di.rundeckproject.dto.UserCreateDTO;
import com.boa.di.rundeckproject.model.UserAuth;

import java.io.IOException;
import java.util.List;

public interface UserAuthService {
    UserAuth createUser(UserCreateDTO request) throws Exception;

    UserAuth createUserJwt(UserCreateDTO request);

    void deleteUser(String matricule) throws Exception;
    List<UserAuthDTO> getAllUsersWithDetails();
    List<UserAuthDTO> getUsersByService(com.boa.di.rundeckproject.model.Service service);
    List<UserAuthDTO> getUsersByIdService(Integer serviceId);
}
