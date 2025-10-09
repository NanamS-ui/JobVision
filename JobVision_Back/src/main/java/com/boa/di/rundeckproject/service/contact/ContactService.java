// --- ContactService.java ---
package com.boa.di.rundeckproject.service.contact;

import com.boa.di.rundeckproject.dto.NotificationDetailDTO;
import com.boa.di.rundeckproject.model.Contact;
import com.boa.di.rundeckproject.repository.ContactRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ContactService {
    private final ContactRepository repository;

    public ContactService(ContactRepository repository) {
        this.repository = repository;
    }

    public List<Contact> findAll() {
        return repository.findAll();
    }

    public Optional<Contact> findById(Long id) {
        return repository.findById(id);
    }

    public Contact save(Contact contact) {
        return repository.save(contact);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }

}