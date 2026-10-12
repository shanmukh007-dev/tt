package com.autopulse.vsm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ServiceRequest(
    @NotBlank(message = "Vehicle ID is required") @JsonProperty("vehicle_id") String vehicleId,
    @NotBlank(message = "Service type is required") @JsonProperty("service_type") String serviceType,
    String description,
    String technician,
    @NotNull(message = "Cost is required") Double cost,
    @NotBlank(message = "Status is required") String status,
    @NotBlank(message = "Service date is required") @JsonProperty("service_date") String serviceDate
) {}
