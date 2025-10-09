package com.boa.di.rundeckproject.service.job;

import com.boa.di.rundeckproject.dto.*;
import com.boa.di.rundeckproject.model.Job;
import com.boa.di.rundeckproject.model.Node;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

public interface JobService {
    ResponseEntity<String> createJob(Job job, List<Node> listNode);

//    ResponseEntity<JobRequestUpdateDTO> getJobById(Long jobId);

    @Transactional
    ResponseEntity<String> updateJob(Long id, Job updatedJob, List<Node> listNode);

    ResponseEntity<JobRequestUpdateDTO> getJobById(Long jobId);

    JobDTO getJobDetails(Job job);
    JobDTO getJobDetailsById(Long id);
    ResponseEntity<String> runJob(Long id, Map<String, Object> options);
    ResponseEntity<String> stopJob(Long executionId);
    ResponseEntity<String> deleteJob(Long id);
    JobDTO getJobByUuid(String uuid);
    List<JobDTO> autocomplete(String query);
    JobStateDTO getJobCounts();
    List<JobStatsListDTO> getAllJobStats();
    List<JobStatsListDTO> autocompleteJobs(String queryStr);
    JobDetailDTO getJobDetailsResponse(Job job);
    Path generateExportJobAndReturnPath(Job job, String format) throws IOException;
    List<JobDTO> getPriorityJobs();
    String getJobStatus(Job job);
    List<JobNameDTO> getJobsByProjectAndService(Long projectId);
}
