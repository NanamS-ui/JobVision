package com.boa.di.rundeckproject.service.login;

import com.boa.di.rundeckproject.dto.LoginResponse;
import com.boa.di.rundeckproject.model.UserAuth;
import com.boa.di.rundeckproject.repository.UserAuthRepository;
import com.boa.di.rundeckproject.security.JwtUtil;
import com.boa.di.rundeckproject.service.RundeckService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Service
public class LoginServiceImpl implements LoginService {

    private final UserAuthRepository userRepository;
    private final RundeckService rundeckService;
    private final String realmFilePath;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtUtil jwtUtil;

    @Autowired
    public LoginServiceImpl(UserAuthRepository userRepository,
                            RundeckService rundeckService,
                            @Value("${rundeck.realm.file}") String realmFilePath, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.rundeckService = rundeckService;
        this.realmFilePath = realmFilePath;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public LoginResponse login(String matricule, String password) {
        UserAuth user = userRepository.findUserAuthByMatricule(matricule);
        if (user == null) {
            return new LoginResponse(false, "Utilisateur inconnu", null);
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return new LoginResponse(false, "Mot de passe incorrect", null);
        }
        if (!isUserInRealmProperties(matricule)) {
            return new LoginResponse(false, "Utilisateur non autorisé dans realm.properties", null);
        }

        String userToken = createTokenForUser(matricule);
        if (userToken == null) {
            return new LoginResponse(false, "Erreur lors de la génération du token Rundeck", null);
        }

        user.setActive(true);
        userRepository.save(user);

        return new LoginResponse(true, "Connexion réussie", userToken);
    }

    @Transactional
    @Override
    public LoginResponse loginJwt(String matricule, String password) {
        UserAuth user = userRepository.findUserAuthByMatricule(matricule);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return new LoginResponse(false, "Matricule ou mot de passe incorrect", null);
        }

        user.setActive(true);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user);

        return new LoginResponse(true, "Connexion réussie", token);
    }


    private boolean isUserInRealmProperties(String matricule) {
        try (FileInputStream input = new FileInputStream(realmFilePath)) {
            Properties realm = new Properties();
            realm.load(input);
            return realm.containsKey(matricule);
        } catch (IOException e) {
            return false;
        }
    }

    private String createTokenForUser(String matricule) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("user", matricule);
        payload.put("roles", "user,admin");
        payload.put("expiration", "30d");

        try {
            ResponseEntity<String> response = rundeckService.post("tokens", payload, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response.getBody());
                return root.path("token").asText(null);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

}
