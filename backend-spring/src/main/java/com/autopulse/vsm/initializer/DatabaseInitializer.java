package com.autopulse.vsm.initializer;

import com.autopulse.vsm.model.*;
import com.autopulse.vsm.repository.CustomerRepository;
import com.autopulse.vsm.repository.ServiceRecordRepository;
import com.autopulse.vsm.repository.UserRepository;
import com.autopulse.vsm.repository.VehicleRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceRecordRepository serviceRecordRepository;
    private final ObjectMapper objectMapper;

    public DatabaseInitializer(UserRepository userRepository,
                               CustomerRepository customerRepository,
                               VehicleRepository vehicleRepository,
                               ServiceRecordRepository serviceRecordRepository,
                               ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.serviceRecordRepository = serviceRecordRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized. Skipping seeding.");
            return;
        }

        log.info("Seeding initial users and records into MySQL database...");

        // 1. Seed default Users
        User staff = new User(
                "513d46d5-5557-48c8-ae1d-5b633141896e",
                "staff@autovsm.com",
                "password123",
                "Rajesh Sharma",
                Role.STAFF,
                null
        );
        userRepository.save(staff);

        User customerUser = new User(
                "f61c7ffa-d317-4a27-951e-651beb19b21b",
                "customer@autovsm.com",
                "password123",
                "Priya Sharma",
                Role.CUSTOMER,
                "b4d8ead2-b110-4cad-baf3-96ceb3383002"
        );
        userRepository.save(customerUser);

        // 2. Load seed_data.json
        try {
            ClassPathResource resource = new ClassPathResource("seed_data.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    JsonNode root = objectMapper.readTree(is);

                    // Customers
                    JsonNode customersNode = root.get("customers");
                    if (customersNode != null && customersNode.isArray()) {
                        for (JsonNode cNode : customersNode) {
                            Customer c = new Customer(
                                    cNode.get("id").asText(),
                                    cNode.get("name").asText(),
                                    cNode.get("email").asText(),
                                    cNode.has("phone") ? cNode.get("phone").asText() : "",
                                    cNode.has("address") ? cNode.get("address").asText() : "",
                                    cNode.get("created_at").asText(),
                                    cNode.has("vehicle_count") ? cNode.get("vehicle_count").asInt() : 0
                            );
                            customerRepository.save(c);
                        }
                    }

                    // Vehicles
                    JsonNode vehiclesNode = root.get("vehicles");
                    if (vehiclesNode != null && vehiclesNode.isArray()) {
                        for (JsonNode vNode : vehiclesNode) {
                            Vehicle v = new Vehicle(
                                    vNode.get("id").asText(),
                                    vNode.get("customer_id").asText(),
                                    vNode.get("make").asText(),
                                    vNode.get("model").asText(),
                                    vNode.get("year").asInt(),
                                    vNode.get("plate").asText(),
                                    vNode.get("vin").asText(),
                                    vNode.get("mileage").asInt(),
                                    vNode.get("created_at").asText()
                            );
                            vehicleRepository.save(v);
                        }
                    }

                    // Services
                    JsonNode servicesNode = root.get("services");
                    if (servicesNode != null && servicesNode.isArray()) {
                        for (JsonNode sNode : servicesNode) {
                            ServiceRecord s = new ServiceRecord(
                                    sNode.get("id").asText(),
                                    sNode.get("vehicle_id").asText(),
                                    sNode.get("service_type").asText(),
                                    sNode.has("description") ? sNode.get("description").asText() : "",
                                    sNode.has("technician") ? sNode.get("technician").asText() : "",
                                    sNode.has("cost") ? sNode.get("cost").asDouble() : 0.0,
                                    ServiceStatus.fromString(sNode.get("status").asText()),
                                    sNode.get("service_date").asText(),
                                    sNode.get("created_at").asText()
                            );
                            serviceRecordRepository.save(s);
                        }
                    }

                    log.info("Seeding completed successfully! Customers: {}, Vehicles: {}, Services: {}",
                            customerRepository.count(), vehicleRepository.count(), serviceRecordRepository.count());
                }
            }
        } catch (Exception e) {
            log.error("Error loading seed_data.json: {}", e.getMessage(), e);
        }
    }
}
