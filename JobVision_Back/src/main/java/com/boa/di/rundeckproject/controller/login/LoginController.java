package com.boa.di.rundeckproject.controller.login;

import com.boa.di.rundeckproject.dto.LoginResponse;
import com.boa.di.rundeckproject.model.BlacklistedToken;
import com.boa.di.rundeckproject.model.UserAuth;
import com.boa.di.rundeckproject.repository.BlacklistedTokenRepository;
import com.boa.di.rundeckproject.repository.UserAuthRepository;
import com.boa.di.rundeckproject.security.JwtUtil;
import com.boa.di.rundeckproject.service.login.LoginService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class LoginController {

    private final LoginService loginService;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final UserAuthRepository userAuthRepository;
    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    public LoginController(LoginService loginService, BlacklistedTokenRepository blacklistedTokenRepository, UserAuthRepository userAuthRepository) {
        this.loginService = loginService;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
        this.userAuthRepository = userAuthRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestParam String matricule, @RequestParam String password) {
        LoginResponse response = loginService.login(matricule, password);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    public static class LoginRequest {
        private String matricule;
        private String password;
        // getters et setters

        public String getMatricule() {
            return matricule;
        }

        public void setMatricule(String matricule) {
            this.matricule = matricule;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> loginJwt(@RequestBody LoginRequest loginRequest,
                                                  HttpServletResponse httpResponse) {

        LoginResponse response = loginService.loginJwt(loginRequest.getMatricule(), loginRequest.getPassword());

        if (response.isSuccess() && response.getSessionId() != null) {
            String jwt = response.getSessionId();

            ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                    .httpOnly(true)
                    .secure(true)  // à mettre en prod, en dev peut être false
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(3600)
                    .build();

            httpResponse.setHeader("Set-Cookie", cookie.toString());
        }

        return ResponseEntity.ok(response);
    }



    public void blacklistToken(String token) {
        LocalDateTime expiryDate = jwtUtil.getExpiryDateFromToken(token);
        BlacklistedToken blacklistedToken = new BlacklistedToken(token, expiryDate);
        blacklistedTokenRepository.save(blacklistedToken);
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            Authentication authentication,
            HttpServletResponse response,
            @CookieValue(value = "jwt", required = false) String token) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body("Aucun token trouvé dans les cookies");
        }

        // Blacklister le token
        blacklistToken(token);

        // Supprimer le cookie JWT
        ResponseCookie deleteCookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
        response.setHeader("Set-Cookie", deleteCookie.toString());

        // Désactiver l'utilisateur
        if (authentication != null) {
            String matricule = authentication.getName();
            userAuthRepository.findByMatricule(matricule).ifPresent(user -> {
                user.setActive(false);
                userAuthRepository.save(user);
            });
        }

        return ResponseEntity.ok("Déconnexion réussie");
    }



    @GetMapping("/auth/check")
    public ResponseEntity<Map<String, Boolean>> checkAuth(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false));
        }
        return ResponseEntity.ok(Map.of("success", true));
    }


}
