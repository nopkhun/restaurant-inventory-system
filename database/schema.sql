CREATE DATABASE IF NOT EXISTS shop_stock;
USE shop_stock;

CREATE TABLE IF NOT EXISTS ingredients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  unit VARCHAR(50) NOT NULL,
  min_stock DECIMAL(10,2) NOT NULL,
  current_stock DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ingredient_id INT NOT NULL,
  from_location ENUM('central','branch') NOT NULL,
  to_location ENUM('central','branch') NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  movement_type ENUM('transfer','adjustment') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);
