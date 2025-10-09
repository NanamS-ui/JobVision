package com.boa.di.rundeckproject.service.notification;

import com.boa.di.rundeckproject.dto.NotificationDetailDTO;
import com.boa.di.rundeckproject.repository.NotificationDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationDetailServiceImpl implements NotificationDetailService {
    private final NotificationDetailRepository repo;

    @Autowired
    public NotificationDetailServiceImpl(NotificationDetailRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<NotificationDetailDTO> getAll() {
        return repo.findAll();
    }

    @Override
    public List<NotificationDetailDTO> getByContactId(Long contactId) {
        return repo.findByIdContact(contactId);
    }

    @Override
    public List<NotificationDetailDTO> getByGroupeId(Long groupeId) {
        return repo.findByIdGroupe(groupeId);
    }
}
