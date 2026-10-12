package com.autopulse.vsm.service;

import com.autopulse.vsm.dto.ServiceRequest;
import com.autopulse.vsm.dto.ServiceResponse;
import com.autopulse.vsm.model.Customer;
import com.autopulse.vsm.model.ServiceRecord;
import com.autopulse.vsm.model.ServiceStatus;
import com.autopulse.vsm.model.Vehicle;
import com.autopulse.vsm.repository.CustomerRepository;
import com.autopulse.vsm.repository.ServiceRecordRepository;
import com.autopulse.vsm.repository.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ServiceRecordService {

    private final ServiceRecordRepository serviceRecordRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    public ServiceRecordService(ServiceRecordRepository serviceRecordRepository,
                                VehicleRepository vehicleRepository,
                                CustomerRepository customerRepository) {
        this.serviceRecordRepository = serviceRecordRepository;
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
    }

    public List<ServiceResponse> getAllServices() {
        return serviceRecordRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public ServiceRecord getServiceEntity(String id) {
        return serviceRecordRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service record not found"));
    }

    public ServiceResponse getService(String id) {
        return toResponse(getServiceEntity(id));
    }

    @Transactional
    public ServiceResponse createService(ServiceRequest req) {
        vehicleRepository.findById(req.vehicleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid vehicle ID"));

        String id = UUID.randomUUID().toString();
        String createdAt = Instant.now().toString();

        ServiceRecord record = new ServiceRecord(
                id,
                req.vehicleId(),
                req.serviceType(),
                req.description() != null ? req.description() : "",
                req.technician() != null ? req.technician() : "",
                req.cost() != null ? req.cost() : 0.0,
                ServiceStatus.fromString(req.status()),
                req.serviceDate(),
                createdAt
        );

        serviceRecordRepository.save(record);
        return toResponse(record);
    }

    @Transactional
    public ServiceResponse updateService(String id, ServiceRequest req) {
        ServiceRecord record = getServiceEntity(id);

        if (req.vehicleId() != null && !req.vehicleId().isBlank()) {
            vehicleRepository.findById(req.vehicleId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid vehicle ID"));
            record.setVehicleId(req.vehicleId());
        }
        if (req.serviceType() != null && !req.serviceType().isBlank()) {
            record.setServiceType(req.serviceType());
        }
        if (req.description() != null) {
            record.setDescription(req.description());
        }
        if (req.technician() != null) {
            record.setTechnician(req.technician());
        }
        if (req.cost() != null) {
            record.setCost(req.cost());
        }
        if (req.status() != null && !req.status().isBlank()) {
            record.setStatus(ServiceStatus.fromString(req.status()));
        }
        if (req.serviceDate() != null && !req.serviceDate().isBlank()) {
            record.setServiceDate(req.serviceDate());
        }

        serviceRecordRepository.save(record);
        return toResponse(record);
    }

    @Transactional
    public void deleteService(String id) {
        ServiceRecord record = getServiceEntity(id);
        serviceRecordRepository.delete(record);
    }

    public ServiceResponse toResponse(ServiceRecord r) {
        Optional<Vehicle> vOpt = vehicleRepository.findById(r.getVehicleId());
        String vehicleLabel = vOpt.map(Vehicle::getVehicleLabel).orElse("Unknown Vehicle");
        String ownerName = vOpt.flatMap(v -> customerRepository.findById(v.getCustomerId()))
                .map(Customer::getName)
                .orElse("Unknown Owner");

        return new ServiceResponse(
                r.getId(),
                r.getVehicleId(),
                r.getServiceType(),
                r.getDescription() != null ? r.getDescription() : "",
                r.getTechnician() != null ? r.getTechnician() : "",
                r.getCost(),
                r.getStatus().getValue(),
                r.getServiceDate(),
                r.getCreatedAt(),
                vehicleLabel,
                ownerName
        );
    }
}
