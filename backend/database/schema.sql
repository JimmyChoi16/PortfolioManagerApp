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

-- Insert sample data tot 'holdings'
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (5, 'AAPL', 'Apple Inc.', 'stock', 100.000000, 150.00, '2023-01-15', 175.50, 'Technology', 'Core technology holding', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (6, 'NVDA', 'NVIDIA Corp.', 'stock', 50.000000, 400.00, '2023-02-10', 520.00, 'Technology', 'AI and gaming focus', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (7, 'MSFT', 'Microsoft Corp.', 'stock', 75.000000, 280.00, '2023-03-05', 420.00, 'Technology', 'Cloud and software leader', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (8, 'TSLA', 'Tesla Inc.', 'stock', 25.000000, 200.00, '2023-04-12', 250.00, 'Automotive', 'Electric vehicle pioneer', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (9, 'JPM', 'JPMorgan Chase & Co.', 'stock', 40.000000, 130.00, '2023-06-01', 145.00, 'Financials', 'Banking sector core holding', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (10, 'VTI', 'Vanguard Total Stock Market ETF', 'fund', 200.000000, 200.00, '2023-01-25', 245.00, 'ETF', 'Broad market exposure', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (11, 'SPY', 'SPDR S&P 500 ETF Trust', 'fund', 120.000000, 380.00, '2023-03-10', 500.00, 'ETF', 'US large cap exposure', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (12, 'ICBCFUND', 'ICBC Credit Bond Fund', 'fund', 1000.000000, 1.00, '2023-02-15', 1.18, 'Bond Fund', 'China bond fund', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (13, 'CSI500', 'CSI 500 Index Fund', 'fund', 300.000000, 3.60, '2023-04-01', 3.92, 'Index Fund', 'Mid cap Chinese equity', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (14, 'US10Y', 'US 10 Year Treasury', 'bond', 10000.000000, 99.80, '2023-01-20', 100.25, 'Government', 'Safe haven asset', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (15, 'BND', 'Vanguard Total Bond Market ETF', 'bond', 300.000000, 70.00, '2023-02-10', 72.00, 'Bond ETF', 'Diversified bonds', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (16, 'CNGB', 'China Govt Bond 2028', 'bond', 50000.000000, 98.50, '2023-03-10', 99.20, 'Government', 'RMB fixed income', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (17, 'USD', 'US Dollar Cash', 'cash', 20000.000000, 1.00, '2023-01-01', 1.00, 'Currency', 'USD liquidity', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (18, 'CNY', 'RMB Cash', 'cash', 50000.000000, 1.00, '2023-01-01', 1.00, 'Currency', 'CNY liquidity', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (19, 'HKD', 'HK Dollar Cash', 'cash', 20000.000000, 1.00, '2023-01-01', 1.00, 'Currency', 'HKD liquidity', 1, '2025-07-29 15:02:23', '2025-07-29 15:02:23');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (20, 'SH600519', 'Kweichow Moutai Co., Ltd.', 'stock', 10.000000, 1200.00, '2024-01-01', 1439.00, 'Consumer', 'Top liquor stock in China', 1, '2025-07-29 23:35:13', '2025-07-30 13:48:36');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (21, 'SH601318', 'Ping An Insurance (Group) Company of China, Ltd.', 'stock', 100.000000, 70.00, '2024-01-01', 59.49, 'Financials', 'Leading Chinese insurer', 1, '2025-07-29 23:35:13', '2025-07-29 23:35:13');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (22, 'SH600036', 'China Merchants Bank Co., Ltd.', 'stock', 120.000000, 50.00, '2024-01-01', 44.14, 'Financials', 'Top joint-stock commercial bank', 1, '2025-07-29 23:35:13', '2025-07-29 23:35:13');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (23, 'AAPL', 'Apple Inc.', 'stock', 10.000000, 211.27, '2025-07-30', 211.27, 'Technology', 'test adding', 0, '2025-07-30 11:24:42', '2025-07-30 14:12:10');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (26, 'SH600519', 'Kweichow Moutai Co., Ltd.', 'stock', 1.000000, 1445.65, '2025-07-30', 1445.64, 'Consumer', 'test creation', 1, '2025-07-30 14:13:16', '2025-07-30 14:13:16');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (27, 'AAPL', 'Apple Inc.', 'stock', 1.000000, 211.27, '2025-07-30', 211.27, 'Technology', 'test creation', 1, '2025-07-30 14:14:59', '2025-07-30 14:14:59');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (28, 'SH600519', 'Kweichow Moutai Co., Ltd.', 'stock', 1.000000, 1448.28, '2025-07-30', 1448.28, 'Consumer', 'test', 0, '2025-07-30 14:34:00', '2025-07-30 14:34:10');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (29, 'AAPL', 'Apple Inc.', 'stock', 10.000000, 211.27, '2025-07-30', 211.27, 'Technology', 'test', 0, '2025-07-30 15:29:14', '2025-07-30 15:29:30');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (31, 'xxx', 'xxx', 'bond', 10.000000, 10.00, '2025-07-30', 10.00, 'Government', '', 0, '2025-07-30 15:53:34', '2025-07-30 15:54:18');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (32, 'UST10Y', 'U.S. Treasury 10-Year', 'bond', 100.000000, 150.00, '2023-01-14', 175.50, 'Government', 'Core government holding', 1, '2025-07-30 16:10:42', '2025-07-30 16:10:42');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (33, 'AAPL5Y', 'Apple Inc. 5-Year', 'bond', 50.000000, 400.00, '2023-02-09', 520.00, 'Technology', 'Tech sector exposure', 1, '2025-07-30 16:10:42', '2025-07-30 16:10:42');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (34, 'CAMUNI7', 'California Muni 7-Year', 'bond', 75.000000, 280.00, '2023-03-04', 420.00, 'Municipal', 'Tax-advantaged income', 1, '2025-07-30 16:10:42', '2025-07-30 16:10:42');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (35, 'DEBUND5', 'German Bund 5-Year', 'bond', 25.000000, 200.00, '2023-04-11', 250.00, 'International', 'International diversification', 1, '2025-07-30 16:10:42', '2025-07-30 16:10:42');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (36, 'UST30Y', 'U.S. Treasury 30-Year', 'bond', 40.000000, 130.00, '2023-05-31', 145.00, 'Government', 'Long-term government bond', 1, '2025-07-30 16:10:42', '2025-07-30 16:10:42');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (37, 'MSFT7Y', 'Microsoft Corp. 7-Year', 'bond', 200.000000, 200.00, '2023-01-24', 245.00, 'Technology', 'Tech corporate bond', 1, '2025-07-30 16:10:42', '2025-07-30 16:10:42');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (38, 'AAPL', 'Apple Inc.', 'stock', 10.000000, 209.79, '2025-07-30', 209.76, 'Technology', 'test', 1, '2025-07-30 23:40:33', '2025-07-30 23:40:33');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (39, 'VOO', 'Vanguard S&P 500 ETF', 'fund', 62.225750, 184.62, '2022-12-03', 222.51, 'Large Blend', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (40, 'VUG', 'Vanguard Growth ETF', 'fund', 132.174304, 209.16, '2022-06-11', 192.36, 'Large Growth', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (41, 'VEA', 'Vanguard FTSE Developed Markets ETF', 'fund', 36.570519, 79.08, '2022-05-13', 87.70, 'Foreign Large Blend', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (42, 'BND', 'Vanguard Total Bond Market ETF', 'fund', 88.881524, 97.11, '2022-03-03', 143.83, 'Intermediate Core Bond', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (43, 'EEM', 'iShares MSCI Emerging Markets ETF', 'fund', 85.205068, 136.83, '2022-12-03', 161.12, 'Diversified Emerging Mkts', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (44, 'VNQ', 'Vanguard Real Estate ETF', 'fund', 99.684764, 133.55, '2022-11-08', 125.99, 'Real Estate', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (45, 'GLD', 'SPDR Gold Shares', 'fund', 179.206433, 48.28, '2022-11-06', 45.65, 'Precious Metals', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (46, 'QQQ', 'Invesco QQQ Trust', 'fund', 116.663813, 241.64, '2022-05-03', 305.17, 'Technology', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (47, 'XLE', 'Energy Select Sector SPDR ETF', 'fund', 132.444868, 81.79, '2022-04-26', 81.48, 'Energy', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (48, 'XLV', 'Health Care Select Sector SPDR ETF', 'fund', 75.778401, 77.26, '2022-09-09', 84.93, 'Health', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:29:50');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (49, 'GSG', 'iShares S&P GSCI CommodityIndexed Trust', 'fund', 146.893762, 181.31, '2022-07-24', 260.13, 'Commodities', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (50, 'TMF', 'ProShares Ultra 20+ Year Treasury', 'fund', 73.854704, 112.57, '2022-01-05', 128.64, 'Leveraged Bond', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (51, 'TQQQ', 'ProShares UltraPro QQQ', 'fund', 117.067443, 298.28, '2022-04-16', 384.75, 'Leveraged Equity', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');
INSERT INTO `holdings` (`id`, `symbol`, `name`, `type`, `quantity`, `purchase_price`, `purchase_date`, `current_price`, `sector`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES (52, 'VOO2', 'Vanguard S&P 500 ETF (alt)', 'fund', 172.516218, 95.66, '2022-06-17', 128.50, 'fund', NULL, 1, '2025-07-31 09:26:39', '2025-07-31 09:26:39');

-- Insert initial portfolio summary record
INSERT INTO portfolio_summary (total_value, daily_change, daily_change_percent, total_holdings) 
VALUES (125430.00, 7675.00, 7.72, 10) 
ON DUPLICATE KEY UPDATE id=id;

-- Insert sample holdings data (stocks)
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
('2024-01-19', 107125.00, 3325.00, 95000.00, 12125.00, 12.76)
ON DUPLICATE KEY UPDATE total_value=VALUES(total_value), total_cost=VALUES(total_cost), total_gain_loss=VALUES(total_gain_loss), gain_loss_percent=VALUES(gain_loss_percent);

-- Insert sample recommendations
INSERT INTO simple_recommendations (symbol, recommendation, reason, expires_at) VALUES
('AAPL', 'hold', 'Strong fundamentals, wait for better entry point', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('NVDA', 'buy', 'AI growth momentum continues', DATE_ADD(NOW(), INTERVAL 14 DAY)),
('MSFT', 'hold', 'Stable performer, good for long term', DATE_ADD(NOW(), INTERVAL 60 DAY)),
('TSLA', 'sell', 'Consider taking profits, high volatility', DATE_ADD(NOW(), INTERVAL 7 DAY));