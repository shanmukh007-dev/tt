package com.autopulse.vsm.service;

import com.autopulse.vsm.dto.VehicleRequest;
import com.autopulse.vsm.dto.VehicleResponse;
import com.autopulse.vsm.model.Customer;
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
import java.util.UUID;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final ServiceRecordRepository serviceRecordRepository;

    public VehicleService(VehicleRepository vehicleRepository,
                          CustomerRepository customerRepository,
                          ServiceRecordRepository serviceRecordRepository) {
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
        this.serviceRecordRepository = serviceRecordRepository;
    }

    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public Vehicle getVehicleEntity(String id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
    }

    public VehicleResponse getVehicle(String id) {
        return toResponse(getVehicleEntity(id));
    }

    @Transactional
    public VehicleResponse createVehicle(VehicleRequest req) {
        Customer customer = customerRepository.findById(req.customerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customer ID"));

        String id = UUID.randomUUID().toString();
        String createdAt = Instant.now().toString();

        Vehicle vehicle = new Vehicle(
                id,
                req.customerId(),
                req.make(),
                req.model(),
                req.year(),
                req.plate(),
                req.vin(),
                req.mileage(),
                createdAt
        );

        vehicleRepository.save(vehicle);
        return toResponse(vehicle, customer.getName());
    }

    @Transactional
    public VehicleResponse updateVehicle(String id, VehicleRequest req) {
        Vehicle vehicle = getVehicleEntity(id);

        if (req.customerId() != null && !req.customerId().isBlank()) {
            customerRepository.findById(req.customerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customer ID"));
            vehicle.setCustomerId(req.customerId());
        }
        if (req.make() != null && !req.make().isBlank()) {
            vehicle.setMake(req.make());
        }
        if (req.model() != null && !req.model().isBlank()) {
            vehicle.setModel(req.model());
        }
        if (req.year() != null) {
            vehicle.setYear(req.year());
        }
        if (req.plate() != null && !req.plate().isBlank()) {
            vehicle.setPlate(req.plate());
        }
        if (req.vin() != null && !req.vin().isBlank()) {
            vehicle.setVin(req.vin());
        }
        if (req.mileage() != null) {
            vehicle.setMileage(req.mileage());
        }

        vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    @Transactional
    public void deleteVehicle(String id) {
        Vehicle vehicle = getVehicleEntity(id);
        serviceRecordRepository.deleteByVehicleId(id);
        vehicleRepository.delete(vehicle);
    }

    public VehicleResponse toResponse(Vehicle v) {
        String ownerName = customerRepository.findById(v.getCustomerId())
                .map(Customer::getName)
                .orElse("Unknown Owner");
        return toResponse(v, ownerName);
    }

    public VehicleResponse toResponse(Vehicle v, String ownerName) {
        return new VehicleResponse(
                v.getId(),
                v.getCustomerId(),
                v.getMake(),
                v.getModel(),
                v.getYear(),
                v.getPlate(),
                v.getVin(),
                v.getMileage(),
                v.getCreatedAt(),
                ownerName
        );
    }
}
