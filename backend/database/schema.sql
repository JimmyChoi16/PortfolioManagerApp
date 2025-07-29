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
    sector VARCHAR(50) DEFAULT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_symbol (symbol),
    INDEX idx_type (type),
    INDEX idx_sector (sector)
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
    sector VARCHAR(50) DEFAULT NULL,
    dividend_yield DECIMAL(5, 3) DEFAULT NULL,
    pe_ratio DECIMAL(10, 3) DEFAULT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Historical performance data
CREATE TABLE IF NOT EXISTS portfolio_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    total_value DECIMAL(20, 2) NOT NULL,
    daily_change DECIMAL(20, 2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(20, 2) NOT NULL DEFAULT 0,
    total_gain_loss DECIMAL(20, 2) NOT NULL DEFAULT 0,
    gain_loss_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
);

-- Simple recommendations table for basic investment advice
CREATE TABLE IF NOT EXISTS simple_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    recommendation ENUM('buy', 'sell', 'hold') NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    INDEX idx_symbol (symbol)
);

CREATE TABLE portfolio (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portfolio_holding (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    portfolio_id INTEGER NOT NULL,
    holding_id INTEGER NOT NULL,
    allocation_percent DECIMAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolio(id),
    FOREIGN KEY (holding_id) REFERENCES holding(id)
);

-- Insert initial portfolio summary record
INSERT INTO portfolio_summary (total_value, daily_change, daily_change_percent, total_holdings) 
VALUES (107125.00, 7675.00, 7.72, 4) 
ON DUPLICATE KEY UPDATE id=id;

-- Insert sample holdings data with new fields
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('AAPL', 'Apple Inc.', 'stock', 100, 150.00, '2023-01-15', 175.50, 'Technology', 'Core technology holding'),
('NVDA', 'NVIDIA Corp.', 'stock', 50, 400.00, '2023-02-10', 520.00, 'Technology', 'AI and gaming focus'),
('MSFT', 'Microsoft Corp.', 'stock', 75, 280.00, '2023-03-05', 420.00, 'Technology', 'Cloud and software leader'),
('TSLA', 'Tesla Inc.', 'stock', 25, 200.00, '2023-04-12', 250.00, 'Automotive', 'Electric vehicle pioneer')
ON DUPLICATE KEY UPDATE current_price=VALUES(current_price), sector=VALUES(sector), notes=VALUES(notes);

-- Insert sample historical data with new fields
INSERT INTO portfolio_history (date, total_value, daily_change, total_cost, total_gain_loss, gain_loss_percent) VALUES
('2024-01-15', 98450.00, -1200.00, 95000.00, 3450.00, 3.63),
('2024-01-16', 99200.00, 750.00, 95000.00, 4200.00, 4.42),
('2024-01-17', 101300.00, 2100.00, 95000.00, 6300.00, 6.63),
('2024-01-18', 103800.00, 2500.00, 95000.00, 8800.00, 9.26),
('2024-01-19', 107125.00, 3325.00, 95000.00, 12125.00, 12.76)
ON DUPLICATE KEY UPDATE total_value=VALUES(total_value), total_cost=VALUES(total_cost), total_gain_loss=VALUES(total_gain_loss), gain_loss_percent=VALUES(gain_loss_percent);

-- Insert sample recommendations
INSERT INTO simple_recommendations (symbol, recommendation, reason, expires_at) VALUES
('AAPL', 'hold', 'Strong fundamentals, wait for better entry point', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('NVDA', 'buy', 'AI growth momentum continues', DATE_ADD(NOW(), INTERVAL 14 DAY)),
('MSFT', 'hold', 'Stable performer, good for long term', DATE_ADD(NOW(), INTERVAL 60 DAY)),
('TSLA', 'sell', 'Consider taking profits, high volatility', DATE_ADD(NOW(), INTERVAL 7 DAY));