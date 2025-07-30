-- Create database
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Bond table to store bond-specific information
CREATE TABLE IF NOT EXISTS bonds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    holding_id INT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    bond_type ENUM('government', 'corporate', 'municipal', 'international') NOT NULL,
    coupon_rate DECIMAL(5, 2) NOT NULL,
    maturity_date DATE NOT NULL,
    face_value DECIMAL(15, 2) NOT NULL,
    current_yield DECIMAL(5, 2) DEFAULT NULL,
    credit_rating VARCHAR(10) DEFAULT NULL,
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

-- Insert sample bond data
INSERT INTO bonds (holding_id, symbol, name, bond_type, coupon_rate, maturity_date, face_value, current_yield, credit_rating, issuer) VALUES
(5, 'UST10Y', 'U.S. Treasury 10-Year', 'government', 4.25, '2034-05-15', 50000.00, 4.28, 'AAA', 'U.S. Treasury'),
(6, 'AAPL5Y', 'Apple Inc. 5-Year', 'corporate', 3.85, '2029-03-15', 25000.00, 4.12, 'AA+', 'Apple Inc.'),
(7, 'CAMUNI7', 'California Muni 7-Year', 'municipal', 3.45, '2031-08-20', 30000.00, 3.52, 'AA', 'State of California'),
(8, 'DEBUND5', 'German Bund 5-Year', 'international', 2.15, '2029-12-10', 20000.00, 2.18, 'AAA', 'German Government');

-- Insert additional bond data for testing
INSERT INTO bonds (holding_id, symbol, name, bond_type, coupon_rate, maturity_date, face_value, current_yield, credit_rating, issuer) VALUES
(9, 'UST30Y', 'U.S. Treasury 30-Year', 'government', 3.75, '2053-01-15', 100000.00, 3.95, 'AAA', 'U.S. Treasury'),
(10, 'MSFT7Y', 'Microsoft Corp. 7-Year', 'corporate', 4.15, '2030-02-20', 75000.00, 4.05, 'AA+', 'Microsoft Corp.'),
(11, 'NYMUNI10', 'New York Municipal 10-Year', 'municipal', 3.25, '2033-03-10', 60000.00, 3.30, 'AA', 'City of New York'),
(12, 'UKGILT5', 'UK Government 5-Year Gilt', 'international', 2.85, '2028-04-05', 40000.00, 2.92, 'AAA', 'UK Government'); 