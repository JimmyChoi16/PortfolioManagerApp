-- 重建数据库脚本 - 使用真实基金数据
-- 删除并重建数据库
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
    current_price DECIMAL(15, 2) DEFAULT 0, -- 设为0，让API更新
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
VALUES (0, 0, 0, 0);

-- 插入真实的基金数据 - 用户持有的基金
-- 1. Vanguard Total Stock Market Index Fund (VTSAX) - 指数基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VTSAX', 'Vanguard Total Stock Market Index Fund', 'fund', 150.25, 85.20, '2023-01-15', 92.45, 'Large Blend', 'Broad market exposure - core holding');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VTSAX', 'Vanguard Total Stock Market Index Fund', 'index', 'Large Blend', 0.04, 12.5, 18.2, 15.2, 12.8, 8.5, 5.2);

-- 2. Fidelity 500 Index Fund (FXAIX) - 指数基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('FXAIX', 'Fidelity 500 Index Fund', 'fund', 200.0, 78.90, '2023-03-20', 89.30, 'Large Blend', 'S&P 500 tracking fund');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'FXAIX', 'Fidelity 500 Index Fund', 'index', 'Large Blend', 0.015, 11.8, 17.5, 14.8, 12.1, 7.9, 4.8);

-- 3. American Funds Growth Fund (AGTHX) - 成长基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('AGTHX', 'American Funds Growth Fund of America', 'fund', 75.5, 45.60, '2023-06-10', 52.80, 'Large Growth', 'Growth focused fund');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'AGTHX', 'American Funds Growth Fund of America', 'growth', 'Large Growth', 0.64, 15.2, 22.1, 18.5, 16.2, 12.3, 8.7);

-- 4. Vanguard Total International Stock (VTIAX) - 国际基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VTIAX', 'Vanguard Total International Stock Index Fund', 'fund', 100.0, 32.40, '2023-02-28', 35.20, 'Foreign Large Blend', 'International diversification');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VTIAX', 'Vanguard Total International Stock Index Fund', 'international', 'Foreign Large Blend', 0.11, 8.7, 14.3, 16.8, 14.5, 9.2, 6.1);

-- 5. Vanguard Total Bond Market (VBMFX) - 债券基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VBMFX', 'Vanguard Total Bond Market Index Fund', 'fund', 300.0, 11.25, '2023-08-15', 11.25, 'Intermediate Core Bond', 'Fixed income allocation');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VBMFX', 'Vanguard Total Bond Market Index Fund', 'bond', 'Intermediate Core Bond', 0.15, 4.2, 6.8, 5.2, 4.8, 3.1, 2.5);

-- 6. Vanguard Information Technology ETF (VGT) - 行业基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VGT', 'Vanguard Information Technology ETF', 'fund', 25.0, 245.30, '2023-09-05', 245.30, 'Technology', 'Technology sector exposure');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VGT', 'Vanguard Information Technology ETF', 'sector', 'Technology', 0.10, 18.5, 25.3, 22.1, 19.8, 15.6, 12.4);

-- 7. Vanguard Real Estate ETF (VNQ) - 房地产基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VNQ', 'Vanguard Real Estate ETF', 'fund', 50.0, 85.60, '2023-11-12', 85.60, 'Real Estate', 'Real estate investment trust');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VNQ', 'Vanguard Real Estate ETF', 'real_estate', 'Real Estate', 0.12, 6.8, 12.5, 18.2, 16.8, 11.2, 8.9);

-- 8. Vanguard Health Care ETF (VHT) - 医疗保健基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VHT', 'Vanguard Health Care ETF', 'fund', 30.0, 245.80, '2023-07-20', 245.80, 'Health', 'Healthcare sector fund');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VHT', 'Vanguard Health Care ETF', 'sector', 'Health', 0.10, 9.8, 16.7, 14.2, 12.9, 9.8, 7.1);

-- 9. Vanguard Emerging Markets (VEMAX) - 新兴市场基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VEMAX', 'Vanguard Emerging Markets Stock Index Fund', 'fund', 80.0, 28.75, '2023-04-18', 28.75, 'Diversified Emerging Mkts', 'Emerging markets exposure');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VEMAX', 'Vanguard Emerging Markets Stock Index Fund', 'international', 'Diversified Emerging Mkts', 0.14, 5.4, 11.2, 24.8, 21.6, 16.9, 13.2);

-- 10. Fidelity Total Market Index (FSKAX) - 未持有的基金（用于搜索）
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('FSKAX', 'Fidelity Total Market Index Fund', 'fund', 0, 0, '2024-01-01', 95.60, 'Large Blend', 'Alternative to VTSAX');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'FSKAX', 'Fidelity Total Market Index Fund', 'index', 'Large Blend', 0.015, 13.1, 19.5, 15.8, 13.2, 8.9, 5.6);

-- 11. Schwab S&P 500 Index (SWPPX) - 未持有的基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('SWPPX', 'Schwab S&P 500 Index Fund', 'fund', 0, 0, '2024-01-01', 58.90, 'Large Blend', 'Low-cost S&P 500 fund');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'SWPPX', 'Schwab S&P 500 Index Fund', 'index', 'Large Blend', 0.02, 11.9, 17.6, 14.9, 12.2, 8.0, 4.9);

-- 12. T. Rowe Price Growth Stock (PRGFX) - 未持有的基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('PRGFX', 'T. Rowe Price Growth Stock Fund', 'fund', 0, 0, '2024-01-01', 67.20, 'Large Growth', 'Growth stock fund');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'PRGFX', 'T. Rowe Price Growth Stock Fund', 'growth', 'Large Growth', 0.65, 16.8, 23.5, 19.2, 17.1, 13.5, 9.8);

-- 13. Fidelity International Index (FSPSX) - 未持有的基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('FSPSX', 'Fidelity International Index Fund', 'fund', 0, 0, '2024-01-01', 42.15, 'Foreign Large Blend', 'International developed markets');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'FSPSX', 'Fidelity International Index Fund', 'international', 'Foreign Large Blend', 0.035, 9.2, 15.1, 17.2, 15.1, 10.3, 7.2);

-- 14. Vanguard Short-Term Bond (VBISX) - 未持有的基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('VBISX', 'Vanguard Short-Term Bond Index Fund', 'fund', 0, 0, '2024-01-01', 10.85, 'Short Government', 'Short-term bond fund');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'VBISX', 'Vanguard Short-Term Bond Index Fund', 'bond', 'Short Government', 0.07, 3.8, 5.2, 3.8, 3.2, 2.1, 1.5);

-- 15. Invesco QQQ Trust (QQQ) - 未持有的基金
INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES
('QQQ', 'Invesco QQQ Trust', 'fund', 0, 0, '2024-01-01', 385.20, 'Large Growth', 'NASDAQ-100 tracking ETF');
INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES
(LAST_INSERT_ID(), 'QQQ', 'Invesco QQQ Trust', 'index', 'Large Growth', 0.20, 20.5, 28.3, 24.1, 21.5, 17.8, 14.2);

-- Insert sample historical data
INSERT INTO portfolio_history (date, total_value, daily_change, total_cost, total_gain_loss, gain_loss_percent) VALUES
('2024-01-15', 98450.00, -1200.00, 95000.00, 3450.00, 3.63),
('2024-01-16', 99200.00, 750.00, 95000.00, 4200.00, 4.42),
('2024-01-17', 101300.00, 2100.00, 95000.00, 6300.00, 6.63),
('2024-01-18', 103800.00, 2500.00, 95000.00, 8800.00, 9.26),
('2024-01-19', 107125.00, 3325.00, 95000.00, 12125.00, 12.76)
ON DUPLICATE KEY UPDATE total_value=VALUES(total_value), total_cost=VALUES(total_cost), total_gain_loss=VALUES(total_gain_loss), gain_loss_percent=VALUES(gain_loss_percent);

-- Insert sample recommendations
INSERT INTO simple_recommendations (symbol, recommendation, reason, expires_at) VALUES
('VTSAX', 'hold', 'Core holding, maintain position', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('AGTHX', 'buy', 'Growth momentum continues', DATE_ADD(NOW(), INTERVAL 14 DAY)),
('VTIAX', 'hold', 'Good for international diversification', DATE_ADD(NOW(), INTERVAL 60 DAY)),
('VBMFX', 'buy', 'Good time to add bonds for stability', DATE_ADD(NOW(), INTERVAL 7 DAY));

-- 显示插入的数据
SELECT 'Holdings count:' as info, COUNT(*) as count FROM holdings WHERE type = 'fund'
UNION ALL
SELECT 'Funds count:', COUNT(*) FROM funds
UNION ALL
SELECT 'Total portfolio value:', SUM(quantity * current_price) FROM holdings WHERE type = 'fund'; 