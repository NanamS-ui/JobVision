package com.boa.di.rundeckproject.service.option;

import com.boa.di.rundeckproject.dto.OptionDTO;
import com.boa.di.rundeckproject.model.Option;
import jakarta.transaction.Transactional;

import java.util.List;

public interface OptionService {
    List<OptionDTO> getOptionDTOsByJobId(Long jobId);

    @Transactional
    void deleteAllOptions(List<Option> options);
}
