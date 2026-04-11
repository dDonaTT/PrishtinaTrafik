CREATE DATABASE IF NOT EXISTS prishtina_traffic;
USE prishtina_traffic;

-- USERS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VEHICLES
CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('bus','taxi','bike','scooter') NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  status ENUM('available','occupied','in_use','locked') DEFAULT 'available',
  route_name VARCHAR(100),
  station_name VARCHAR(100),
  battery_level INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WALLET
CREATE TABLE wallets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- BOOKINGS
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  vehicle_id INT,
  status ENUM('pending','confirmed','in_progress','completed','cancelled') DEFAULT 'pending',
  eta INT,
  cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- TRANSACTIONS
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  type ENUM('top_up','taxi','bike','scooter','bus') NOT NULL,
  amount DECIMAL(10,2),
  vehicle_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- BUS TICKETS
CREATE TABLE bus_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  vehicle_id INT,
  route_name VARCHAR(100),
  cost DECIMAL(10,2) DEFAULT 0.40,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);