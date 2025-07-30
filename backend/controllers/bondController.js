const { pool } = require('../config/database');

const bondController = {
  // Get all bonds with holding information
  async getAllBonds(req, res) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          b.id,
          b.holding_id,
          b.symbol,
          b.name,
          b.bond_type,
          b.coupon_rate,
          b.maturity_date,
          b.face_value,
          b.current_yield,
          b.credit_rating,
          b.issuer,
          b.callable,
          b.call_date,
          b.call_price,
          h.quantity,
          h.purchase_price,
          h.purchase_date,
          h.current_price,
          h.sector,
          h.notes
        FROM bonds b
        LEFT JOIN holdings h ON b.holding_id = h.id
        WHERE b.is_active = TRUE AND h.is_active = TRUE
        ORDER BY b.bond_type, b.maturity_date
      `);

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Error getting bonds:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bonds'
      });
    }
  },

  // Get bond by ID
  async getBondById(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(`
        SELECT 
          b.*,
          h.quantity,
          h.purchase_price,
          h.purchase_date,
          h.current_price,
          h.sector,
          h.notes
        FROM bonds b
        LEFT JOIN holdings h ON b.holding_id = h.id
        WHERE b.id = ? AND b.is_active = TRUE
      `, [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bond not found'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('Error getting bond:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bond'
      });
    }
  },

  // Create new bond
  async createBond(req, res) {
    try {
      console.log('Received request body:', req.body);
      
      const {
        symbol,
        name,
        bond_type,
        coupon_rate,
        maturity_date,
        face_value,
        current_yield,
        credit_rating,
        issuer,
        quantity,
        purchase_price,
        purchase_date,
        current_price,
        sector,
        notes
      } = req.body;

      console.log('Creating bond with data:', {
        symbol, name, bond_type, quantity, purchase_price, coupon_rate, maturity_date, face_value
      });

      // Validate required fields
      if (!symbol || !name || !bond_type || !quantity || !purchase_price || !coupon_rate || !maturity_date || !face_value) {
        console.log('Missing fields:', { symbol, name, bond_type, quantity, purchase_price, coupon_rate, maturity_date, face_value });
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // First create the holding record
      console.log('Inserting into holdings table with values:', [symbol, name, quantity, purchase_price, purchase_date, current_price, sector, notes]);
      
      const [holdingResult] = await pool.execute(`
        INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes)
        VALUES (?, ?, 'bond', ?, ?, ?, ?, ?, ?)
      `, [symbol, name, quantity, purchase_price, purchase_date, current_price, sector, notes]);

      const holdingId = holdingResult.insertId;
      console.log('Created holding with ID:', holdingId);

      // Then create the bond record
      console.log('Inserting into bonds table with values:', [holdingId, symbol, name, bond_type, coupon_rate, maturity_date, face_value, current_yield, credit_rating, issuer]);
      
      const [bondResult] = await pool.execute(`
        INSERT INTO bonds (holding_id, symbol, name, bond_type, coupon_rate, maturity_date, face_value, current_yield, credit_rating, issuer)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [holdingId, symbol, name, bond_type, coupon_rate, maturity_date, face_value, current_yield, credit_rating, issuer]);

      const bondId = bondResult.insertId;
      console.log('Created bond with ID:', bondId);

      res.status(201).json({
        success: true,
        message: 'Bond purchased successfully',
        data: { 
          id: bondId, 
          holding_id: holdingId,
          symbol,
          name,
          bond_type
        }
      });
    } catch (error) {
      console.error('Error creating bond:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create bond: ' + error.message
      });
    }
  },

  // Update bond
  async updateBond(req, res) {
    try {
      const { id } = req.params;
      const {
        symbol,
        name,
        bond_type,
        coupon_rate,
        maturity_date,
        face_value,
        current_yield,
        credit_rating,
        issuer,
        quantity,
        purchase_price,
        purchase_date,
        current_price,
        sector,
        notes
      } = req.body;

      // Get the holding_id for this bond
      const [bondRows] = await pool.execute(`
        SELECT holding_id FROM bonds WHERE id = ?
      `, [id]);

      if (bondRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bond not found'
        });
      }

      const holdingId = bondRows[0].holding_id;

      // Update the holding record
      await pool.execute(`
        UPDATE holdings 
        SET symbol = ?, name = ?, quantity = ?, purchase_price = ?, purchase_date = ?, 
            current_price = ?, sector = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [symbol, name, quantity, purchase_price, purchase_date, current_price, sector, notes, holdingId]);

      // Update the bond record
      await pool.execute(`
        UPDATE bonds 
        SET symbol = ?, name = ?, bond_type = ?, coupon_rate = ?, maturity_date = ?, 
            face_value = ?, current_yield = ?, credit_rating = ?, issuer = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [symbol, name, bond_type, coupon_rate, maturity_date, face_value, current_yield, credit_rating, issuer, id]);

      res.json({
        success: true,
        message: 'Bond updated successfully'
      });
    } catch (error) {
      console.error('Error updating bond:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update bond'
      });
    }
  },

  // Delete bond
  async deleteBond(req, res) {
    try {
      const { id } = req.params;

      // Get the holding_id for this bond
      const [bondRows] = await pool.execute(`
        SELECT holding_id FROM bonds WHERE id = ?
      `, [id]);

      if (bondRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bond not found'
        });
      }

      const holdingId = bondRows[0].holding_id;

      // Soft delete the bond
      await pool.execute(`
        UPDATE bonds SET is_active = FALSE WHERE id = ?
      `, [id]);

      // Soft delete the holding
      await pool.execute(`
        UPDATE holdings SET is_active = FALSE WHERE id = ?
      `, [holdingId]);

      res.json({
        success: true,
        message: 'Bond sold successfully'
      });
    } catch (error) {
      console.error('Error deleting bond:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sell bond'
      });
    }
  },

  // Get bond statistics by type
  async getBondStats(req, res) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          b.bond_type,
          COUNT(*) as count,
          AVG(b.coupon_rate) as avg_coupon_rate,
          AVG(b.current_yield) as avg_current_yield,
          AVG(DATEDIFF(b.maturity_date, CURDATE()) / 365.25) as avg_duration,
          SUM(h.quantity * h.current_price) as total_value
        FROM bonds b
        LEFT JOIN holdings h ON b.holding_id = h.id
        WHERE b.is_active = TRUE AND h.is_active = TRUE
        GROUP BY b.bond_type
      `);

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Error getting bond stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bond statistics'
      });
    }
  }
};

module.exports = bondController; 