package com.boa.di.rundeckproject.controller.contact;

import com.boa.di.rundeckproject.dto.ContactDTO;
import com.boa.di.rundeckproject.dto.ContactPayload;
import com.boa.di.rundeckproject.model.Contact;
import com.boa.di.rundeckproject.model.ContactGroupe;
import com.boa.di.rundeckproject.repository.ContactRepository;
import com.boa.di.rundeckproject.service.contact.ContactGroupeService;
import com.boa.di.rundeckproject.service.contact.ContactService;
import com.boa.di.rundeckproject.service.contact.GroupeService;
import com.boa.di.rundeckproject.util.MapperUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;
    private final GroupeService groupeService;
    private final ContactGroupeService contactGroupeService;
    private final ContactRepository contactRepository;

    @Autowired
    public ContactController(ContactService contactService, GroupeService groupeService, ContactGroupeService contactGroupeService, ContactRepository contactRepository) {
        this.contactService = contactService;
        this.groupeService = groupeService;
        this.contactGroupeService = contactGroupeService;
        this.contactRepository = contactRepository;
    }

    @GetMapping
    public List<ContactPayload> getAll() {
        List<ContactPayload> contacts = contactGroupeService.getAllContactPayloads();
        return contacts;
    }

    @GetMapping("/no-preference")
    public List<ContactDTO> getAllNoNotificationPreference() {
        List<Contact> contacts = contactRepository.findContactsWithoutNotificationPreference();

        return contacts.stream()
                .map(MapperUtil::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contact> getById(@PathVariable Long id) {
        return contactService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Contact> create(@RequestBody ContactPayload payload) {
        Contact contact = new Contact();
        contact.setNom(payload.nom);
        contact.setPrenom(payload.prenom);
        contact.setEmail(payload.email);
        contact.setTelephone(payload.telephone);

        Contact savedContact = contactService.save(contact);

        if (payload.groupes != null) {
            for (Long groupId : payload.groupes) {
                groupeService.findById(groupId).ifPresent(groupe -> {
                    ContactGroupe assoc = new ContactGroupe();
                    assoc.setContact(savedContact);
                    assoc.setGroupe(groupe);
                    contactGroupeService.save(assoc);
                });
            }
        }

        return ResponseEntity.ok(savedContact);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (contactService.findById(id).isPresent()) {
            contactService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contact> update(@PathVariable Long id, @RequestBody ContactPayload payload) {
        return contactService.findById(id).map(existing -> {
            existing.setNom(payload.nom);
            existing.setPrenom(payload.prenom);
            existing.setEmail(payload.email);
            existing.setTelephone(payload.telephone);

            Contact updated = contactService.save(existing);

            contactGroupeService.deleteByIdContact(updated.getId());

            if (payload.groupes != null) {
                for (Long groupId : payload.groupes) {
                    groupeService.findById(groupId).ifPresent(groupe -> {
                        ContactGroupe assoc = new ContactGroupe();
                        assoc.setContact(updated);
                        assoc.setGroupe(groupe);
                        contactGroupeService.save(assoc);
                    });
                }
            }

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

}
