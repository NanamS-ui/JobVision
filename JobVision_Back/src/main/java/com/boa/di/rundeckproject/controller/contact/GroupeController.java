package com.boa.di.rundeckproject.controller.contact;

import com.boa.di.rundeckproject.dto.GroupeDTO;
import com.boa.di.rundeckproject.model.Groupe;
import com.boa.di.rundeckproject.repository.GroupeRepository;
import com.boa.di.rundeckproject.service.contact.GroupeService;
import com.boa.di.rundeckproject.util.MapperUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groupe-contacts")
public class GroupeController {

    private final GroupeService service;
    private final GroupeRepository repository;

    @Autowired
    public GroupeController(GroupeService service, GroupeRepository repository) {
        this.service = service;
        this.repository = repository;
    }

    @GetMapping
    public List<Groupe> getAll() {
        return service.findAll();
    }

    @GetMapping("/no-preference")
    public List<GroupeDTO> getAllNoPreference() {
        return repository.findGroupesWithoutNotificationPreference().stream().map(MapperUtil::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Groupe> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Groupe> create(@RequestBody Groupe groupe) {
        return ResponseEntity.ok(service.save(groupe));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Groupe> update(@PathVariable Long id, @RequestBody Groupe groupe) {
        return service.findById(id)
                .map(existing -> {
                    groupe.setId(existing.getId());
                    return ResponseEntity.ok(service.save(groupe));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.findById(id).isPresent()) {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
