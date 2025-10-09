package com.boa.di.rundeckproject.controller.contact;

import com.boa.di.rundeckproject.model.ContactGroupe;
import com.boa.di.rundeckproject.service.contact.ContactGroupeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact-groupes")
public class ContactGroupeController {

    private final ContactGroupeService service;

    public ContactGroupeController(ContactGroupeService service) {
        this.service = service;
    }

    @GetMapping
    public List<ContactGroupe> getAll() {
        return service.findAll();
    }

    @PostMapping
    public ResponseEntity<ContactGroupe> create(@RequestBody ContactGroupe contactGroupe) {
        return ResponseEntity.ok(service.save(contactGroupe));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
