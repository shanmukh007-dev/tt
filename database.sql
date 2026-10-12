-- ==========================================================
-- AutoPulse VSM Database Schema & Initial Data for MySQL
-- ==========================================================

CREATE DATABASE IF NOT EXISTS autopulse_vsm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autopulse_vsm;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    customer_id VARCHAR(36)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    address VARCHAR(255),
    created_at VARCHAR(50) NOT NULL,
    vehicle_count INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    model_year INT NOT NULL,
    plate VARCHAR(20) NOT NULL,
    vin VARCHAR(30) NOT NULL,
    mileage INT NOT NULL,
    created_at VARCHAR(50) NOT NULL,
    INDEX idx_customer (customer_id),
    CONSTRAINT fk_vehicle_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Services Table
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    technician VARCHAR(100),
    cost DOUBLE NOT NULL DEFAULT 0.0,
    status VARCHAR(20) NOT NULL,
    service_date VARCHAR(20) NOT NULL,
    created_at VARCHAR(50) NOT NULL,
    INDEX idx_vehicle (vehicle_id),
    CONSTRAINT fk_service_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- Seed Data
-- ----------------------------------------------------------

-- Default Demo Users
INSERT INTO users (id, email, password, name, role, customer_id) VALUES
('513d46d5-5557-48c8-ae1d-5b633141896e', 'staff@autovsm.com', 'password123', 'Rajesh Sharma', 'STAFF', NULL),
('f61c7ffa-d317-4a27-951e-651beb19b21b', 'customer@autovsm.com', 'password123', 'Priya Sharma', 'CUSTOMER', 'b4d8ead2-b110-4cad-baf3-96ceb3383002')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Customers
INSERT INTO customers (id, name, email, phone, address, created_at, vehicle_count) VALUES
('f9e99e4d-2e38-48e6-8f86-53b8cd795b93', 'Vikram Malhotra', 'vikram.malhotra@example.com', '+91 98630 99210', '7 Linking Road, Bandra West, Mumbai', '2026-10-11T13:52:02.620000Z', 1),
('11b7fa79-0510-430f-b318-9b1e4f4e2dc6', 'Pooja Reddy', 'pooja.reddy@example.com', '+91 98774 55601', '230 Jubilee Hills, Hyderabad', '2026-10-11T13:52:02.620000Z', 1),
('b4d8ead2-b110-4cad-baf3-96ceb3383002', 'Priya Sharma', 'priya.sharma@example.com', '+91 98201 33450', '12 MG Road, Indiranagar, Bengaluru', '2026-10-11T13:52:02.618000Z', 2),
('d5b9c50f-b42b-4e9e-8596-b0e01f7d1753', 'Sneha Kulkarni', 'sneha.kulkarni@example.com', '+91 98449 22080', '410 FC Road, Shivajinagar, Pune', '2026-10-11T13:52:02.619000Z', 1),
('29b4d4d1-d159-4cf1-a80c-abde364478b8', 'Rahul Verma', 'rahul.verma@example.com', '+91 98882 11475', '88 Connaught Place, New Delhi', '2026-10-11T13:52:02.618000Z', 1),
('9fb92440-ab05-45f3-8b05-2c9636c62a82', 'Neha Gupta', 'neha.gupta@example.com', '+91 98000 12345', '15 Park Street, Kolkata', '2026-10-11T13:54:39.107000Z', 0)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Vehicles
INSERT INTO vehicles (id, customer_id, make, model, model_year, plate, vin, mileage, created_at) VALUES
('c142bfd5-27d2-40a5-9bf0-90a26b527b76', 'f9e99e4d-2e38-48e6-8f86-53b8cd795b93', 'Nissan', 'Altima', 2019, '2PQS108', '1N4AA4AP7KC321906', 91270, '2026-10-11T13:52:02.623000Z'),
('dc763bef-ebce-4c1e-8a77-9424cc261973', '11b7fa79-0510-430f-b318-9b1e4f4e2dc6', 'Tesla', 'Model 3', 2024, '9TSL442', '5YJ3E1EA8PF412006', 9315, '2026-10-11T13:52:02.623000Z'),
('dacd89a8-2f3e-41ae-be1d-63b7db2ed0bf', 'b4d8ead2-b110-4cad-baf3-96ceb3383002', 'Honda', 'CR-V', 2021, '3BTR918', '5J6RW2H85MA110922', 58120, '2026-10-11T13:52:02.622000Z'),
('121f9f9e-5b79-4e1d-a96c-8db038778f74', '29b4d4d1-d159-4cf1-a80c-abde364478b8', 'Ford', 'F-150', 2023, '8MLP330', '1FTFW1E85PFA22731', 18760, '2026-10-11T13:52:02.622000Z'),
('0aaae803-7ae2-448c-8a41-7d84539a22a9', 'd5b9c50f-b42b-4e9e-8596-b0e01f7d1753', 'BMW', '330i', 2020, '6GXD755', 'WBA5R1C50LA948215', 64940, '2026-10-11T13:52:02.622000Z'),
('31f32f54-bc1c-4e06-be02-6041d6c91cb0', 'b4d8ead2-b110-4cad-baf3-96ceb3383002', 'Toyota', 'Camry', 2022, '7KJD421', '4T1C11AK5NU568134', 42350, '2026-10-11T13:52:02.621000Z')
ON DUPLICATE KEY UPDATE make=VALUES(make);

-- Services
INSERT INTO services (id, vehicle_id, service_type, description, technician, cost, status, service_date, created_at) VALUES
('1c79a1b5-b8cb-437b-8421-d0f85781b74c', 'c142bfd5-27d2-40a5-9bf0-90a26b527b76', 'UI Smoke Test Service', '', 'Amit Joshi', 0.0, 'PENDING', '2026-10-11', '2026-10-11T13:54:40.384000Z'),
('09e0614b-f35f-4033-814b-df5afb6c37e9', '0aaae803-7ae2-448c-8a41-7d84539a22a9', 'Coolant System Repair', 'Thermostat and upper hose replacement, pressure test.', 'Arjun Nair', 540.0, 'IN_PROGRESS', '2026-10-10', '2026-10-10T13:52:02.681000Z'),
('dadae364-ab0e-4fba-9937-0419b4675d3e', '31f32f54-bc1c-4e06-be02-6041d6c91cb0', '50k Mile Major Service', 'Spark plugs, air & cabin filters, brake fluid, tire rotation.', 'Rohan Mehta', 649.0, 'IN_PROGRESS', '2026-10-09', '2026-10-09T13:52:02.624000Z'),
('24499d57-ced0-412a-a7c5-554f1f1b304d', 'dc763bef-ebce-4c1e-8a77-9424cc261973', 'Brake Fluid Check', 'Moisture test, top-up, brake inspection.', 'Arjun Nair', 45.0, 'COMPLETED', '2026-10-08', '2026-10-08T13:52:02.683000Z'),
('359dc452-6766-4441-a39e-63c3198e89b8', 'c142bfd5-27d2-40a5-9bf0-90a26b527b76', 'Battery Replacement', 'AGM battery installed, charging system tested.', 'Suresh Patel', 215.0, 'PENDING', '2026-10-07', '2026-10-07T13:52:02.682000Z'),
('908620f7-5680-4248-8c48-4a2dcbdc2740', '121f9f9e-5b79-4e1d-a96c-8db038778f74', 'Tire Rotation & Alignment', 'Four-wheel alignment, rotation, torque check.', 'Rohan Mehta', 129.0, 'PENDING', '2026-10-05', '2026-10-05T13:52:02.680000Z'),
('3cbf37a8-e8ac-49f1-9d86-8aec60a79150', 'dc763bef-ebce-4c1e-8a77-9424cc261973', 'Cabin Air Filter Replacement', 'HEPA cabin filter, HVAC sanitizing treatment.', 'Rohan Mehta', 65.0, 'COMPLETED', '2026-10-02', '2026-10-02T13:52:02.683000Z'),
('8b0e5553-e4ae-47ba-8ff7-c37145e24464', '121f9f9e-5b79-4e1d-a96c-8db038778f74', 'Transmission Fluid Flush', 'Full flush with OEM-spec Mercon ULV fluid.', 'Suresh Patel', 189.0, 'COMPLETED', '2026-09-29', '2026-09-29T13:52:02.679000Z'),
('9e104d4d-2117-4764-9b1b-d4c544249e07', 'c142bfd5-27d2-40a5-9bf0-90a26b527b76', 'Synthetic Oil & Filter Change', 'Full synthetic 5W-30, filter replaced.', 'Rohan Mehta', 79.99, 'COMPLETED', '2026-09-23', '2026-09-23T13:52:02.681000Z'),
('702d8920-44b6-402a-9ae6-e2eb1ead35d2', '31f32f54-bc1c-4e06-be02-6041d6c91cb0', 'Synthetic Oil & Filter Change', 'Full synthetic 0W-20, filter replaced, 21-point inspection.', 'Arjun Nair', 89.99, 'COMPLETED', '2026-09-15', '2026-09-15T13:52:02.623000Z'),
('e6c033fd-47e2-4721-90ed-fe64bb4688e3', 'dacd89a8-2f3e-41ae-be1d-63b7db2ed0bf', 'Brake Pad & Rotor Replacement', 'Front pads and rotors, caliper service, road test.', 'Arjun Nair', 412.5, 'COMPLETED', '2026-08-31', '2026-08-31T13:52:02.624000Z'),
('ae3dd498-c45b-4379-9653-d6a78e881e5a', '0aaae803-7ae2-448c-8a41-7d84539a22a9', 'Annual Diagnostic Inspection', 'Full-system scan, suspension check, report printed.', 'Suresh Patel', 220.0, 'COMPLETED', '2026-08-12', '2026-08-12T13:52:02.680000Z')
ON DUPLICATE KEY UPDATE service_type=VALUES(service_type);
