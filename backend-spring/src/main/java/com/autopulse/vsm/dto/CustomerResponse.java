package com.autopulse.vsm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CustomerResponse(
    String id,
    String name,
    String email,
    String phone,
    String address,
    @JsonProperty("created_at") String createdAt,
    @JsonProperty("vehicle_count") int vehicleCount
) {}
