package com.autopulse.vsm.dto;

import java.util.List;

public record PortalSummaryResponse(
    CustomerResponse customer,
    List<PortalVehicleResponse> vehicles
) {}
