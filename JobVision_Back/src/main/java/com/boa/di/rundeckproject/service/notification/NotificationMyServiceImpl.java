package com.boa.di.rundeckproject.service.notification;


import com.boa.di.rundeckproject.dto.NotificationMyDTO;
import com.boa.di.rundeckproject.model.ContactNotificationPreference;
import com.boa.di.rundeckproject.model.Job;
import com.boa.di.rundeckproject.model.NotificationMy;
import com.boa.di.rundeckproject.repository.ContactNotificationPreferenceRepository;
import com.boa.di.rundeckproject.repository.JobRepository;
import com.boa.di.rundeckproject.repository.NotificationMyRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationMyServiceImpl implements NotificationMyService {
    @Autowired
    private NotificationMyRepository notificationMyRepository;
    @Autowired
    private ContactNotificationPreferenceRepository contactNotificationPreferenceRepository;

    @Autowired
    private JobRepository jobRepository;

    private NotificationMyDTO toDTO(NotificationMy entity) {
        NotificationMyDTO dto = new NotificationMyDTO();
        dto.setId(entity.getId());
        dto.setIsEnabled(entity.getIsEnabled());
        dto.setAttachLog(entity.getAttachLog());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setContactNotificationPreferenceId(entity.getContactNotificationPreference().getId());
        dto.setJobId(entity.getJob() != null ? entity.getJob().getId() : null);
        return dto;
    }

    @Override
    public List<NotificationMyDTO> findAll() {
        return notificationMyRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationMyDTO findById(Long id) {
        NotificationMy entity = notificationMyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("NotificationMy not found with id " + id));
        return toDTO(entity);
    }

    @Override
    public NotificationMy save(NotificationMy dto) {
        NotificationMy saved = notificationMyRepository.save(dto);
        return saved;
    }

    @Override
    public void deleteById(Long id) {
        notificationMyRepository.deleteById(id);
    }

    private NotificationMy toEntity(NotificationMyDTO dto) {
        NotificationMy entity = new NotificationMy();

        if (dto.getId() != null) {
            entity = notificationMyRepository.findById(dto.getId()).orElse(new NotificationMy());
        }

        entity.setIsEnabled(dto.getIsEnabled());
        entity.setAttachLog(dto.getAttachLog());

        if (dto.getContactNotificationPreferenceId() != null) {
            ContactNotificationPreference cnp = contactNotificationPreferenceRepository
                    .findById(dto.getContactNotificationPreferenceId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "ContactNotificationPreference not found with id " + dto.getContactNotificationPreferenceId()));
            entity.setContactNotificationPreference(cnp);
        } else {
            entity.setContactNotificationPreference(null);
        }

        if (dto.getJobId() != null) {
            Job job = jobRepository.getById(dto.getJobId());
            entity.setJob(job);
        }
        else {
            entity.setJob(null);
        }

        return entity;
    }

    @Transactional
    @Override
    public List<NotificationMyDTO> save(List<NotificationMyDTO> dtos) {
        List<NotificationMy> entities = dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());

        List<NotificationMy> savedEntities = notificationMyRepository.saveAll(entities);

        return savedEntities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationMyDTO> getListNotificationMyDTO(Long idJob) {
        List<NotificationMy> notifications = notificationMyRepository.findByJob_Id(idJob);

        return notifications.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public NotificationMyDTO update(Long id, NotificationMyDTO dto) {
        NotificationMy existing = notificationMyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("NotificationMy not found with id " + id));

        existing.setIsEnabled(dto.getIsEnabled());
        existing.setAttachLog(dto.getAttachLog());
        existing.setUpdatedAt(LocalDateTime.now());

        NotificationMy saved = notificationMyRepository.save(existing);
        return toDTO(saved);
    }


}
