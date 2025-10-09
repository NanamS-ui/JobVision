package com.boa.di.rundeckproject.service.run;

import com.boa.di.rundeckproject.dto.job.RunCommandDTO;
import com.boa.di.rundeckproject.model.Run;
import com.boa.di.rundeckproject.repository.RunRepository;
import com.boa.di.rundeckproject.service.RundeckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class RunService {

    @Autowired
    private final RunRepository runRepository;
    @Autowired
    private final RundeckService rundeckService;
    public RunService(RunRepository runRepository, RundeckService runService) {
        this.runRepository = runRepository;
        this.rundeckService = runService;
    }

    public Run saveRun(Run run) {
        return runRepository.save(run);
    }

    public List<Run> getAllRuns() {
        return runRepository.findAll();
    }

    public Run getRunById(Long id) {
        return runRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Run non trouvé avec l'id : " + id));
    }

    public Run runCommand(RunCommandDTO dto) {
        String projectId = dto.getProjectId();
        String command = dto.getCommand();
        List<String> nodeIds = dto.getNodeIds();

        try {
            String nodeFilter = "name:" + String.join(",", nodeIds);

            Map<String, Object> body = Map.of(
                    "project", projectId,
                    "exec", command,
                    "filter", nodeFilter
            );

            ResponseEntity<Map> response = rundeckService.post("project/" + projectId + "/run/command", body, Map.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Échec de l'exécution de la commande via Rundeck");
            }

            Map<String, Object> execution = (Map<String, Object>) response.getBody().get("execution");

            Long executionId = null;
            if (execution != null && execution.get("id") != null) {
                executionId = Long.valueOf(execution.get("id").toString());
            }

            Run run = new Run();
            run.setProjectId(projectId);
            run.setCommand(command);
            run.setNodeIds(String.join(",", nodeIds));
            run.setExecutionId(executionId);
            run.setStatus("RUNNING");

            return runRepository.save(run);

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du lancement de la commande sur Rundeck: " + e.getMessage(), e);
        }
    }

}
