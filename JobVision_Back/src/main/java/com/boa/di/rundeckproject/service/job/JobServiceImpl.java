package com.boa.di.rundeckproject.service.job;

import com.boa.di.rundeckproject.dto.*;
import com.boa.di.rundeckproject.model.*;
import com.boa.di.rundeckproject.repository.*;
import com.boa.di.rundeckproject.service.RundeckService;
import com.boa.di.rundeckproject.service.execution.ExecutionMyService;
import com.boa.di.rundeckproject.service.log.LogOutputService;
import com.boa.di.rundeckproject.service.node_filter.NodeFilterService;
import com.boa.di.rundeckproject.service.option.OptionService;
import com.boa.di.rundeckproject.util.MapperUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {
    private final RundeckService rundeckService;
    private final RestTemplate restTemplate;
    private final JobRepository jobRepository;
    private final WorkflowMyRepository workflowMyRepository;
    private final NodeFilterRepository nodeFilterRepository;
    private final NodeFilterService nodeFilterService;
    private final EntityManager entityManager;
    private final ExecutionMyService executionMyService;
    private final ExecutionMyRepository executionMyRepository;
    private final LogOutputService logOutputService;
    private final ProjectRepository projectRepository;
    private final WorkflowStepMyRepository workflowStepMyRepository;
    private final OptionRepository optionRepository;
    private final OptionService optionService;

    @Autowired
    public JobServiceImpl(RundeckService rundeckService, JobRepository jobRepository, WorkflowMyRepository workflowMyRepository, NodeFilterRepository nodeFilterRepository, NodeFilterService nodeFilterService, EntityManager entityManager, @Lazy ExecutionMyService executionMyService, ExecutionMyRepository executionMyRepository, LogOutputService logOutputService, ProjectRepository projectRepository, WorkflowStepMyRepository workflowStepMyRepository, OptionRepository optionRepository, OptionService optionService) {
        this.rundeckService = rundeckService;
        this.jobRepository = jobRepository;
        this.workflowMyRepository = workflowMyRepository;
        this.nodeFilterRepository = nodeFilterRepository;
        this.nodeFilterService = nodeFilterService;
        this.entityManager = entityManager;
        this.executionMyService = executionMyService;
        this.executionMyRepository = executionMyRepository;
        this.logOutputService = logOutputService;
        this.projectRepository = projectRepository;
        this.workflowStepMyRepository = workflowStepMyRepository;
        this.optionRepository = optionRepository;
        this.optionService = optionService;
        this.restTemplate = new RestTemplate();
    }

    @Override
    @Transactional
    public ResponseEntity<String> createJob(Job job, List<Node> listNode) {
        NodeFilter nodeFilter = new NodeFilter();
        String nodeNames = nodeFilterService.getFiltersNodes(listNode);
        nodeFilter.setFilterNode(nodeNames);
        nodeFilterRepository.save(nodeFilter);
        Project project = projectRepository.findProjectById(job.getProject().getId());

        job.setNodeFilter(nodeFilter);
        // Ensure project on job is the managed entity so XML uses the correct project name
        job.setProject(project);

        if (job.getUuid() == null || job.getUuid().isEmpty()) {
            job.setUuid(UUID.randomUUID().toString());
        }

        WorkflowMy workflow = job.getWorkflow();
        if (workflow == null) {
            return ResponseEntity.badRequest().body("Workflow must not be null");
        }

        workflow.setJob(job);
        if (workflow.getSteps() != null) {
            for (WorkflowStepMy step : workflow.getSteps()) {
                step.setWorkflow(workflow);

                if (step.getErrorHandler() != null) {
                    ErrorHandler handler = step.getErrorHandler();
                    handler.setStep(step);
                    handler.setJob(job);
                }
            }
        }


        if (workflow.getOptions() != null) {
            for (Option option : workflow.getOptions()) {
                option.setWorkflow(workflow);
            }
        }

        jobRepository.save(job);

        String jobXml = generateJobXml(job, workflow);

        HttpHeaders headers = rundeckService.createHeaders();
        headers.setContentType(MediaType.APPLICATION_XML);

        HttpEntity<String> requestEntity = new HttpEntity<>(jobXml, headers);

        String path = "project/" + project.getName() + "/jobs/import?format=xml";

        return rundeckService.send(path, HttpMethod.POST, requestEntity, String.class);
    }

    @Transactional
    @Override
    public ResponseEntity<String> updateJob(Long id, Job updatedJob, List<Node> listNode) {
        Optional<Job> existingJobOpt = jobRepository.findById(id);
        if (existingJobOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Job not found with id: " + id);
        }

        Job existingJob = existingJobOpt.get();
        String jobUuid = existingJob.getUuid();

        // 1. Supprimer l'ancien workflow
        WorkflowMy oldWorkflow = existingJob.getWorkflow();
        if (oldWorkflow != null) {
            Long oldWorkflowId = oldWorkflow.getId();

            // DÃ©tacher le job et le workflow
            existingJob.setWorkflow(null);
            jobRepository.save(existingJob);

            oldWorkflow.setJob(null);
            workflowMyRepository.save(oldWorkflow);

            // Supprimer le workflow (ses steps et options partiront avec grÃ¢ce Ã  ON DELETE CASCADE)
            workflowMyRepository.delete(oldWorkflow);
            workflowMyRepository.flush();

            // VÃ©rifier la suppression
            if (workflowMyRepository.findById(oldWorkflowId).isPresent()) {
                throw new RuntimeException("Erreur : le workflow n'a pas Ã©tÃ© supprimÃ© !");
            }
        }

        // 2. Mettre Ã  jour NodeFilter
        NodeFilter nodeFilter = existingJob.getNodeFilter();
        String nodeNames = nodeFilterService.getFiltersNodes(listNode);
        if (nodeFilter == null) {
            nodeFilter = new NodeFilter();
        }
        nodeFilter.setFilterNode(nodeNames);
        nodeFilterRepository.save(nodeFilter);
        updatedJob.setNodeFilter(nodeFilter);

        // 3. Mettre Ã  jour les autres champs du job
        updatedJob.setId(id);
        updatedJob.setUuid(jobUuid);
        updatedJob.setProject(projectRepository.findProjectById(updatedJob.getProject().getId()));
        updatedJob.setCreatedAt(existingJob.getCreatedAt());
        updatedJob.setUpdatedAt(LocalDateTime.now());
        // Utiliser la nouvelle expression cron au lieu de l'ancienne
        // updatedJob.setCronExpression(existingJob.getCronExpression());

        // 4. Attacher un nouveau workflow
        WorkflowMy newWorkflow = updatedJob.getWorkflow();
        if (newWorkflow == null) {
            return ResponseEntity.badRequest().body("Workflow must not be null");
        }
        newWorkflow.setJob(updatedJob);

        // **Corriger les entitÃ©s dÃ©tachÃ©es**
        if (newWorkflow.getSteps() != null) {
            for (WorkflowStepMy step : newWorkflow.getSteps()) {
                step.setId(null); // force lâ€™insertion
                step.setWorkflow(newWorkflow);

                if (step.getErrorHandler() != null) {
                    ErrorHandler handler = step.getErrorHandler();
                    handler.setId(null); // force lâ€™insertion
                    handler.setStep(step);
                    handler.setJob(updatedJob);
                }
            }
        }

        if (newWorkflow.getOptions() != null) {
            for (Option option : newWorkflow.getOptions()) {
                option.setId(null); // force lâ€™insertion
                option.setWorkflow(newWorkflow);
            }
        }

        workflowMyRepository.save(newWorkflow);
        jobRepository.save(updatedJob);

        // 5. Supprimer l'ancien job dans Rundeck
        String deletePath = "job/" + jobUuid;
        ResponseEntity<String> deleteResponse = rundeckService.delete(deletePath, String.class);
        if (!deleteResponse.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to delete job from Rundeck before update");
        }

        // 6. RÃ©importer le job
        String jobXml = generateJobXml(updatedJob, newWorkflow);
        HttpHeaders headers = rundeckService.createHeaders();
        headers.setContentType(MediaType.APPLICATION_XML);
        HttpEntity<String> requestEntity = new HttpEntity<>(jobXml, headers);
        String path = "project/" + updatedJob.getProject().getName() + "/jobs/import?format=xml";

        return rundeckService.send(path, HttpMethod.POST, requestEntity, String.class);
    }


    @Override
    public ResponseEntity<JobRequestUpdateDTO> getJobById(Long jobId) {
        Optional<Job> jobOpt = jobRepository.findById(jobId);

        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Job job = jobOpt.get();
        NodeFilter nodeFilter = job.getNodeFilter();
        List<Node> nodes = List.of();

        if (nodeFilter != null) {
            String filter = nodeFilter.getFilterNode();
            nodes = nodeFilterService.extractNodesFromFilter(filter);
        }

        JobRequestUpdateDTO jobRequestUpdateDTO = new JobRequestUpdateDTO();
        JobDTO jobDTO = getJobDetails(job);
        List<NodeDTO> nodeDTOList = nodes.stream()
                .map(MapperUtil::toDto)  // MapperUtil.toDto(Node node)
                .collect(Collectors.toList());

        jobRequestUpdateDTO.setJobDTO(jobDTO);
        jobRequestUpdateDTO.setNodeDTOList(nodeDTOList);

        return ResponseEntity.ok(jobRequestUpdateDTO);
    }

    private String escapeXml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private String generateJobXml(Job job, WorkflowMy workflow) {
        StringBuilder xml = new StringBuilder();
        xml.append("<joblist>\n");
        xml.append("  <job>\n");

        xml.append("    <name>").append(escapeXml(job.getName())).append("</name>\n");
        xml.append("    <description>").append(escapeXml(job.getDescription())).append("</description>\n");
        xml.append("    <uuid>").append(escapeXml(job.getUuid())).append("</uuid>\n");
        xml.append("    <loglevel>").append(escapeXml(job.getLogLevel())).append("</loglevel>\n");

        xml.append("    <context>\n");
        xml.append("      <project>").append(escapeXml(job.getProject().getName())).append("</project>\n");

        // Options must be under <context> per Rundeck XML schema
        if (workflow.getOptions() != null && !workflow.getOptions().isEmpty()) {
            xml.append("      <options>\n");
            for (Option option : workflow.getOptions()) {
                xml.append("        <option name=\"")
                        .append(escapeXml(option.getName()))
                        .append("\">\n");

                if (option.getDescription() != null) {
                    xml.append("          <description>")
                            .append(escapeXml(option.getDescription()))
                            .append("</description>\n");
                }

                xml.append("          <required>")
                        .append(option.isRequired())
                        .append("</required>\n");

                if (option.getDefaultValue() != null) {
                    xml.append("          <value>")
                            .append(escapeXml(option.getDefaultValue()))
                            .append("</value>\n");
                }

                if (option.getAllowedValues() != null && !option.getAllowedValues().isEmpty()) {
                    xml.append("          <values>\n");
                    for (String val : option.getAllowedValues().split(",")) {
                        String trimmed = val != null ? val.trim() : null;
                        if (trimmed != null && !trimmed.isEmpty()) {
                            xml.append("            <value>")
                                    .append(escapeXml(trimmed))
                                    .append("</value>\n");
                        }
                    }
                    xml.append("          </values>\n");
                }

                xml.append("          <multivalued>")
                        .append(option.isMultivalued())
                        .append("</multivalued>\n");

                xml.append("          <secure>")
                        .append(option.isSecure())
                        .append("</secure>\n");

                xml.append("          <valueExposed>")
                        .append(option.isValueExposed())
                        .append("</valueExposed>\n");

                if (option.getRegex() != null) {
                    xml.append("          <regex>")
                            .append(escapeXml(option.getRegex()))
                            .append("</regex>\n");
                }

                xml.append("        </option>\n");
            }
            xml.append("      </options>\n");
        }

        xml.append("    </context>\n");

        xml.append("    <dispatch>\n");
        xml.append("      <threadcount>").append(workflow.getThreadcount()).append("</threadcount>\n");
        xml.append("      <keepgoing>").append(workflow.getKeepgoing()).append("</keepgoing>\n");
        xml.append("    </dispatch>\n");

        if (job.getCronExpression() != null && !job.getCronExpression().isEmpty()) {
            String[] parts = job.getCronExpression().split(" ");
            if (parts.length >= 6) {
                String seconds = parts[0];
                String minutes = parts[1];
                String hours = parts[2];
                String dayOfMonth = parts[3];
                String month = parts[4];
                String dayOfWeek = parts[5];
                String year = (parts.length >= 7) ? parts[6] : "*";

                xml.append("    <schedule>\n");
                xml.append("      <month>").append(escapeXml(month)).append("</month>\n");
                xml.append("      <time>\n");
                xml.append("        <seconds>").append(escapeXml(seconds)).append("</seconds>\n");
                xml.append("        <minute>").append(escapeXml(minutes)).append("</minute>\n");
                xml.append("        <hour>").append(escapeXml(hours)).append("</hour>\n");
                xml.append("      </time>\n");
                xml.append("      <dayofmonth>").append(escapeXml(dayOfMonth)).append("</dayofmonth>\n");
                xml.append("      <year>").append(escapeXml(year)).append("</year>\n");

                if (!"?".equals(dayOfWeek)) {
                    xml.append("      <weekdays>\n");
                    for (String day : dayOfWeek.split(",")) {
                        xml.append("        <day>").append(escapeXml(day)).append("</day>\n");
                    }
                    xml.append("      </weekdays>\n");
                }

                xml.append("    </schedule>\n");
            }
        }

        xml.append("    <scheduleEnabled>")
                .append(job.getScheduleEnabled() != null && job.getScheduleEnabled() ? "true" : "false")
                .append("</scheduleEnabled>\n");

        if (job.getExecutionEnabled() != null && !job.getExecutionEnabled()) {
            xml.append("    <executionEnabled>false</executionEnabled>\n");
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        if (job.getCreatedAt() != null) {
            xml.append("    <created>").append(job.getCreatedAt().format(formatter)).append("</created>\n");
        }
        if (job.getUpdatedAt() != null) {
            xml.append("    <updated>").append(job.getUpdatedAt().format(formatter)).append("</updated>\n");
        }

        if (job.getNodeFilter() != null) {
            xml.append("    <nodefilters>\n");
            xml.append("      <filter>").append(escapeXml(job.getNodeFilter().getFilterNode())).append("</filter>\n");
            xml.append("    </nodefilters>\n");
        }

        // options moved under <context>

        xml.append("    <sequence keepgoing=\"").append(workflow.getKeepgoing())
                .append("\" strategy=\"").append(escapeXml(workflow.getStrategy())).append("\">\n");

        for (WorkflowStepMy step : workflow.getSteps()) {
            if ("job-ref".equalsIgnoreCase(step.getPluginType()) && step.getJobRef_() != null) {
                xml.append("      <command>\n");
                xml.append("        <jobref");

                if (step.getJobRef_().getUuid() != null) {
                    xml.append(" uuid=\"").append(escapeXml(step.getJobRef_().getUuid())).append("\"");
                } else {
                    if (step.getJobRef_().getNameRef() != null) {
                        xml.append(" name=\"").append(escapeXml(step.getJobRef_().getNameRef())).append("\"");
                    }
                    if (step.getJobRef_().getGroup() != null) {
                        xml.append(" group=\"").append(escapeXml(step.getJobRef_().getGroup())).append("\"");
                    }
                }

                xml.append(" />\n");
                xml.append("      </command>\n");

            } else {
                xml.append("      <command>\n");

                if (step.getScript() != null && !step.getScript().isEmpty()) {
                    xml.append("        <script>").append(escapeXml(step.getScript())).append("</script>\n");
                    if (step.getScriptType() != null) {
                        xml.append("        <scriptargs>")
                                .append(step.getArgs() != null ? escapeXml(step.getArgs()) : "")
                                .append("</scriptargs>\n");
                    }
                } else if (step.getCommand() != null && !step.getCommand().isEmpty()) {
                    xml.append("        <exec>").append(escapeXml(step.getCommand())).append("</exec>\n");
                } else if (step.getFilePath() != null && !step.getFilePath().isEmpty()) {
                    xml.append("        <scriptfile>").append(escapeXml(step.getFilePath())).append("</scriptfile>\n");
                    if (step.getInterpreter() != null) {
                        xml.append("        <scriptinterpreter>").append(escapeXml(step.getInterpreter())).append("</scriptinterpreter>\n");
                    }
                }

                if (step.getKeepgoingOnSuccess() != null) {
                    xml.append("        <keepgoingOnSuccess>").append(step.getKeepgoingOnSuccess()).append("</keepgoingOnSuccess>\n");
                }
                if (step.getKeepgoingOnFailure() != null) {
                    xml.append("        <keepgoingOnFailure>").append(step.getKeepgoingOnFailure()).append("</keepgoingOnFailure>\n");
                }

                if (step.getErrorHandler() != null) {
                    ErrorHandler eh = step.getErrorHandler();
                    xml.append("        <errorhandler>\n");

                    switch (eh.getHandlerType()) {
                        case COMMAND:
                            xml.append("          <exec>")
                                    .append(escapeXml(eh.getHandlerCommand()))
                                    .append("</exec>\n");
                            break;
                        case JOBREF:
                            xml.append("          <jobref name=\"")
                                    .append(escapeXml(eh.getHandlerCommand()))
                                    .append("\" />\n");
                            break;
                        case SCRIPT:
                            xml.append("          <script>")
                                    .append(escapeXml(eh.getHandlerCommand()))
                                    .append("</script>\n");
                            break;
                        case SCRIPTFILE:
                            xml.append("          <scriptfile>")
                                    .append(escapeXml(eh.getHandlerCommand()))
                                    .append("</scriptfile>\n");
                            break;
                        case WORKFLOW:
                            xml.append("          <workflow name=\"")
                                    .append(escapeXml(eh.getHandlerCommand()))
                                    .append("\" />\n");
                            break;
                    }

                    if (eh.getHandlerDescription() != null) {
                        xml.append("          <description>")
                                .append(escapeXml(eh.getHandlerDescription()))
                                .append("</description>\n");
                    }

                    if (eh.getContinueOnError() != null) {
                        xml.append("          <continueOnError>")
                                .append(eh.getContinueOnError())
                                .append("</continueOnError>\n");
                    }

                    xml.append("        </errorhandler>\n");
                }


                if (step.getName() != null) {
                    xml.append("        <description>").append(escapeXml(step.getName())).append("</description>\n");
                }

                xml.append("      </command>\n");
            }
        }

        xml.append("    </sequence>\n");

        xml.append("  </job>\n");
        xml.append("</joblist>\n");

        return xml.toString();
    }

    @Override
    public JobDTO getJobDetails(Job job) {
        WorkflowMy workflow = job.getWorkflow();
        NodeFilter nodeFilter = job.getNodeFilter();
        Project project = job.getProject();

        List<WorkflowStepMyDTO> stepDTOs = new ArrayList<>();
        List<OptionDTO> optionDTOs = new ArrayList<>();
        if (workflow != null && workflow.getSteps() != null) {
            for (WorkflowStepMy step : workflow.getSteps()) {
                WorkflowStepMyDTO stepDTO = new WorkflowStepMyDTO();
                stepDTO.setStepNumber(step.getStepNumber());
                stepDTO.setName(step.getName());
                stepDTO.setDescription(step.getDescription());
                stepDTO.setPluginType(step.getPluginType());
                stepDTO.setCommand(step.getCommand());
                stepDTO.setNodeStep(step.getNodeStep());
                stepDTO.setKeepgoingOnSuccess(step.getKeepgoingOnSuccess());
                stepDTO.setKeepgoingOnFailure(step.getKeepgoingOnFailure());
                stepDTO.setScript(step.getScript());
                stepDTO.setScriptType(step.getScriptType());
                stepDTO.setArgs(step.getArgs());
                stepDTO.setFilePath(step.getFilePath());
                stepDTO.setInterpreter(step.getInterpreter());
                stepDTO.setErrorHandlers(MapperUtil.mapperErrorHandlerDTO(step.getErrorHandler()));
                stepDTO.setJobRef(step.getJobRef());
                JobRef jobRef = step.getJobRef_();
                if (jobRef != null) {
                    Optional<Job> jobOptional = jobRepository.findJobByUuid(step.getJobRef());
                    if (jobOptional.isPresent()) {
                        jobRef.setUuid(jobOptional.get().getUuid());
                        jobRef.setNameRef(jobOptional.get().getName());

                        stepDTO.setJobRefObj(jobRef);
                    }
                }
                stepDTOs.add(stepDTO);
            }
        }

        WorkflowMyDTO workflowDTO = new WorkflowMyDTO();
        if (workflow != null) {
            workflowDTO.setStrategy(workflow.getStrategy());
            workflowDTO.setKeepgoing(workflow.getKeepgoing());
            workflowDTO.setDescription(workflow.getDescription());
            workflowDTO.setSteps(stepDTOs);

            if (workflow.getOptions() != null) {
                optionDTOs = workflow.getOptions().stream()
                        .map(MapperUtil::toMapperOption)
                        .toList();
            }
            workflowDTO.setOptions(optionDTOs);
        }

        JobDTO dto = new JobDTO();
        if (job.getNotifications() != null) {
            List<NotificationMyDTO> notifDTOs = job.getNotifications().stream()
                    .map(MapperUtil::toDTO)
                    .collect(Collectors.toList());
            dto.setNotifications(notifDTOs);
        } else {
            dto.setNotifications(Collections.emptyList());
        }
        dto.setId(job.getId());
        dto.setUuid(job.getUuid());
        dto.setName(job.getName());
        dto.setDescription(job.getDescription());
        dto.setLogLevel(job.getLogLevel());
        dto.setExecutionEnabled(job.getExecutionEnabled());
        dto.setScheduleEnabled(job.getScheduleEnabled());
        dto.setCreatedAt(String.valueOf(job.getCreatedAt()));
        dto.setUpdatedAt(String.valueOf(job.getUpdatedAt()));
        dto.setCronExpression(job.getCronExpression());
        dto.setMyWorkflow(workflowDTO);
        dto.setNodeFilterId(nodeFilter.getId());
        dto.setNodeFilterText(nodeFilter.getFilterNode());
        dto.setProjectId(project.getId());
        dto.setProjectName(project.getName());
        dto.setPriority(job.getPriority());

        return dto;
    }

    @Override
    public JobDetailDTO getJobDetailsResponse(Job job) {
        Long executionId = executionMyService.getLastExecutionIdByJobUuidDB(job.getUuid());
        ExecutionStateResponse state = waitForExecutionStateSteps(executionId);

        if (state != null) {
            enrichStateWithProgressAndLogs(state, executionId);
        }

        List<WorkflowStepMyDTO> stepDTOs = mapWorkflowSteps(job.getWorkflow(), state, job.getUuid());

        WorkflowMyDTO workflowDTO = buildWorkflowDTO(job.getWorkflow(), stepDTOs);
        JobDTO jobDTO = buildJobDTO(job, workflowDTO);

        return new JobDetailDTO(jobDTO, state);
    }

    private ExecutionStateResponse waitForExecutionStateSteps(Long executionId) {
        int retry = 0, maxRetry = 5, delay = 500;
        ExecutionStateResponse state;

        while (retry++ < maxRetry) {
            state = executionMyService.getExecutionProgressFromStateDetail(executionId);
            if (state != null && state.getSteps() != null) return state;

            try {
                Thread.sleep(delay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        return null;
    }

    private void enrichStateWithProgressAndLogs(ExecutionStateResponse state, Long executionId) {
        Map<String, Double> progressPerNode = executionMyService.getExecutionProgressPerNode(executionId);

        for (ExecutionStateResponse.Step step : state.getSteps()) {
            if (step.getNodeStates() == null) continue;

            for (Map.Entry<String, ExecutionStateResponse.Step.NodeState> entry : step.getNodeStates().entrySet()) {
                String nodeName = entry.getKey();
                ExecutionStateResponse.Step.NodeState nodeState = entry.getValue();

                nodeState.setProgressStatePerNode(progressPerNode.getOrDefault(nodeName, 0.0));
                List<LogOutputDTO> logs = logOutputService.getLogsByNodeNameAndExecutionId(nodeName, executionId, step.getStepctx());
                nodeState.setLogs(logs);
            }
        }
    }

    private List<WorkflowStepMyDTO> mapWorkflowSteps(WorkflowMy workflow, ExecutionStateResponse state, String jobUuid) {
        List<WorkflowStepMyDTO> stepDTOs = new ArrayList<>();
        List<ExecutionStateResponse.Step> execSteps = (state != null && state.getSteps() != null) ? state.getSteps() : new ArrayList<>();

        if (workflow == null || workflow.getSteps() == null) return stepDTOs;

        for (WorkflowStepMy step : workflow.getSteps()) {
            WorkflowStepMyDTO dto = new WorkflowStepMyDTO();
            BeanUtils.copyProperties(step, dto); // si tu veux copier les champs automatiquement

            // GÃ©rer JobRef
            JobRef jobRef = step.getJobRef_();
            if (jobRef != null) {
                jobRepository.findJobByUuid(step.getJobRef()).ifPresent(j -> {
                    jobRef.setUuid(j.getUuid());
                    jobRef.setNameRef(j.getName());
                    dto.setJobRefObj(jobRef);
                });
            }

            // Associer exec state
            String stepctx = String.valueOf(step.getStepNumber());
            execSteps.stream()
                    .filter(es -> stepctx.equals(es.getStepctx()))
                    .findFirst()
                    .ifPresent(es -> {
                        dto.setExecutionState(es.getExecutionState());
                        dto.setNodeStates(es.getNodeStates());
                    });

            stepDTOs.add(dto);
        }

        return stepDTOs;
    }

    private WorkflowMyDTO buildWorkflowDTO(WorkflowMy workflow, List<WorkflowStepMyDTO> steps) {
        WorkflowMyDTO dto = new WorkflowMyDTO();
        List<OptionDTO> options = new ArrayList<>();
        if (workflow != null) {
            dto.setStrategy(workflow.getStrategy());
            dto.setKeepgoing(workflow.getKeepgoing());
            dto.setDescription(workflow.getDescription());
            dto.setSteps(steps);

            if (workflow.getOptions() != null) {
                options = workflow.getOptions().stream()
                        .map(MapperUtil::toMapperOption)
                        .toList();
            }
            dto.setOptions(options);
        }
        return dto;
    }

    private JobDTO buildJobDTO(Job job, WorkflowMyDTO workflowDTO) {
        JobDTO dto = new JobDTO();
        dto.setId(job.getId());
        dto.setUuid(job.getUuid());
        dto.setName(job.getName());
        dto.setDescription(job.getDescription());
        dto.setLogLevel(job.getLogLevel());
        dto.setExecutionEnabled(job.getExecutionEnabled());
        dto.setScheduleEnabled(job.getScheduleEnabled());

        dto.setCreatedAt(job.getCreatedAt() != null ? job.getCreatedAt().toString() : null);
        dto.setUpdatedAt(job.getUpdatedAt() != null ? job.getUpdatedAt().toString() : null);
        dto.setCronExpression(job.getCronExpression());
        dto.setMyWorkflow(workflowDTO);
        dto.setPriority(job.getPriority());

        NodeFilter nodeFilter = job.getNodeFilter();
        if (nodeFilter != null) {
            dto.setNodeFilterId(nodeFilter.getId());
            dto.setNodeFilterText(nodeFilter.getFilterNode());
        }

        Project project = job.getProject();
        if (project != null) {
            dto.setProjectId(project.getId());
            dto.setProjectName(project.getName());
        }

        if (job.getNotifications() != null && !job.getNotifications().isEmpty()) {
            List<NotificationMyDTO> notificationDTOs = job.getNotifications()
                    .stream()
                    .map(MapperUtil::toDTO)
                    .collect(Collectors.toList());
            dto.setNotifications(notificationDTOs);
        } else {
            dto.setNotifications(Collections.emptyList());
        }

        return dto;
    }


    @Override
    public JobDTO getJobDetailsById(Long id) {
        Optional<Job> jobOptional = jobRepository.findById(id);
        if (jobOptional.isPresent()) {
            return getJobDetails(jobOptional.get());
        } else {
            throw new EntityNotFoundException("Job avec ID " + id + " non trouvÃ©.");
        }
    }

    @Override
    public JobDTO getJobByUuid(String uuid){
        Optional<Job> jobOptional = jobRepository.findJobByUuid(uuid);
        if (jobOptional.isPresent()) {
            return getJobDetails(jobOptional.get());
        } else {
            throw new EntityNotFoundException("Job avec UUID " + uuid + " non trouvÃ©.");
        }
    }

    @Override
    public List<JobDTO> autocomplete(String query) {
        List<Job> jobs = jobRepository.findByNameContainingIgnoreCase(query);
        List<JobDTO> result = new ArrayList<>();

        for (Job job : jobs) {
            result.add(getJobDetails(job));
        }

        return result;
    }


    @Override
    public ResponseEntity<String> runJob(Long id, Map<String, Object> options) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job introuvable avec l'ID: " + id));

        String jobUuid = job.getUuid();

        String path = "/job/" + jobUuid + "/executions";

        Map<String, Object> body = Map.of("options", options);

        return rundeckService.post(path, body, String.class);
    }

    @Override
    @Transactional
    public ResponseEntity<String> stopJob(Long executionId) {
        try {
            String path = "/execution/" + executionId + "/abort";
            ResponseEntity<String> response = rundeckService.post(path, null, String.class);

            Optional<ExecutionMy> optionalExecution = executionMyRepository.findExecutionMyByExecutionIdRundeck(executionId);
            if (optionalExecution.isPresent()) {
                ExecutionMy execution = optionalExecution.get();

                execution.setStatus("aborted");
                execution.setDateEnded(LocalDateTime.now());

                if (execution.getDateStarted() != null) {
                    long durationMs = Duration.between(execution.getDateStarted(), execution.getDateEnded()).toMillis();
                    execution.setDurationMs(durationMs);
                }

                executionMyRepository.save(execution);
            }

            return response;

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'arrÃªt du job : " + e.getMessage());
        }
    }


    @Override
    public ResponseEntity<String> deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job introuvable avec l'ID: " + id));

        try {
            job.setExecutionEnabled(false);
            job.setDeleted(true);
            job.setPriority(false);
            jobRepository.save(job);
            return ResponseEntity.ok("Job supprimÃ© avec succÃ¨s");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression du job : " + e.getMessage());
        }
    }


    @Override
    public JobStateDTO getJobCounts() {
        int total = jobRepository.countTotalJobs();
        int running = jobRepository.countRunningJobs();
        int succeeded = jobRepository.countJobsLastExecutionSucceeded();
        int failed = jobRepository.countJobsLastExecutionFailed();

        List<JobStatsListDTO> jobStatsListDTOS = getAllJobStats();

        return new JobStateDTO(total, running, succeeded, failed, jobStatsListDTOS);
    }

    @Override
    public List<JobStatsListDTO> getAllJobStats() {
        String sql = """
            SELECT 
                j.id_job,
                j.job_name,
                j.project_name,
                j.service_name,
                j.last_execution_id,
                j.execution_id_rundeck,
                j.date_started,
                j.duration_ms,
                j.status,
                j.is_schedule_enabled,
                j.last_success_date,
                j.last_failed_date,
                j.avg_duration_last_5
            FROM job_last_execution_view j
            WHERE j.is_deleted = false
        """;

        Query query = entityManager.createNativeQuery(sql);
        List<Object[]> results = query.getResultList();

        List<JobStatsListDTO> jobStatsList = new ArrayList<>();

        for (Object[] row : results) {
            Long idJob = ((Number) row[0]).longValue();
            String jobName = (String) row[1];
            String projectName = (String) row[2];
            String serviceName = (String) row[3];
            Long lastExecutionId = row[4] != null ? ((Number) row[4]).longValue() : null;
            Long executionIdRundeck = row[5] != null ? ((Number) row[5]).longValue() : null;
            LocalDateTime dateStarted = row[6] != null ? ((java.sql.Timestamp) row[6]).toLocalDateTime() : null;
            Long durationMs = row[7] != null ? ((Number) row[7]).longValue() : null;
            String status = (String) row[8];
            Boolean scheduleEnabled = (Boolean) row[9];
            LocalDateTime lastSuccessDate =  row[10] != null ? ((java.sql.Timestamp) row[10]).toLocalDateTime() : null;
            LocalDateTime lastFailedDate =  row[11] != null ? ((java.sql.Timestamp) row[11]).toLocalDateTime() : null;
            Long avgDurationLast5 = (row[12] != null) ? ((Number) row[12]).longValue() : 0L;
            double progress = executionIdRundeck != null
                    ? executionMyService.getExecutionProgressFromState(executionIdRundeck)
                    : 0.0;

            JobStatsListDTO dto = new JobStatsListDTO(
                    idJob, jobName, projectName, serviceName,
                    lastExecutionId, executionIdRundeck, dateStarted, progress,durationMs, status
            );
            dto.setScheduled(scheduleEnabled);
            dto.setDateLastSucess(lastSuccessDate);
            dto.setDateLastFailed(lastFailedDate);
            dto.setLast5Execution(avgDurationLast5);
            jobStatsList.add(dto);
        }

        return jobStatsList;
    }

    @Override
    public List<JobStatsListDTO> autocompleteJobs(String queryStr) {
        String sql = """
        SELECT 
            j.id_job,
            j.job_name,
            j.project_name,
            j.service_name,
            j.last_execution_id,
            j.execution_id_rundeck,
            j.date_started,
            j.duration_ms,
            j.status
        FROM job_last_execution_view j
        WHERE LOWER(j.job_name) LIKE LOWER(CONCAT('%', :query, '%')) AND j.is_deleted = false
    """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("query", queryStr);

        List<Object[]> results = query.getResultList();
        List<JobStatsListDTO> jobStatsList = new ArrayList<>();

        for (Object[] row : results) {
            Long idJob = ((Number) row[0]).longValue();
            String jobName = (String) row[1];
            String projectName = (String) row[2];
            String serviceName = (String) row[3];
            Long lastExecutionId = row[4] != null ? ((Number) row[4]).longValue() : null;
            Long executionIdRundeck = row[5] != null ? ((Number) row[5]).longValue() : null;
            LocalDateTime dateStarted = row[6] != null ? ((java.sql.Timestamp) row[6]).toLocalDateTime() : null;
            Long durationMs = row[7] != null ? ((Number) row[7]).longValue() : null;
            String status = (String) row[8];
            double progress = executionMyService.getExecutionProgressFromState(executionIdRundeck);

            JobStatsListDTO dto = new JobStatsListDTO(
                    idJob, jobName, projectName, serviceName,
                    lastExecutionId, executionIdRundeck, dateStarted, progress, durationMs, status
            );

            jobStatsList.add(dto);
        }

        return jobStatsList;
    }

    @Override
    public Path generateExportJobAndReturnPath(Job job, String format) throws IOException {
        String project = job.getProject().getName();
        String uuid = job.getUuid();
        String lowerFormat = format.toLowerCase();

        String acceptHeader;
        String fileExtension;

        switch (lowerFormat) {
            case "yaml" -> {
                acceptHeader = "application/yaml";
                fileExtension = "yaml";
            }
            case "xml" -> {
                acceptHeader = "application/xml";
                fileExtension = "xml";
            }
            case "json" -> {
                acceptHeader = "application/json";
                fileExtension = "json";
            }
            default -> throw new IllegalArgumentException("Unsupported format: " + format);
        }

        String apiPath = String.format("job/%s?format=%s", uuid, lowerFormat);

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Rundeck-Auth-Token", rundeckService.getToken());
        headers.setAccept(List.of(MediaType.parseMediaType(acceptHeader)));

        HttpEntity<?> entity = new HttpEntity<>(headers);
        ResponseEntity<byte[]> response = rundeckService.send(apiPath, HttpMethod.GET, entity, byte[].class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            String filename = String.format("job_export_%s_%s.%s", project, uuid, fileExtension);
            Path outputPath = Path.of("exports", filename);
            Files.createDirectories(outputPath.getParent());
            Files.write(outputPath, response.getBody(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            return outputPath;
        }

        throw new IOException("Failed to export job. Status: " + response.getStatusCode());
    }

    @Override
    public List<JobDTO> getPriorityJobs() {
        List<Job> priorityJobs = jobRepository.findPriorityJobs();
        return priorityJobs.stream()
                .map(this::getJobDetails)
                .collect(Collectors.toList());
    }

    @Override
    public String getJobStatus(Job job) {
        Long jobId = job.getId();
        List<ExecutionMy> lastExecutions = executionMyRepository
                .findTop2ByJobIdOrderByDateStartedDesc(jobId);

        if (lastExecutions.isEmpty()) {
            return "UNKNOWN";
        }

        String currentStatus = lastExecutions.get(0).getStatus();

        if ("SUCCEEDED".equalsIgnoreCase(currentStatus)) {
            if (lastExecutions.size() >= 2) {
                String previousStatus = lastExecutions.get(1).getStatus();
                if ("FAILED".equalsIgnoreCase(previousStatus)) {
                    return "recovery";
                }
            }
            return "onsuccess";
        } else if ("FAILED".equalsIgnoreCase(currentStatus)) {
            return "onfailure";
        } else if ("ABORTED".equalsIgnoreCase(currentStatus) ||
                "TIMEDOUT".equalsIgnoreCase(currentStatus)) {
            return "onfailure";
        }

        return "UNKNOWN";
    }

    @Override
    public List<JobNameDTO> getJobsByProjectAndService(Long projectId) {
        String sql = """
        SELECT DISTINCT
            j.id_job,
            j.job_name,
            j.job_uuid,
            j.project_name,
            j.service_name
        FROM job_last_execution_view j
        WHERE j.is_deleted = false
        AND j.project_id = :projectId
        ORDER BY j.job_name
    """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("projectId", projectId); // correspond à :projectId dans le SQL

        List<Object[]> results = query.getResultList();
        List<JobNameDTO> jobNames = new ArrayList<>();

        for (Object[] row : results) {
            Long idJob = ((Number) row[0]).longValue();
            String jobName = (String) row[1];
            String uuid = (String) row[2];
            String projectNameResult = (String) row[3];
            String serviceName = (String) row[4];

            JobNameDTO jobNameDTO = new JobNameDTO();
            jobNameDTO.setJobId(idJob);
            jobNameDTO.setJobName(jobName);
            jobNameDTO.setUuid(uuid);
            jobNameDTO.setProjectName(projectNameResult);
            jobNameDTO.setServiceName(serviceName);

            jobNames.add(jobNameDTO);
        }

        return jobNames;
    }


}