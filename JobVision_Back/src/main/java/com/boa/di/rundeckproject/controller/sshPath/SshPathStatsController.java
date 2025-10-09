package com.boa.di.rundeckproject.controller.sshPath;

import com.boa.di.rundeckproject.dto.SshPathStatsDTO;
import com.boa.di.rundeckproject.service.sshPath.SshPathService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sshpath/stats")
public class SshPathStatsController {

    private final SshPathService sshPathService;

    @Autowired
    public SshPathStatsController(SshPathService sshPathService) {
        this.sshPathService = sshPathService;
    }

    @GetMapping
    public SshPathStatsDTO getSshPathStats() {
        return sshPathService.getStats();
    }

}
