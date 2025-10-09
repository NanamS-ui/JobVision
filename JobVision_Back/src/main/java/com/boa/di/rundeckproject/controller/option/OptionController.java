package com.boa.di.rundeckproject.controller.option;

import com.boa.di.rundeckproject.dto.OptionDTO;
import com.boa.di.rundeckproject.service.option.OptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/options")
public class OptionController {
    private final OptionService optionService;

    public OptionController(OptionService optionService) {
        this.optionService = optionService;
    }

    @GetMapping("/job/{id}")
    public ResponseEntity<List<OptionDTO>> getOptionDTOsForJob(@PathVariable("id") Long jobId) {
        List<OptionDTO> dtos = optionService.getOptionDTOsByJobId(jobId);
        return ResponseEntity.ok(dtos);
    }
}
