package com.boa.di.rundeckproject.service.option;

import com.boa.di.rundeckproject.dto.OptionDTO;
import com.boa.di.rundeckproject.model.Option;
import com.boa.di.rundeckproject.repository.OptionRepository;
import com.boa.di.rundeckproject.util.MapperUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OptionServiceImpl implements OptionService{
    private final OptionRepository optionRepository;

    @Autowired
    public OptionServiceImpl(OptionRepository optionRepository) {
        this.optionRepository = optionRepository;
    }

    @Override
    public List<OptionDTO> getOptionDTOsByJobId(Long jobId) {
        List<Option> options = optionRepository.findOptionsByJobId(jobId);
        return options.stream()
                .map(MapperUtil::toMapperOption)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void deleteAllOptions(List<Option> options) {
        for (Option option : options) {
            optionRepository.deleteById(option.getId());
        }
    }

}
