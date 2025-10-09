package com.boa.di.rundeckproject.service.sshPath;

import com.boa.di.rundeckproject.dto.SshPathStatsDTO;
import com.boa.di.rundeckproject.model.SshPath;
import java.io.IOException;

public interface SshPathService {
    void deleteKeyFromRundeck(String storagePath);
    SshPath saveCredentialAndRegister(SshPath sshPath) throws IOException;
    String downloadKey(String keyStoragePath);
    SshPathStatsDTO getStats();
}
