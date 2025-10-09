package com.boa.di.rundeckproject.service.contact;

import com.boa.di.rundeckproject.dto.ContactPayload;
import com.boa.di.rundeckproject.model.Contact;
import com.boa.di.rundeckproject.model.ContactGroupe;
import com.boa.di.rundeckproject.repository.ContactGroupeRepository;
import com.boa.di.rundeckproject.repository.ContactRepository;
import com.boa.di.rundeckproject.repository.GroupeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactGroupeService {
    private final ContactGroupeRepository repository;
    private final ContactRepository contactRepository;
    private final ContactGroupeRepository contactGroupeRepository;
    private final GroupeRepository groupeRepository;
    public ContactGroupeService(ContactGroupeRepository repository, ContactRepository contactRepository, ContactGroupeRepository contactGroupeRepository, GroupeRepository groupeRepository) {
        this.repository = repository;
        this.contactRepository = contactRepository;
        this.contactGroupeRepository = contactGroupeRepository;
        this.groupeRepository = groupeRepository;
    }
    public List<ContactGroupe> findAll() { return repository.findAll(); }
    public ContactGroupe save(ContactGroupe cg) { return repository.save(cg); }
    public void deleteById(Long id) { repository.deleteById(id); }

    public void deleteByIdContact(Long idContact) { repository.deleteByContactId(idContact); }

    public List<ContactPayload> getAllContactPayloads() {
        return contactRepository.findAll().stream().map(contact -> {
            List<ContactGroupe> associations = contactGroupeRepository.findByContact(contact);

            List<Long> groupesIds = associations.stream()
                    .map(assoc -> assoc.getGroupe().getId())
                    .collect(Collectors.toList());

            List<String> groupesNoms = associations.stream()
                    .map(assoc -> assoc.getGroupe().getNameGroupe())
                    .collect(Collectors.toList());

            return new ContactPayload(
                    contact.getId(),
                    contact.getNom(),
                    contact.getPrenom(),
                    contact.getEmail(),
                    contact.getTelephone(),
                    groupesIds,
                    groupesNoms,
                    contact.getCreatedAt(),
                    contact.getUpdatedAt()
            );
        }).collect(Collectors.toList());
    }

    public List<Contact> getContactsByGroupeId(Long idGroupe) {
        List<ContactGroupe> liens = contactGroupeRepository.findByGroupe_Id(idGroupe);
        return liens.stream()
                .map(ContactGroupe::getContact)
                .collect(Collectors.toList());
    }
}
