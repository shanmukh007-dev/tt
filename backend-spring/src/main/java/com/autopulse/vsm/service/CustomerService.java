package com.autopulse.vsm.service;

import com.autopulse.vsm.dto.CustomerRequest;
import com.autopulse.vsm.dto.CustomerResponse;
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
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceRecordRepository serviceRecordRepository;

    public CustomerService(CustomerRepository customerRepository,
                           VehicleRepository vehicleRepository,
                           ServiceRecordRepository serviceRecordRepository) {
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.serviceRecordRepository = serviceRecordRepository;
    }

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::toResponseWithCount)
                .toList();
    }

    public Customer getCustomerEntity(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    public CustomerResponse getCustomer(String id) {
        return toResponseWithCount(getCustomerEntity(id));
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest req) {
        String id = UUID.randomUUID().toString();
        String createdAt = Instant.now().toString();

        Customer customer = new Customer(
                id,
                req.name(),
                req.email(),
                req.phone() != null ? req.phone() : "",
                req.address() != null ? req.address() : "",
                createdAt,
                0
        );

        customerRepository.save(customer);
        return toResponse(customer, 0);
    }

    @Transactional
    public CustomerResponse updateCustomer(String id, CustomerRequest req) {
        Customer customer = getCustomerEntity(id);

        if (req.name() != null && !req.name().isBlank()) {
            customer.setName(req.name());
        }
        if (req.email() != null && !req.email().isBlank()) {
            customer.setEmail(req.email());
        }
        if (req.phone() != null) {
            customer.setPhone(req.phone());
        }
        if (req.address() != null) {
            customer.setAddress(req.address());
        }

        customerRepository.save(customer);
        return toResponseWithCount(customer);
    }

    @Transactional
    public void deleteCustomer(String id) {
        Customer customer = getCustomerEntity(id);
        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(id);
        List<String> vehicleIds = vehicles.stream().map(Vehicle::getId).toList();

        if (!vehicleIds.isEmpty()) {
            serviceRecordRepository.deleteByVehicleIdIn(vehicleIds);
            vehicleRepository.deleteAll(vehicles);
        }

        customerRepository.delete(customer);
    }

    public CustomerResponse toResponseWithCount(Customer c) {
        int count = (int) vehicleRepository.countByCustomerId(c.getId());
        return toResponse(c, count);
    }

    public CustomerResponse toResponse(Customer c, int vehicleCount) {
        return new CustomerResponse(
                c.getId(),
                c.getName(),
                c.getEmail(),
                c.getPhone() != null ? c.getPhone() : "",
                c.getAddress() != null ? c.getAddress() : "",
                c.getCreatedAt(),
                vehicleCount
        );
    }
}
