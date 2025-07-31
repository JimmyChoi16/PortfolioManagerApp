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

-- Bonds table to store bond-specific information
CREATE TABLE IF NOT EXISTS bonds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    holding_id INT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    bond_type ENUM('government', 'corporate', 'municipal', 'international') NOT NULL DEFAULT 'government',
    coupon_rate DECIMAL(5, 2) NOT NULL,
    maturity_date DATE NOT NULL,
    face_value DECIMAL(15, 2) NOT NULL,
    current_yield DECIMAL(5, 2) DEFAULT NULL,
    credit_rating VARCHAR(5) DEFAULT 'A',
    issuer VARCHAR(255) DEFAULT NULL,
    callable BOOLEAN DEFAULT FALSE,
    call_date DATE DEFAULT NULL,
    call_price DECIMAL(15, 2) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (holding_id) REFERENCES holdings(id) ON DELETE CASCADE,
    INDEX idx_symbol (symbol),
    INDEX idx_bond_type (bond_type),
    INDEX idx_maturity_date (maturity_date),
    INDEX idx_credit_rating (credit_rating)
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

-- Insert sample bond holdings
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('UST10Y', 'U.S. Treasury 10-Year', 'bond', 100.000000, 150.00, '2023-01-14', 175.50, 'Government', 'Core government holding'),
('AAPL5Y', 'Apple Inc. 5-Year', 'bond', 50.000000, 400.00, '2023-02-09', 520.00, 'Technology', 'Tech sector exposure'),
('CAMUNI7', 'California Muni 7-Year', 'bond', 75.000000, 280.00, '2023-03-04', 420.00, 'Municipal', 'Tax-advantaged income'),
('DEBUND5', 'German Bund 5-Year', 'bond', 25.000000, 200.00, '2023-04-11', 250.00, 'International', 'International diversification'),
('UST30Y', 'U.S. Treasury 30-Year', 'bond', 40.000000, 130.00, '2023-05-31', 145.00, 'Government', 'Long-term government bond'),
('MSFT7Y', 'Microsoft Corp. 7-Year', 'bond', 200.000000, 200.00, '2023-01-24', 245.00, 'Technology', 'Tech corporate bond')
ON DUPLICATE KEY UPDATE current_price=VALUES(current_price), sector=VALUES(sector), notes=VALUES(notes);

-- Insert sample bond data
INSERT INTO bonds (holding_id, symbol, name, bond_type, coupon_rate, maturity_date, face_value, current_yield, credit_rating, issuer) VALUES
((SELECT id FROM holdings WHERE symbol = 'UST10Y' LIMIT 1), 'UST10Y', 'U.S. Treasury 10-Year', 'government', 4.25, '2034-05-14', 50000.00, 4.28, 'AAA', 'U.S. Treasury'),
((SELECT id FROM holdings WHERE symbol = 'AAPL5Y' LIMIT 1), 'AAPL5Y', 'Apple Inc. 5-Year', 'corporate', 3.85, '2029-03-14', 25000.00, 4.12, 'AA+', 'Apple Inc.'),
((SELECT id FROM holdings WHERE symbol = 'CAMUNI7' LIMIT 1), 'CAMUNI7', 'California Muni 7-Year', 'municipal', 3.45, '2031-08-19', 30000.00, 3.52, 'AA', 'State of California'),
((SELECT id FROM holdings WHERE symbol = 'DEBUND5' LIMIT 1), 'DEBUND5', 'German Bund 5-Year', 'international', 2.15, '2029-12-09', 20000.00, 2.18, 'AAA', 'German Government'),
((SELECT id FROM holdings WHERE symbol = 'UST30Y' LIMIT 1), 'UST30Y', 'U.S. Treasury 30-Year', 'government', 3.75, '2053-01-14', 100000.00, 3.95, 'AAA', 'U.S. Treasury'),
((SELECT id FROM holdings WHERE symbol = 'MSFT7Y' LIMIT 1), 'MSFT7Y', 'Microsoft Corp. 7-Year', 'corporate', 4.15, '2030-02-19', 75000.00, 4.05, 'AA+', 'Microsoft Corp.')
ON DUPLICATE KEY UPDATE current_yield=VALUES(current_yield), credit_rating=VALUES(credit_rating), issuer=VALUES(issuer);

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