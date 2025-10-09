package com.boa.di.rundeckproject.controller.run;

import com.boa.di.rundeckproject.dto.job.RunCommandDTO;
import com.boa.di.rundeckproject.model.Run;
import com.boa.di.rundeckproject.service.run.RunService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/runs")
public class RunController {

    private final RunService runService;

    public RunController(RunService runService) {
        this.runService = runService;
    }

    // Créer un nouvel enregistrement
    @PostMapping
    public ResponseEntity<Run> createRun(@RequestBody Run run) {
        Run savedRun = runService.saveRun(run);
        return ResponseEntity.ok(savedRun);
    }

    // Lister toutes les exécutions
    @GetMapping
    public ResponseEntity<List<Run>> getAllRuns() {
        return ResponseEntity.ok(runService.getAllRuns());
    }

    // Récupérer une exécution par ID
    @GetMapping("/{id}")
    public ResponseEntity<Run> getRunById(@PathVariable Long id) {
        return ResponseEntity.ok(runService.getRunById(id));
    }

    @PostMapping("/execute")
    public ResponseEntity<Run> executeRun(@RequestBody RunCommandDTO dto) {
        try {
            Run run = runService.runCommand(dto);
            return ResponseEntity.ok(run);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
