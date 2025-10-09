package com.boa.di.rundeckproject.controller.service;

import com.boa.di.rundeckproject.dto.ServiceDTO;
import com.boa.di.rundeckproject.dto.ServiceDailySummaryDTO;
import com.boa.di.rundeckproject.dto.ServiceDetailsDTO;
import com.boa.di.rundeckproject.dto.ServiceFlatViewDTO;
import com.boa.di.rundeckproject.error.ErrorDetail;
import com.boa.di.rundeckproject.model.Service;
import com.boa.di.rundeckproject.repository.ServiceRepository;
import com.boa.di.rundeckproject.service.service.ServiceService;
import com.boa.di.rundeckproject.success.SuccessDetail;
import com.boa.di.rundeckproject.util.MapperUtil;
import com.boa.di.rundeckproject.util.TimeRangeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceService serviceService;
    private final ServiceRepository serviceRepository;

    @Autowired
    public ServiceController(ServiceService serviceService, ServiceRepository serviceRepository) {
        this.serviceService = serviceService;
        this.serviceRepository = serviceRepository;
    }

    @PostMapping
    public ResponseEntity<?> createService(@RequestBody Service service) {
        try {
            Service created = serviceService.createService(service);
            ServiceDTO createdDTO = MapperUtil.toServiceDTO(created);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new SuccessDetail(
                            HttpStatus.CREATED.value(),
                            "Service créé avec succès",
                            Instant.now().toEpochMilli(),
                            "/api/services",
                            createdDTO
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorDetail(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Erreur lors de la création du service",
                            Instant.now().toEpochMilli(),
                            "/api/services",
                            e.getMessage()
                    )
            );
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getServiceById(@PathVariable Integer id) {
        try {
            Optional<Service> serviceOpt = serviceService.getServiceById(id);
            if (serviceOpt.isPresent()) {
                ServiceDTO dto = MapperUtil.toServiceDTO(serviceOpt.get());
                return ResponseEntity.ok(
                        new SuccessDetail(
                                HttpStatus.OK.value(),
                                "Service trouvé",
                                Instant.now().toEpochMilli(),
                                "/api/services/" + id,
                                dto
                        )
                );
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new ErrorDetail(
                                HttpStatus.NOT_FOUND.value(),
                                "Service non trouvé avec ID : " + id,
                                Instant.now().toEpochMilli(),
                                "/api/services/" + id,
                                "Aucun service avec cet ID"
                        )
                );
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorDetail(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Erreur lors de la récupération du service",
                            Instant.now().toEpochMilli(),
                            "/api/services/" + id,
                            e.getMessage()
                    )
            );
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllServices() {
        try {
            List<Service> services = serviceService.getAllServices();
            List<ServiceDTO> serviceDTOs = services.stream()
                    .map(MapperUtil::toServiceDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new SuccessDetail(
                            HttpStatus.OK.value(),
                            "Liste des services récupérée",
                            Instant.now().toEpochMilli(),
                            "/api/services",
                            serviceDTOs
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorDetail(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Erreur lors de la récupération des services",
                            Instant.now().toEpochMilli(),
                            "/api/services",
                            e.getMessage()
                    )
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Integer id, @RequestBody Service updatedService) {
        try {
            Service updated = serviceService.updateService(id, updatedService);
            ServiceDTO dto = MapperUtil.toServiceDTO(updated);
            return ResponseEntity.ok(
                    new SuccessDetail(
                            HttpStatus.OK.value(),
                            "Service mis à jour avec succès",
                            Instant.now().toEpochMilli(),
                            "/api/services/" + id,
                            dto
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorDetail(
                            HttpStatus.NOT_FOUND.value(),
                            e.getMessage(),
                            Instant.now().toEpochMilli(),
                            "/api/services/" + id,
                            "Impossible de mettre à jour un service inexistant"
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorDetail(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Erreur lors de la mise à jour du service",
                            Instant.now().toEpochMilli(),
                            "/api/services/" + id,
                            e.getMessage()
                    )
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Integer id) {
        try {
            serviceService.deleteService(id);
            return ResponseEntity.ok(
                    new SuccessDetail(
                            HttpStatus.OK.value(),
                            "Service supprimé avec succès",
                            Instant.now().toEpochMilli(),
                            "/api/services/" + id,
                            null
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorDetail(
                            HttpStatus.NOT_FOUND.value(),
                            e.getMessage(),
                            Instant.now().toEpochMilli(),
                            "/api/services/" + id,
                            "Impossible de supprimer un service inexistant"
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorDetail(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Erreur lors de la suppression du service",
                            Instant.now().toEpochMilli(),
                            "/api/services/" + id,
                            e.getMessage()
                    )
            );
        }
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<?> autocomplete(@RequestParam String query) {
        try {
            List<Service> results = serviceService.autocompleteByName(query);
            List<ServiceDTO> resultDTOs = results.stream()
                    .map(MapperUtil::toServiceDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new SuccessDetail(
                            HttpStatus.OK.value(),
                            "Suggestions récupérées avec succès",
                            Instant.now().toEpochMilli(),
                            "/api/services/autocomplete",
                            resultDTOs
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorDetail(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Erreur lors de la récupération des suggestions",
                            Instant.now().toEpochMilli(),
                            "/api/services/autocomplete",
                            e.getMessage()
                    )
            );
        }
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ServiceDetailsDTO> getServiceDetails(@PathVariable("id") Integer serviceId) {
        List<ServiceFlatViewDTO> flatList = serviceRepository.findByServiceId(serviceId);

        if (flatList == null || flatList.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ServiceDetailsDTO detailsDTO = serviceService.buildFromFlatView(flatList);
        return ResponseEntity.ok(detailsDTO);
    }

//    @GetMapping
//    public List<ServiceDailySummaryDTO> getSummaries(@RequestParam(defaultValue = "all") String serviceName) {
//        return serviceService.getSummaries(serviceName);
//    }
}
