package com.autopulse.vsm.repository;

import com.autopulse.vsm.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    List<Vehicle> findByCustomerId(String customerId);
    List<Vehicle> findAllByOrderByCreatedAtDesc();
    long countByCustomerId(String customerId);
    void deleteByCustomerId(String customerId);
}
