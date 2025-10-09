package com.boa.di.rundeckproject.controller.user_auth;

import com.boa.di.rundeckproject.dto.UserAuthDTO;
import com.boa.di.rundeckproject.dto.UserCreateDTO;
import com.boa.di.rundeckproject.error.ErrorDetail;
import com.boa.di.rundeckproject.model.Service;
import com.boa.di.rundeckproject.model.UserAuth;
import com.boa.di.rundeckproject.repository.ServiceRepository;
import com.boa.di.rundeckproject.repository.UserAuthRepository;
import com.boa.di.rundeckproject.service.service.ServiceService;
import com.boa.di.rundeckproject.service.user_auth.UserAuthService;
import com.boa.di.rundeckproject.success.SuccessDetail;
import com.boa.di.rundeckproject.util.MapperUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserAuthController {

    private final UserAuthService userAuthService;
    private final ServiceRepository serviceRepository;
    private final UserAuthRepository authRepository;

    @Autowired
    public UserAuthController(UserAuthService userAuthService, ServiceRepository serviceRepository, UserAuthRepository authRepository) {
        this.userAuthService = userAuthService;

        this.serviceRepository = serviceRepository;
        this.authRepository = authRepository;
    }

    @PostMapping("/create")
    public ResponseEntity<UserAuth> createUser(@RequestBody UserCreateDTO request) {
        UserAuth createdUser = userAuthService.createUserJwt(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PostMapping
    public ResponseEntity<Object> createUser(@RequestBody UserCreateDTO request,
                                             HttpServletRequest httpRequest) {
        String path = httpRequest.getRequestURI();

        try {
            UserAuth userAuth = userAuthService.createUser(request);
            UserAuthDTO userAuthDTO = MapperUtil.toUserAuthDTO(userAuth);

            SuccessDetail success = new SuccessDetail(
                    201,
                    "Utilisateur créé avec succès",
                    Instant.now().toEpochMilli(),
                    path,
                    userAuthDTO  // <-- utilise userAuthDTO ici
            );
            return ResponseEntity.status(201).body(success);
        } catch (Exception ex) {
            ErrorDetail error = new ErrorDetail();
            error.setStatus(500);
            error.setMessage("Erreur lors de la création de l'utilisateur");
            error.setTimestamp(Instant.now().toEpochMilli());
            error.setPath(path);
            error.setDetail(ex.getMessage());

            return ResponseEntity.status(500).body(error);
        }
    }

    @DeleteMapping("/users/{matricule}")
    public ResponseEntity<?> deleteUser(
            @PathVariable String matricule,
            HttpServletRequest request) {
        try {
            userAuthService.deleteUser(matricule);
            return ResponseEntity.ok(new SuccessDetail(
                    HttpStatus.OK.value(),
                    "Utilisateur supprimé avec succès",
                    System.currentTimeMillis(),
                    request.getRequestURI(),
                    null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorDetail(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Erreur lors de la suppression",
                            System.currentTimeMillis(),
                            request.getRequestURI(),
                            e.getMessage()
                    ));
        }
    }

    @GetMapping()
    public ResponseEntity<?> getAllUsers_all(HttpServletRequest request) {
        String path = request.getRequestURI();

        try {
            // Récupérer la liste des utilisateurs avec services et rôles
            List<UserAuthDTO> userDTOs = userAuthService.getAllUsersWithDetails();

            return ResponseEntity.ok(
                    new SuccessDetail(
                            200,
                            "Liste des utilisateurs récupérée avec succès",
                            Instant.now().toEpochMilli(),
                            path,
                            userDTOs
                    )
            );
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(
                    new ErrorDetail(
                            500,
                            "Erreur lors de la récupération des utilisateurs",
                            Instant.now().toEpochMilli(),
                            path,
                            ex.getMessage()
                    )
            );
        }
    }

    @GetMapping("/service/{id}")
    public ResponseEntity<?> getUsersByService(@PathVariable Integer id, HttpServletRequest request) {
        String path = request.getRequestURI();
        try {
            Optional<Service> serviceOpt = serviceRepository.findById(Long.valueOf(id));
            if (serviceOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new ErrorDetail(
                        404,
                        "Service non trouvé",
                        System.currentTimeMillis(),
                        path,
                        "Aucun service avec l'id " + id
                ));
            }

            List<UserAuthDTO> dtos = userAuthService.getUsersByService(serviceOpt.get());

            return ResponseEntity.ok(new SuccessDetail(
                    200,
                    "Utilisateurs du service récupérés",
                    System.currentTimeMillis(),
                    path,
                    dtos
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorDetail(
                    500,
                    "Erreur interne",
                    System.currentTimeMillis(),
                    path,
                    e.getMessage()
            ));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserAuthDTO> getUserProfile(Authentication authentication) {
        String matricule = authentication.getName();

        UserAuth user = authRepository.findByMatricule(matricule)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
        UserAuthDTO userAuthDTO = MapperUtil.toUserAuthDTO(user);

        return ResponseEntity.ok(userAuthDTO);
    }
}