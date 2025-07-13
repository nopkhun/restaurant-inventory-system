-- MySQL 8.1 Schema for Shop Stock Management System

CREATE DATABASE IF NOT EXISTS shop_stock;
USE shop_stock;

-- Core Tables
CREATE TABLE locations (
  location_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type ENUM('central', 'restaurant') NOT NULL,
  parent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ingredients (
  ingredient_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  unit VARCHAR(50) NOT NULL,
  supplier_id INT,
  min_stock DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE stock_movements (
  movement_id INT PRIMARY KEY AUTO_INCREMENT,
  ingredient_id INT NOT NULL,
  from_location INT NOT NULL,
  to_location INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  movement_type ENUM('in', 'out', 'transfer') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id),
  FOREIGN KEY (from_location) REFERENCES locations(location_id),
  FOREIGN KEY (to_location) REFERENCES locations(location_id)
);

CREATE TABLE stock_audits (
  audit_id INT PRIMARY KEY AUTO_INCREMENT,
  location_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  system_qty DECIMAL(10,2) NOT NULL,
  physical_qty DECIMAL(10,2) NOT NULL,
  audit_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(location_id),
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id)
);

-- Initial Data for Central Kitchen
INSERT INTO locations (name, type) VALUES ('Central Kitchen', 'central');
