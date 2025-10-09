package com.boa.di.rundeckproject.service.sshPath;

import com.boa.di.rundeckproject.dto.SshPathStatsDTO;
import com.boa.di.rundeckproject.model.SshPath;
import com.boa.di.rundeckproject.repository.SshPathRepository;
import com.boa.di.rundeckproject.service.RundeckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SshPathServiceImpl implements SshPathService {

    private final SshPathRepository sshPathRepository;
    private final RundeckService rundeckService;
    private final RestTemplate restTemplate;
    private final String localPrivateKeyPath;
    private final JdbcTemplate jdbcTemplate;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public SshPathServiceImpl(
            SshPathRepository sshPathRepository,
            RundeckService rundeckService,
            JdbcTemplate jdbcTemplate,
            @Value("${ssh.path.key.local}") String localPrivateKeyPath, BCryptPasswordEncoder passwordEncoder
    ) {
        this.sshPathRepository = sshPathRepository;
        this.rundeckService = rundeckService;
        this.localPrivateKeyPath = localPrivateKeyPath;
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public SshPath saveCredentialAndRegister(SshPath sshPath) throws IOException {
        String storagePath = sshPath.getKeyStorage();

        String content;
        String storageType;
        MediaType contentType;

        if (sshPath.getPassword() != null && !sshPath.getPassword().isBlank()) {
            content = sshPath.getPassword();
            String hashPassword = passwordEncoder.encode(content);
            sshPath.setPassword(hashPassword);
            storageType = "password";
            contentType = MediaType.TEXT_PLAIN;
            sshPath.setKeyStorage("keys/" + storagePath);
            sshPath.setYamlStorageKey("ssh-password-storage-path");

        } else if (sshPath.getPrivateKeyContent() != null && !sshPath.getPrivateKeyContent().isBlank()) {
            content = sshPath.getPrivateKeyContent();
            storageType = "privateKey";
            contentType = MediaType.APPLICATION_OCTET_STREAM;

            sshPath.setKeyStorage("keys/" + storagePath);
            sshPath.setYamlStorageKey("ssh-key-storage-path");

        } else if (sshPath.getNameKeyPrivate() != null && !sshPath.getNameKeyPrivate().isBlank()) {
            String fileName = Paths.get(sshPath.getNameKeyPrivate()).getFileName().toString();
            String privateKeyFullPath = Paths.get(localPrivateKeyPath, fileName).toString();
            content = Files.readString(Paths.get(privateKeyFullPath));
            storageType = "privateKey";
            contentType = MediaType.APPLICATION_OCTET_STREAM;

            sshPath.setKeyStorage("keys/" + storagePath);
            sshPath.setYamlStorageKey("ssh-key-storage-path");

        } else {
            throw new IllegalArgumentException("Aucun mot de passe ou clé privée fournie.");
        }

        ResponseEntity<String> response = uploadCredentialToRundeck(storagePath, content, storageType, contentType);

        if (response.getStatusCode().is2xxSuccessful()) {
            return sshPathRepository.save(sshPath);
        } else {
            throw new RuntimeException("Erreur API Rundeck: " + response.getStatusCode() + " - " + response.getBody());
        }
    }

    private ResponseEntity<String> uploadCredentialToRundeck(String storagePath, String content, String storageType, MediaType contentType) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Rundeck-Auth-Token", rundeckService.getToken());
        headers.setContentType(contentType);

        HttpEntity<String> entity = new HttpEntity<>(content, headers);

        String format = storageType.equals("privateKey") ? "private" : "string";

        String url = rundeckService.buildUrl(
                "/storage/keys/" + storagePath + "?storageType=" + storageType + "&format=" + format
        );

        return restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
    }

    @Override
    public void deleteKeyFromRundeck(String storagePath) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Rundeck-Auth-Token", rundeckService.getToken());

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        String url = rundeckService.buildUrl("/storage/keys/" + storagePath);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, requestEntity, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Erreur lors de la suppression de la clé Rundeck: " +
                    response.getStatusCode() + " - " + response.getBody());
        }
    }

    @Override
    public String downloadKey(String keyStoragePath) {
        String url = rundeckService.getApiUrl() + "/storage/keys/" + keyStoragePath;

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Rundeck-Auth-Token", rundeckService.getToken());

        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_OCTET_STREAM));

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    byte[].class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                byte[] keyBytes = response.getBody();

                // Convertir le binaire en texte si c’est une clé privée lisible
                return new String(keyBytes, StandardCharsets.UTF_8);
            } else {
                throw new RuntimeException("Impossible de récupérer la clé, status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération de la clé : " + e.getMessage(), e);
        }
    }

    @Override
    public SshPathStatsDTO getStats() {
        long totalKeys = sshPathRepository.countTotalKeys();
        long uniquePorts = sshPathRepository.countDistinctSshPorts();

        List<Object[]> keyTypeCounts = sshPathRepository.countByKeyType();
        Map<String, Long> keyTypeMap = new HashMap<>();
        for (Object[] row : keyTypeCounts) {
            keyTypeMap.put((String) row[0], (Long) row[1]);
        }

        Map<String, Long> nodeCountByKeyType = sshPathRepository.countNodesByKeyType()
                .stream()
                .collect(Collectors.toMap(
                        SshPathRepository.KeyTypeNodeCount::getKeyType,
                        SshPathRepository.KeyTypeNodeCount::getNodeCount
                ));

        List<SshPath> sshPaths = sshPathRepository.findAll();

        return new SshPathStatsDTO(totalKeys, keyTypeMap, uniquePorts, nodeCountByKeyType, sshPaths);
    }

}
