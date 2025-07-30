-- Drop and recreate database
DROP DATABASE IF EXISTS portfolio_db;
CREATE DATABASE portfolio_db;
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

-- Funds table for detailed fund information
CREATE TABLE IF NOT EXISTS funds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    holding_id INT NOT NULL,
    symbol VARCHAR(10),
    name VARCHAR(255),
    fund_type ENUM('index', 'growth', 'bond', 'international', 'sector', 'money_market', 'commodity', 'real_estate', 'other') NOT NULL,
    sector VARCHAR(50),
    expense_ratio DECIMAL(5,2),
    ytd_return DECIMAL(5,2),
    return_1y DECIMAL(5,2),
    volatility_3y DECIMAL(5,2),
    volatility_1y DECIMAL(5,2),
    volatility_6m DECIMAL(5,2),
    volatility_3m DECIMAL(5,2),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_holding FOREIGN KEY (holding_id) REFERENCES holdings(id) ON DELETE CASCADE
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

-- Insert initial portfolio summary record
INSERT INTO portfolio_summary (total_value, daily_change, daily_change_percent, total_holdings) 
VALUES (125430.00, 7675.00, 7.72, 10);

-- Insert sample holdings data (stocks)
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('AAPL', 'Apple Inc.', 'stock', 100, 150.00, '2023-01-15', 175.50, 'Technology', 'Core technology holding'),
('NVDA', 'NVIDIA Corp.', 'stock', 50, 400.00, '2023-02-10', 520.00, 'Technology', 'AI and gaming focus'),
('MSFT', 'Microsoft Corp.', 'stock', 75, 280.00, '2023-03-05', 420.00, 'Technology', 'Cloud and software leader'),
('TSLA', 'Tesla Inc.', 'stock', 25, 200.00, '2023-04-12', 250.00, 'Automotive', 'Electric vehicle pioneer');

-- Insert fund holdings data (10 different types of funds)
-- 1. Index Fund - VTSAX
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VTSAX', 'Vanguard Total Stock Market Index Fund', 'fund', 100.5, 85.20, '2023-01-15', 92.45, 'Large Blend', 'Broad market exposure');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VTSAX', 'Vanguard Total Stock Market Index Fund', 'index', 'Large Blend', 0.04, 12.5, 18.2, 15.2, 12.8, 8.5, 5.2);

-- 2. Growth Fund - AGTHX
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('AGTHX', 'American Funds Growth Fund of America', 'fund', 50.0, 45.60, '2023-06-10', 52.80, 'Large Growth', 'Growth focused');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'AGTHX', 'American Funds Growth Fund of America', 'growth', 'Large Growth', 0.64, 15.2, 22.1, 18.5, 16.2, 12.3, 8.7);

-- 3. International Fund - VTIAX
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VTIAX', 'Vanguard Total International Stock Index Fund', 'fund', 60.0, 32.40, '2023-02-28', 35.20, 'Foreign Large Blend', 'International exposure');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VTIAX', 'Vanguard Total International Stock Index Fund', 'international', 'Foreign Large Blend', 0.11, 8.7, 14.3, 16.8, 14.5, 9.2, 6.1);

-- 4. Bond Fund - VBMFX
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VBMFX', 'Vanguard Total Bond Market Index Fund', 'fund', 0, 0, '2024-01-01', 11.25, 'Intermediate Core Bond', 'Bond exposure');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VBMFX', 'Vanguard Total Bond Market Index Fund', 'bond', 'Intermediate Core Bond', 0.15, 4.2, 6.8, 5.2, 4.8, 3.1, 2.5);

-- 5. Sector Fund - VGT
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VGT', 'Vanguard Information Technology ETF', 'fund', 0, 0, '2024-01-01', 245.30, 'Technology', 'Technology sector fund');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VGT', 'Vanguard Information Technology ETF', 'sector', 'Technology', 0.10, 18.5, 25.3, 22.1, 19.8, 15.6, 12.4);

-- 6. Money Market Fund - VMFXX
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VMFXX', 'Vanguard Federal Money Market Fund', 'fund', 0, 0, '2024-01-01', 1.00, 'Money Market', 'Cash equivalent');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VMFXX', 'Vanguard Federal Money Market Fund', 'money_market', 'Money Market', 0.11, 4.8, 4.8, 0.5, 0.5, 0.5, 0.5);

-- 7. Real Estate Fund - VNQ
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VNQ', 'Vanguard Real Estate ETF', 'fund', 0, 0, '2024-01-01', 85.60, 'Real Estate', 'Real estate investment trust');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VNQ', 'Vanguard Real Estate ETF', 'real_estate', 'Real Estate', 0.12, 6.8, 12.5, 18.2, 16.8, 11.2, 8.9);

-- 8. Commodity Fund - DBC
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('DBC', 'Invesco DB Commodity Index Tracking Fund', 'fund', 0, 0, '2024-01-01', 22.45, 'Commodities', 'Commodity exposure');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'DBC', 'Invesco DB Commodity Index Tracking Fund', 'commodity', 'Commodities', 0.89, 2.1, 8.9, 25.6, 22.4, 18.7, 15.3);

-- 9. Emerging Markets Fund - VEMAX
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VEMAX', 'Vanguard Emerging Markets Stock Index Fund', 'fund', 0, 0, '2024-01-01', 28.75, 'Diversified Emerging Mkts', 'Emerging markets exposure');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VEMAX', 'Vanguard Emerging Markets Stock Index Fund', 'international', 'Diversified Emerging Mkts', 0.14, 5.4, 11.2, 24.8, 21.6, 16.9, 13.2);

-- 10. Healthcare Fund - VHT
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VHT', 'Vanguard Health Care ETF', 'fund', 0, 0, '2024-01-01', 245.80, 'Health', 'Healthcare sector fund');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VHT', 'Vanguard Health Care ETF', 'sector', 'Health', 0.10, 9.8, 16.7, 14.2, 12.9, 9.8, 7.1);

-- Insert sample historical data
INSERT INTO portfolio_history (date, total_value, daily_change, total_cost, total_gain_loss, gain_loss_percent) VALUES
('2024-01-15', 98450.00, -1200.00, 95000.00, 3450.00, 3.63),
('2024-01-16', 99200.00, 750.00, 95000.00, 4200.00, 4.42),
('2024-01-17', 101300.00, 2100.00, 95000.00, 6300.00, 6.63),
('2024-01-18', 103800.00, 2500.00, 95000.00, 8800.00, 9.26),
('2024-01-19', 107125.00, 3325.00, 95000.00, 12125.00, 12.76);

-- Insert sample recommendations
INSERT INTO simple_recommendations (symbol, recommendation, reason, expires_at) VALUES
('AAPL', 'hold', 'Strong fundamentals, wait for better entry point', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('NVDA', 'buy', 'AI growth momentum continues', DATE_ADD(NOW(), INTERVAL 14 DAY)),
('MSFT', 'hold', 'Stable performer, good for long term', DATE_ADD(NOW(), INTERVAL 60 DAY)),
('TSLA', 'sell', 'Consider taking profits, high volatility', DATE_ADD(NOW(), INTERVAL 7 DAY)); 