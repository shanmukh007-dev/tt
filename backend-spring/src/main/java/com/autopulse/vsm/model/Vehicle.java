package com.autopulse.vsm.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "customer_id", nullable = false, length = 36)
    private String customerId;

    @Column(nullable = false, length = 50)
    private String make;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(name = "model_year", nullable = false)
    private int year;

    @Column(nullable = false, length = 20)
    private String plate;

    @Column(nullable = false, length = 30)
    private String vin;

    @Column(nullable = false)
    private int mileage;

    @Column(name = "created_at", nullable = false, length = 50)
    private String createdAt;

    @Transient
    private String ownerName;

    public Vehicle() {
    }

    public Vehicle(String id, String customerId, String make, String model, int year, String plate, String vin, int mileage, String createdAt) {
        this.id = id;
        this.customerId = customerId;
        this.make = make;
        this.model = model;
        this.year = year;
        this.plate = plate;
        this.vin = vin;
        this.mileage = mileage;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public String getPlate() {
        return plate;
    }

    public void setPlate(String plate) {
        this.plate = plate;
    }

    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public int getMileage() {
        return mileage;
    }

    public void setMileage(int mileage) {
        this.mileage = mileage;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getVehicleLabel() {
        return year + " " + make + " " + model + " · " + plate;
    }
}
