const portfolioService = require('../services/portfolioService');

exports.createPortfolio = async (req, res) => {
  try {
    const { user_name, name, description, holdings } = req.body;
    // holdings: [{ holding_id, allocation_percent }]
    if (!user_name || !name || !Array.isArray(holdings) || holdings.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing or invalid parameters.' });
    }
    const result = await portfolioService.createPortfolio({ user_name, name, description, holdings });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 