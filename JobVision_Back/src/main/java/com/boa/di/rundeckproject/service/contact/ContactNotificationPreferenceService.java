package com.boa.di.rundeckproject.service.contact;

import com.boa.di.rundeckproject.dto.ContactDTO;
import com.boa.di.rundeckproject.dto.ContactNotificationPreferenceDTO;
import com.boa.di.rundeckproject.dto.GroupeDTO;
import com.boa.di.rundeckproject.model.ContactNotificationPreference;
import com.boa.di.rundeckproject.model.NotificationMy;
import com.boa.di.rundeckproject.repository.ContactNotificationPreferenceRepository;
import com.boa.di.rundeckproject.repository.NotificationMyRepository;
import com.boa.di.rundeckproject.util.MapperUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ContactNotificationPreferenceService {

    private final ContactNotificationPreferenceRepository repository;
    private final NotificationMyRepository notificationMyRepository;

    @Autowired
    public ContactNotificationPreferenceService(ContactNotificationPreferenceRepository repository, NotificationMyRepository notificationMyRepository) {
        this.repository = repository;
        this.notificationMyRepository = notificationMyRepository;
    }

    public List<ContactNotificationPreference> findAll() {
        return repository.findAll();
    }

    public Optional<ContactNotificationPreference> findById(Long id) {
        return repository.findById(id);
    }

    public ContactNotificationPreference save(ContactNotificationPreference pref) {
        return repository.save(pref);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    public List<ContactNotificationPreference> getContactsByJobId(Long jobId) {
        List<NotificationMy> notifications = notificationMyRepository.findByJob_IdAndIsEnabledTrue(jobId);

        List<ContactNotificationPreference> contacts = new ArrayList<>();
        for (NotificationMy notification : notifications) {
            ContactNotificationPreference cnp = notification.getContactNotificationPreference();
            if (cnp != null && !contacts.contains(cnp)) {
                contacts.add(cnp);
            }
        }
        return contacts;
    }

    public ContactNotificationPreferenceDTO getNotificationPreferences(Long idGroupe, Long idContact) {
        if ((idGroupe == null && idContact == null) || (idGroupe != null && idContact != null)) {
            throw new IllegalArgumentException("You must provide either idGroupe or idContact, but not both.");
        }

        ContactNotificationPreference preference;

        if (idGroupe != null) {
            preference = repository.findByGroupeContact_Id(idGroupe);
        } else {
            preference = repository.findByContact_Id(idContact);
        }

        if (preference == null) {
            return null; // ou lever une exception, ou retourner un DTO vide selon le besoin
        }

        return MapperUtil.mapEntityToDto(preference);
    }


    public List<GroupeDTO> getGroupesWithNotificationPreferences() {
        return repository.findAll().stream()
                .map(ContactNotificationPreference::getGroupeContact)
                .filter(Objects::nonNull)
                .distinct()
                .map(MapperUtil::toDTO)
                .collect(Collectors.toList());
    }

    public List<ContactDTO> getContactsWithNotificationPreferences() {
        return repository.findAll().stream()
                .map(ContactNotificationPreference::getContact)          // ici tu obtiens Contact
                .filter(Objects::nonNull)
                .distinct()
                .map(MapperUtil::toDTO)
                .collect(Collectors.toList());
    }

    public List<GroupeDTO> getAvailableGroupesForJob(Long jobId) {
        return repository.findAvailableGroupesForJob(jobId).stream()
                .map(MapperUtil::toDTO)
                .collect(Collectors.toList());
    }

    public List<ContactDTO> getAvailableContactsForJob(Long jobId) {
        return repository.findAvailableContactsForJob(jobId).stream()
                .map(MapperUtil::toDTO)
                .collect(Collectors.toList());
    }

}
