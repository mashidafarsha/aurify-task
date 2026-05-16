const express = require('express');
const router = express.Router();
const {
  createTrade,
  getTrades,
  getTradeById,
  getActiveClients,
} = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

// Fixed: Dropdown route must come BEFORE dynamic :id route
router.get('/active-clients', protect, getActiveClients);

router.route('/')
  .post(protect, createTrade)
  .get(protect, getTrades);

router.route('/:id')
  .get(protect, getTradeById);

module.exports = router;
