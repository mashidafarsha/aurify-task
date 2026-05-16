const Trade = require('../models/Trade');
const Client = require('../models/Client');

// @desc    Create new trade
// @route   POST /api/trades
// @access  Private
const createTrade = async (req, res) => {
  try {
    const { client, tradeType, metal, weightInGrams, pricePerGram } = req.body;
    const metalKey = metal.toLowerCase(); // 'gold', 'silver', 'platinum'

    // Fetch client to check/update metrics
    const clientDoc = await Client.findById(client);
    if (!clientDoc) return res.status(404).json({ message: 'Client not found' });

    // NEW: Legacy Data Migrator/Safety Check
    // If the client was created with the old string-based 'metalPreference', we MUST reset it to an object.
    if (typeof clientDoc.metalPreference !== 'object' || !clientDoc.metalPreference || !clientDoc.metalPreference.gold) {
      clientDoc.metalPreference = {
        gold: { bought: 0, sold: 0 },
        silver: { bought: 0, sold: 0 },
        platinum: { bought: 0, sold: 0 }
      };
      // Forcing Mongoose to recognize the type change
      clientDoc.markModified('metalPreference');
    }

    // Logic: Calculate current balance (Bought - Sold)
    const currentMetrics = clientDoc.metalPreference[metalKey];
    const currentBalance = (currentMetrics.bought || 0) - (currentMetrics.sold || 0);

    // Validation: Check for insufficient balance on 'Sell'
    if (tradeType === 'Sell') {
      if (currentBalance < Number(weightInGrams)) {
        return res.status(400).json({ 
          message: `Insufficient ${metal} balance.`, 
          details: `Current Balance: ${currentBalance}g (Total Bought: ${currentMetrics.bought || 0}g, Total Sold: ${currentMetrics.sold || 0}g)`
        });
      }
    }

    // Secure calculation on server
    const totalValue = Number(weightInGrams) * Number(pricePerGram);

    const trade = await Trade.create({
      client,
      tradeType,
      metal,
      weightInGrams,
      pricePerGram,
      totalValue,
      trader: req.user._id,
    });

    // Update cumulative metrics
    if (tradeType === 'Buy') {
      clientDoc.metalPreference[metalKey].bought = (clientDoc.metalPreference[metalKey].bought || 0) + Number(weightInGrams);
    } else {
      clientDoc.metalPreference[metalKey].sold = (clientDoc.metalPreference[metalKey].sold || 0) + Number(weightInGrams);
    }
    
    // Explicitly tell Mongoose that this nested object has changed
    clientDoc.markModified('metalPreference');
    await clientDoc.save();

    // Populate client details before returning
    const populatedTrade = await Trade.findById(trade._id)
      .populate('client', 'fullName email phone')
      .populate('trader', 'name email');

    res.status(201).json(populatedTrade);
  } catch (error) {
    console.error("Create Trade Error:", error);
    res.status(400).json({ message: error.message || 'Failed to create trade' });
  }
};

// @desc    Get all trades
// @route   GET /api/trades
// @access  Private
const getTrades = async (req, res) => {
  try {
    const match = req.user.role === 'Trader' ? { trader: req.user._id } : {};
    
    const trades = await Trade.find(match)
      .populate('client', 'fullName kycStatus')
      .populate('trader', 'name')
      .sort({ createdAt: -1 });

    res.json(trades);
  } catch (error) {
    console.error("Get Trades Error:", error);
    res.status(500).json({ message: 'Server error fetching trades' });
  }
};

// @desc    Get single trade
// @route   GET /api/trades/:id
// @access  Private
const getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate('client', 'fullName email phone')
      .populate('trader', 'name email');

    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    // RBAC: Trader can only view their own trades
    if (req.user.role === 'Trader' && trade.trader._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this trade' });
    }

    res.json(trade);
  } catch (error) {
    console.error("Get Trade Error:", error);
    res.status(500).json({ message: 'Server error fetching trade' });
  }
};

// @desc    Get all active clients for dropdown
// @route   GET /api/trades/active-clients
// @access  Private
const getActiveClients = async (req, res) => {
  try {
    const clients = await Client.find({}).select('_id fullName').sort({ fullName: 1 });
    res.status(200).json(clients);
  } catch (error) {
    console.error("Fetch Active Clients Error:", error);
    res.status(500).json({ message: "Error fetching clients for ledger", error: error.message });
  }
};

module.exports = {
  createTrade,
  getTrades,
  getTradeById,
  getActiveClients,
};
