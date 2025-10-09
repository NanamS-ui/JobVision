package com.boa.di.rundeckproject.service.notification;

import com.boa.di.rundeckproject.dto.NotificationDetailDTO;

import java.util.List;

public interface NotificationDetailService {
    List<NotificationDetailDTO> getAll();

    List<NotificationDetailDTO> getByContactId(Long contactId);

    List<NotificationDetailDTO> getByGroupeId(Long groupeId);
}
