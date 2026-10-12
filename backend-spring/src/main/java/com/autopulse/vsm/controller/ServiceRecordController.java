package com.autopulse.vsm.controller;

import com.autopulse.vsm.dto.ServiceRequest;
import com.autopulse.vsm.dto.ServiceResponse;
import com.autopulse.vsm.service.ServiceRecordService;
import com.autopulse.vsm.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceRecordController {

    private final ServiceRecordService serviceRecordService;

    public ServiceRecordController(ServiceRecordService serviceRecordService) {
        this.serviceRecordService = serviceRecordService;
    }

    @GetMapping
    public List<ServiceResponse> getAllServices(HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        return serviceRecordService.getAllServices();
    }

    @GetMapping("/{id}")
    public ServiceResponse getService(@PathVariable String id, HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        return serviceRecordService.getService(id);
    }

    @PostMapping
    public ResponseEntity<ServiceResponse> createService(@Valid @RequestBody ServiceRequest req,
                                                         HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        ServiceResponse created = serviceRecordService.createService(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ServiceResponse updateService(@PathVariable String id,
                                         @RequestBody ServiceRequest req,
                                         HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        return serviceRecordService.updateService(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteService(@PathVariable String id, HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        serviceRecordService.deleteService(id);
    }
}
