package com.boa.di.rundeckproject.controller.sshPath;

import com.boa.di.rundeckproject.dto.SshPathDTO;
import com.boa.di.rundeckproject.error.ErrorDetail;
import com.boa.di.rundeckproject.model.SshPath;
import com.boa.di.rundeckproject.repository.SshPathRepository;
import com.boa.di.rundeckproject.service.sshPath.SshPathService;
import com.boa.di.rundeckproject.success.SuccessDetail;
import com.boa.di.rundeckproject.util.MapperUtil;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sshpath")
public class SshPathController {

    private final SshPathService sshPathService;
    private final SshPathRepository sshPathRepository;

    public SshPathController(SshPathService sshPathService, SshPathRepository sshPathRepository) {
        this.sshPathService = sshPathService;
        this.sshPathRepository = sshPathRepository;
    }

    @GetMapping("/list")
    public ResponseEntity<List<SshPathDTO>> getAllSshPaths() {
        try {
            List<SshPath> sshPaths = sshPathRepository.findAll();
            List<SshPathDTO> sshPathDTOs = sshPaths.stream()
                    .map(MapperUtil::toSshPathDto)
                    .toList();
            return ResponseEntity.ok(sshPathDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveSshPath(@RequestBody SshPath sshPath) {
        try {
            SshPath savedPath = sshPathService.saveCredentialAndRegister(sshPath);
            return ResponseEntity.ok(savedPath);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lecture/écriture fichier: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'enregistrement : " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteSshKey(@PathVariable("id") String idSshPath) {
        try {
            Optional<SshPath> optionalSshPath = sshPathRepository.findById(idSshPath);
            if (optionalSshPath.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorDetail(
                                HttpStatus.NOT_FOUND.value(),
                                "Clé SSH non trouvée",
                                Instant.now().toEpochMilli(),
                                "/api/sshpath/delete/" + idSshPath,
                                "Aucune entrée avec id = " + idSshPath
                        ));
            }

            SshPath sshPath = optionalSshPath.get();
            String storagePath = sshPath.getKeyStorage().replaceFirst("^keys/", ""); // enlever le préfixe "keys/"

            sshPathService.deleteKeyFromRundeck(storagePath);
            sshPathRepository.deleteById(idSshPath);

            SuccessDetail successDetail = new SuccessDetail(
                    HttpStatus.OK.value(),
                    "Clé SSH supprimée avec succès",
                    Instant.now().toEpochMilli(),
                    "/api/sshpath/delete/" + idSshPath,
                    idSshPath
            );

            return ResponseEntity.ok(successDetail);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorDetail(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Erreur lors de la suppression de la clé",
                            Instant.now().toEpochMilli(),
                            "/api/sshpath/delete/" + idSshPath,
                            e.getMessage()
                    ));
        }
    }

    @GetMapping("/download")
    public ResponseEntity<String> downloadKey(@RequestParam String keyStoragePath) {
        String keyContent = sshPathService.downloadKey(keyStoragePath);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("id_rsa") // ou extraire du path
                .build());

        return new ResponseEntity<>(keyContent, headers, HttpStatus.OK);
    }

}
