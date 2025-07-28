const express = require('express');
const router = express.Router();
const yf = require('yahoo-finance2').default;

// GET real-time quote for symbol
router.get('/:symbol', async (req, res) => {
  try {
    const result = await yf.quote(req.params.symbol);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

module.exports = router;