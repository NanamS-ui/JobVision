package com.boa.di.rundeckproject.service.notification;

import com.boa.di.rundeckproject.dto.NotificationMyDTO;
import com.boa.di.rundeckproject.model.NotificationMy;
import jakarta.transaction.Transactional;

import java.util.List;

public interface NotificationMyService {

    List<NotificationMyDTO> findAll();

    NotificationMyDTO findById(Long id);

    NotificationMy save(NotificationMy dto);

    void deleteById(Long id);

    @Transactional
    List<NotificationMyDTO> save(List<NotificationMyDTO> dtos);

    List<NotificationMyDTO> getListNotificationMyDTO(Long idJob);

    @Transactional
    NotificationMyDTO update(Long id, NotificationMyDTO dto);
}
