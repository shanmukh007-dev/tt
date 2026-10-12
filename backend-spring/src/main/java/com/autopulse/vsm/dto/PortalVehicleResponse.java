package com.autopulse.vsm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record PortalVehicleResponse(
    String id,
    @JsonProperty("customer_id") String customerId,
    String make,
    String model,
    int year,
    String plate,
    String vin,
    int mileage,
    @JsonProperty("created_at") String createdAt,
    @JsonProperty("owner_name") String ownerName,
    @JsonProperty("vehicle_count") int vehicleCount,
    List<ServiceResponse> services
) {}
