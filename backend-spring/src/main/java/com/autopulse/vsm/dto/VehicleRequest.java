package com.autopulse.vsm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VehicleRequest(
    @NotBlank(message = "Customer ID is required") @JsonProperty("customer_id") String customerId,
    @NotBlank(message = "Make is required") String make,
    @NotBlank(message = "Model is required") String model,
    @NotNull(message = "Year is required") Integer year,
    @NotBlank(message = "Plate is required") String plate,
    @NotBlank(message = "VIN is required") String vin,
    @NotNull(message = "Mileage is required") Integer mileage
) {}
