package com.autopulse.vsm.model;

import jakarta.persistence.*;

@Entity
@Table(name = "services")
public class ServiceRecord {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "vehicle_id", nullable = false, length = 36)
    private String vehicleId;

    @Column(name = "service_type", nullable = false, length = 100)
    private String serviceType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String technician;

    @Column(nullable = false)
    private Double cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceStatus status;

    @Column(name = "service_date", nullable = false, length = 20)
    private String serviceDate;

    @Column(name = "created_at", nullable = false, length = 50)
    private String createdAt;

    @Transient
    private String vehicleLabel;

    @Transient
    private String ownerName;

    public ServiceRecord() {
    }

    public ServiceRecord(String id, String vehicleId, String serviceType, String description, String technician, Double cost, ServiceStatus status, String serviceDate, String createdAt) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.serviceType = serviceType;
        this.description = description;
        this.technician = technician;
        this.cost = cost;
        this.status = status;
        this.serviceDate = serviceDate;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTechnician() {
        return technician;
    }

    public void setTechnician(String technician) {
        this.technician = technician;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public ServiceStatus getStatus() {
        return status;
    }

    public void setStatus(ServiceStatus status) {
        this.status = status;
    }

    public String getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(String serviceDate) {
        this.serviceDate = serviceDate;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getVehicleLabel() {
        return vehicleLabel;
    }

    public void setVehicleLabel(String vehicleLabel) {
        this.vehicleLabel = vehicleLabel;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }
}
