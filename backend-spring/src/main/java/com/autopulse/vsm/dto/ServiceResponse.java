package com.autopulse.vsm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ServiceResponse(
    String id,
    @JsonProperty("vehicle_id") String vehicleId,
    @JsonProperty("service_type") String serviceType,
    String description,
    String technician,
    Double cost,
    String status,
    @JsonProperty("service_date") String serviceDate,
    @JsonProperty("created_at") String createdAt,
    @JsonProperty("vehicle_label") String vehicleLabel,
    @JsonProperty("owner_name") String ownerName
) {}
