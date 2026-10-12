package com.autopulse.vsm.dto;

import jakarta.validation.constraints.NotBlank;

public record CustomerRequest(
    @NotBlank(message = "Name is required") String name,
    @NotBlank(message = "Email is required") String email,
    String phone,
    String address
) {}
