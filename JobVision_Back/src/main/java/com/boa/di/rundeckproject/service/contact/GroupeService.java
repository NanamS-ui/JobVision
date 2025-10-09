package com.boa.di.rundeckproject.service.contact;

import com.boa.di.rundeckproject.dto.GroupeDTO;
import com.boa.di.rundeckproject.model.ContactNotificationPreference;
import com.boa.di.rundeckproject.model.Groupe;
import com.boa.di.rundeckproject.repository.GroupeRepository;
import com.boa.di.rundeckproject.util.MapperUtil;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GroupeService {
    private final GroupeRepository repository;
    public GroupeService(GroupeRepository repository) {
        this.repository = repository;
    }
    public List<Groupe> findAll() { return repository.findAll(); }
    public Optional<Groupe> findById(Long id) { return repository.findById(id); }
    public Groupe save(Groupe groupe) { return repository.save(groupe); }
    public void deleteById(Long id) { repository.deleteById(id); }

}
