package com.autopulse.vsm.repository;

import com.autopulse.vsm.model.ServiceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, String> {
    List<ServiceRecord> findByVehicleId(String vehicleId);
    List<ServiceRecord> findByVehicleIdOrderByServiceDateDesc(String vehicleId);
    List<ServiceRecord> findAllByOrderByCreatedAtDesc();
    void deleteByVehicleId(String vehicleId);
    void deleteByVehicleIdIn(List<String> vehicleIds);
}
