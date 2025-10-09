package com.boa.di.rundeckproject.controller.contact;

import com.boa.di.rundeckproject.dto.ContactDTO;
import com.boa.di.rundeckproject.dto.ContactNotificationPreferenceDTO;
import com.boa.di.rundeckproject.dto.GroupeDTO;
import com.boa.di.rundeckproject.model.Contact;
import com.boa.di.rundeckproject.model.ContactNotificationPreference;
import com.boa.di.rundeckproject.model.Groupe;
import com.boa.di.rundeckproject.repository.ContactRepository;
import com.boa.di.rundeckproject.repository.GroupeRepository;
import com.boa.di.rundeckproject.service.contact.ContactNotificationPreferenceService;
import com.boa.di.rundeckproject.util.MapperUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notification-preferences")
public class ContactNotificationPreferenceController {

    private final ContactNotificationPreferenceService service;
    private final ContactRepository contactRepository;
    private final GroupeRepository groupeRepository;

    @Autowired
    public ContactNotificationPreferenceController(ContactNotificationPreferenceService service, ContactRepository contactRepository, GroupeRepository groupeRepository) {
        this.service = service;
        this.contactRepository = contactRepository;
        this.groupeRepository = groupeRepository;
    }

    @GetMapping
    public List<ContactNotificationPreferenceDTO> getAll() {
        return service.findAll().stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactNotificationPreferenceDTO> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(this::mapEntityToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping
    public ResponseEntity<ContactNotificationPreference> create(@RequestBody ContactNotificationPreferenceDTO dto) {
        ContactNotificationPreference entity = mapDtoToEntity(dto, new ContactNotificationPreference());
        ContactNotificationPreference saved = service.save(entity);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactNotificationPreferenceDTO> update(
            @PathVariable Long id,
            @RequestBody ContactNotificationPreferenceDTO dto) {

        return service.findById(id).map(existing -> {
            ContactNotificationPreference updated = mapDtoToEntity(dto, existing);
            ContactNotificationPreference saved = service.save(updated);
            return ResponseEntity.ok(mapEntityToDto(saved)); // <-- retourne DTO ici
        }).orElse(ResponseEntity.notFound().build());
    }


    private ContactNotificationPreference mapDtoToEntity(ContactNotificationPreferenceDTO dto,
                                                         ContactNotificationPreference entity) {
        entity.setNotifyOnFailed(dto.getNotifyOnFailed());
        entity.setNotifyOnRecovery(dto.getNotifyOnRecovery());
        entity.setNotifyOnSuccess(dto.getNotifyOnSuccess());
        entity.setNotifyOnStart(dto.getNotifyOnStart());
        entity.setChannelEmail(dto.getChannelEmail());
        entity.setChannelSms(dto.getChannelSms());

        // Gestion du groupe contact
        if (dto.getId_group_contact() != null) {
            groupeRepository.findById(dto.getId_group_contact())
                    .ifPresent(entity::setGroupeContact);
        } else {
            entity.setGroupeContact(null);
        }

        // Gestion du contact
        if (dto.getId_contact() != null) {
            contactRepository.findById(dto.getId_contact())
                    .ifPresent(entity::setContact);
        } else {
            entity.setContact(null);
        }

        return entity;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.findById(id).isPresent()) {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/contacts/{jobId}")
    public List<ContactNotificationPreferenceDTO> getContactsByJob(@PathVariable("jobId") Long jobId) {
        return service.getContactsByJobId(jobId)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    private ContactNotificationPreferenceDTO mapEntityToDto(ContactNotificationPreference entity) {
        ContactNotificationPreferenceDTO dto = new ContactNotificationPreferenceDTO();
        dto.setId(entity.getId());
        dto.setNotifyOnFailed(entity.getNotifyOnFailed());
        dto.setNotifyOnRecovery(entity.getNotifyOnRecovery());
        dto.setNotifyOnSuccess(entity.getNotifyOnSuccess());
        dto.setNotifyOnStart(entity.getNotifyOnStart());
        dto.setChannelEmail(entity.getChannelEmail());
        dto.setChannelSms(entity.getChannelSms());

        if (entity.getGroupeContact() != null) {
            dto.setId_group_contact(entity.getGroupeContact().getId());
            GroupeDTO groupeDTO = MapperUtil.toDTO(entity.getGroupeContact());
            dto.setGroupe(groupeDTO);
        } else {
            dto.setId_group_contact(null);
        }

        if (entity.getContact() != null) {
            dto.setId_contact(entity.getContact().getId());

            ContactDTO contactDTO = MapperUtil.toDTO(entity.getContact());
            dto.setContact(contactDTO);
        } else {
            dto.setId_contact(null);
        }

        return dto;
    }


    @GetMapping("/groupes")
    public List<GroupeDTO> getGroupesWithNotificationPreferences() {
        return service.getGroupesWithNotificationPreferences();
    }

    @GetMapping("/contacts")
    public List<ContactDTO> getContactsWithNotificationPreferences() {
        return service.getContactsWithNotificationPreferences();
    }

    @GetMapping("/preference")
    public ResponseEntity<ContactNotificationPreferenceDTO> getNotificationPreferences(
            @RequestParam(required = false) Long idGroupe,
            @RequestParam(required = false) Long idContact) {
        try {
            ContactNotificationPreferenceDTO dto = service.getNotificationPreferences(idGroupe, idContact);
            if (dto == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @GetMapping("/available-groups")
    public List<GroupeDTO> getAvailableGroupes(@RequestParam Long jobId) {
        return service.getAvailableGroupesForJob(jobId);
    }

    @GetMapping("/available-contacts")
    public List<ContactDTO> getAvailableContacts(@RequestParam Long jobId) {
        return service.getAvailableContactsForJob(jobId);
    }
}
