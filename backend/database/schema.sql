-- Create database
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Holdings table to store portfolio assets
CREATE TABLE IF NOT EXISTS holdings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('stock', 'bond', 'cash', 'fund', 'crypto') NOT NULL DEFAULT 'stock',
    quantity DECIMAL(15, 6) NOT NULL DEFAULT 0,
    purchase_price DECIMAL(15, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    current_price DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_symbol (symbol),
    INDEX idx_type (type)
);

-- Portfolio summary table for storing aggregated data
CREATE TABLE IF NOT EXISTS portfolio_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_value DECIMAL(20, 2) NOT NULL DEFAULT 0,
    daily_change DECIMAL(20, 2) NOT NULL DEFAULT 0,
    daily_change_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
    total_holdings INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Market data cache table
CREATE TABLE IF NOT EXISTS market_data (
    symbol VARCHAR(10) PRIMARY KEY,
    current_price DECIMAL(15, 2) NOT NULL,
    change_amount DECIMAL(15, 2) DEFAULT 0,
    change_percent DECIMAL(5, 2) DEFAULT 0,
    volume BIGINT DEFAULT 0,
    market_cap BIGINT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Historical performance data
CREATE TABLE IF NOT EXISTS portfolio_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    total_value DECIMAL(20, 2) NOT NULL,
    daily_change DECIMAL(20, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
);

-- Insert initial portfolio summary record
INSERT INTO portfolio_summary (total_value, daily_change, daily_change_percent, total_holdings) 
VALUES (107125.00, 7675.00, 7.72, 4) 
ON DUPLICATE KEY UPDATE id=id;

-- Insert sample holdings data
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price) VALUES
('AAPL', 'Apple Inc.', 'stock', 100, 150.00, '2023-01-15', 175.50),
('NVDA', 'NVIDIA Corp.', 'stock', 50, 400.00, '2023-02-10', 520.00),
('MSFT', 'Microsoft Corp.', 'stock', 75, 280.00, '2023-03-05', 420.00),
('TSLA', 'Tesla Inc.', 'stock', 25, 200.00, '2023-04-12', 250.00)
ON DUPLICATE KEY UPDATE current_price=VALUES(current_price);

-- Insert sample historical data for the chart
INSERT INTO portfolio_history (date, total_value, daily_change) VALUES
('2024-01-15', 98450.00, -1200.00),
('2024-01-16', 99200.00, 750.00),
('2024-01-17', 101300.00, 2100.00),
('2024-01-18', 103800.00, 2500.00),
('2024-01-19', 107125.00, 3325.00)
ON DUPLICATE KEY UPDATE total_value=VALUES(total_value);