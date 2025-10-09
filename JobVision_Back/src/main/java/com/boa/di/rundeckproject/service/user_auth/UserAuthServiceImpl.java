package com.boa.di.rundeckproject.service.user_auth;

import com.boa.di.rundeckproject.dto.UserAuthDTO;
import com.boa.di.rundeckproject.dto.UserCreateDTO;
import com.boa.di.rundeckproject.model.Role;
import com.boa.di.rundeckproject.model.UserAuth;
import com.boa.di.rundeckproject.repository.RoleRepository;
import com.boa.di.rundeckproject.repository.ServiceRepository;
import com.boa.di.rundeckproject.repository.UserAuthRepository;
import com.boa.di.rundeckproject.service.RundeckService;
import com.boa.di.rundeckproject.service.service.ServiceService;
import com.boa.di.rundeckproject.util.MapperUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserAuthServiceImpl implements UserAuthService {

    private final UserAuthRepository userRepo;
    private final RoleRepository roleRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final RundeckService rundeckService;
    private final ServiceService serviceService;
    private final ServiceRepository serviceRepo;

    @Value("${rundeck.realm.file}")
    private String realmFilePath;

    @Autowired
    public UserAuthServiceImpl(
            UserAuthRepository userRepo,
            RoleRepository roleRepo,
            BCryptPasswordEncoder passwordEncoder, RundeckService rundeckService, ServiceService serviceService, ServiceRepository serviceRepo) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.passwordEncoder = passwordEncoder;
        this.rundeckService = rundeckService;
        this.serviceService = serviceService;
        this.serviceRepo = serviceRepo;
    }

    @Override
    public UserAuth createUser(UserCreateDTO request) throws Exception {
        Role role = roleRepo.findByVal("USER")
                .orElseThrow(() -> new RuntimeException("Rôle 'USER' introuvable"));

        com.boa.di.rundeckproject.model.Service service = serviceRepo.findById(request.getIdService())
                .orElseThrow(() -> new RuntimeException("Service introuvable"));

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        UserAuth user = new UserAuth();
        user.setMatricule(request.getMatricule());
        user.setPassword(hashedPassword);
        user.setActive(false);
        user.setRole(role); // Rôle fixé à ADMIN
        user.setService(service);
        user = userRepo.save(user); // assignation du user persisté

        addToRealmFile(request.getMatricule(), request.getPassword(), role.getVal());

        restartRundeck();

        return user;
    }


    @Override
    public UserAuth createUserJwt(UserCreateDTO request){
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        Role role = roleRepo.findByVal("USER")
                .orElseThrow(() -> new RuntimeException("Rôle 'USER' introuvable"));
        UserAuth user = new UserAuth();
        user.setMatricule(request.getMatricule());
        user.setName(request.getName());
        user.setLastname(request.getLastname());
        user.setEmail(request.getEmail());
        user.setPassword(hashedPassword);
        user.setRole(role);
        user.setActive(false);
        user = userRepo.save(user);

        return user;
    }

    private void addToRealmFile(String username, String password, String role) throws IOException {
        Path realmFile = Paths.get(realmFilePath);
        List<String> lines = Files.readAllLines(realmFile);

        if (lines.stream().anyMatch(l -> l.startsWith(username + ":"))) return;

        String entry = username + ":" + password + "," + role;
        Files.write(realmFile, Collections.singletonList(entry), StandardOpenOption.APPEND);
    }

    private void restartRundeck() throws IOException, InterruptedException {
        rundeckService.stopRundeck();
        Thread.sleep(2000);
        rundeckService.startRundeck();
    }


    @Override
    public void deleteUser(String matricule) throws Exception {
        UserAuth user = userRepo.findUserAuthByMatricule(matricule);

        userRepo.delete(user);

        removeFromRealmFile(matricule);

        restartRundeck();
    }

    private void removeFromRealmFile(String username) throws IOException {
        Path realmFile = Paths.get(realmFilePath);
        List<String> lines = Files.readAllLines(realmFile);

        List<String> updatedLines = lines.stream()
                .filter(line -> !line.startsWith(username + ":"))
                .toList();

        Files.write(realmFile, updatedLines, StandardOpenOption.TRUNCATE_EXISTING);
    }

    @Override
    public List<UserAuthDTO> getAllUsersWithDetails() {
        List<UserAuth> users = userRepo.findAll();
        return users.stream()
                .map(MapperUtil::toUserAuthDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserAuthDTO> getUsersByService(com.boa.di.rundeckproject.model.Service service) {
        List<UserAuth> users = userRepo.findByService(service);
        return users.stream()
                .map(MapperUtil::toUserAuthDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserAuthDTO> getUsersByIdService(Integer serviceId) {
        List<UserAuth> users = userRepo.findByServiceId(serviceId);
        return users.stream()
                .map(MapperUtil::toUserAuthDTO)
                .collect(Collectors.toList());
    }
}
