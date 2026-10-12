package com.autopulse.vsm.service;

import com.autopulse.vsm.dto.CustomerResponse;
import com.autopulse.vsm.dto.PortalSummaryResponse;
import com.autopulse.vsm.dto.PortalVehicleResponse;
import com.autopulse.vsm.dto.ServiceResponse;
import com.autopulse.vsm.model.Customer;
import com.autopulse.vsm.model.Role;
import com.autopulse.vsm.model.User;
import com.autopulse.vsm.model.Vehicle;
import com.autopulse.vsm.repository.CustomerRepository;
import com.autopulse.vsm.repository.ServiceRecordRepository;
import com.autopulse.vsm.repository.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class PortalService {

    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceRecordRepository serviceRecordRepository;
    private final ServiceRecordService serviceRecordService;

    public PortalService(CustomerRepository customerRepository,
                         VehicleRepository vehicleRepository,
                         ServiceRecordRepository serviceRecordRepository,
                         ServiceRecordService serviceRecordService) {
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.serviceRecordRepository = serviceRecordRepository;
        this.serviceRecordService = serviceRecordService;
    }

    public PortalSummaryResponse getPortalSummary(User user) {
        String customerId = user.getCustomerId();

        if (customerId == null || customerId.isBlank()) {
            if (user.getRole() == Role.STAFF) {
                // If staff previews the customer portal, use the first customer
                List<Customer> allCustomers = customerRepository.findAll();
                if (!allCustomers.isEmpty()) {
                    customerId = allCustomers.get(0).getId();
                }
            }
        }

        if (customerId == null || customerId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No customer associated with this account");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(customerId);
        int totalVehicles = vehicles.size();

        List<PortalVehicleResponse> portalVehicles = new ArrayList<>();
        for (Vehicle v : vehicles) {
            List<ServiceResponse> services = serviceRecordRepository.findByVehicleIdOrderByServiceDateDesc(v.getId())
                    .stream()
                    .map(serviceRecordService::toResponse)
                    .toList();

            portalVehicles.add(new PortalVehicleResponse(
                    v.getId(),
                    v.getCustomerId(),
                    v.getMake(),
                    v.getModel(),
                    v.getYear(),
                    v.getPlate(),
                    v.getVin(),
                    v.getMileage(),
                    v.getCreatedAt(),
                    customer.getName(),
                    totalVehicles,
                    services
            ));
        }

        CustomerResponse customerResponse = new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone() != null ? customer.getPhone() : "",
                customer.getAddress() != null ? customer.getAddress() : "",
                customer.getCreatedAt(),
                totalVehicles
        );

        return new PortalSummaryResponse(customerResponse, portalVehicles);
    }
}
