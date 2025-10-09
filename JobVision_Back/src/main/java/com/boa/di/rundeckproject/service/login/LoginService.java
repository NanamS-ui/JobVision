package com.boa.di.rundeckproject.service.login;

import com.boa.di.rundeckproject.dto.LoginResponse;
import jakarta.transaction.Transactional;

public interface LoginService {
    LoginResponse login(String matricule, String password);

    @Transactional
    LoginResponse loginJwt(String matricule, String password);
}
