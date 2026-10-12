package com.autopulse.vsm.controller;

import com.autopulse.vsm.dto.VehicleRequest;
import com.autopulse.vsm.dto.VehicleResponse;
import com.autopulse.vsm.service.VehicleService;
import com.autopulse.vsm.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public List<VehicleResponse> getAllVehicles(HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        return vehicleService.getAllVehicles();
    }

    @GetMapping("/{id}")
    public VehicleResponse getVehicle(@PathVariable String id, HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        return vehicleService.getVehicle(id);
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody VehicleRequest req,
                                                         HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        VehicleResponse created = vehicleService.createVehicle(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public VehicleResponse updateVehicle(@PathVariable String id,
                                         @RequestBody VehicleRequest req,
                                         HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        return vehicleService.updateVehicle(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVehicle(@PathVariable String id, HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        vehicleService.deleteVehicle(id);
    }
}
