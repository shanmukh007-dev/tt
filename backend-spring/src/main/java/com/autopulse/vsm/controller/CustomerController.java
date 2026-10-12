package com.autopulse.vsm.controller;

import com.autopulse.vsm.dto.CustomerRequest;
import com.autopulse.vsm.dto.CustomerResponse;
import com.autopulse.vsm.service.CustomerService;
import com.autopulse.vsm.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public List<CustomerResponse> getAllCustomers(HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        return customerService.getAllCustomers();
    }

    @GetMapping("/{id}")
    public CustomerResponse getCustomer(@PathVariable String id, HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        return customerService.getCustomer(id);
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest req,
                                                           HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        CustomerResponse created = customerService.createCustomer(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public CustomerResponse updateCustomer(@PathVariable String id,
                                           @RequestBody CustomerRequest req,
                                           HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        return customerService.updateCustomer(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCustomer(@PathVariable String id, HttpServletRequest request) {
        SecurityUtils.requireStaff(request);
        customerService.deleteCustomer(id);
    }
}
