package com.autopulse.vsm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserResponse(
    String id,
    String email,
    String name,
    String role,
    @JsonProperty("customer_id") String customerId
) {}
