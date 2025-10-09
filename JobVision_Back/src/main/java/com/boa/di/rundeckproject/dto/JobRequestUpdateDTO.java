package com.boa.di.rundeckproject.dto;

import java.util.List;

public class JobRequestUpdateDTO {
    JobDTO jobDTO;
    List<NodeDTO> nodeDTOList;

    public JobDTO getJobDTO() {
        return jobDTO;
    }

    public void setJobDTO(JobDTO jobDTO) {
        this.jobDTO = jobDTO;
    }

    public List<NodeDTO> getNodeDTOList() {
        return nodeDTOList;
    }

    public void setNodeDTOList(List<NodeDTO> nodeDTOList) {
        this.nodeDTOList = nodeDTOList;
    }
}
