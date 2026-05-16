const Trade = require('../models/Trade');
const Client = require('../models/Client');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchUserTrades = req.user.role === 'Trader' ? { trader: req.user._id } : {};

    // 1. Today's Trade Metrics
    const todaysTrades = await Trade.find({
      ...matchUserTrades,
      createdAt: { $gte: today }
    });
    const todayTradeCount = todaysTrades.length;
    const todayTotalValue = todaysTrades.reduce((acc, trade) => acc + (trade.totalValue || 0), 0);

    // 2. Global Portfolio Count (Count ALL clients in system)
    const totalPortfolio = await Client.countDocuments({});

    // 3. Top Client Calculation
    const topClientAgg = await Trade.aggregate([
      { $match: matchUserTrades },
      { $group: { _id: '$client', cumulativeValue: { $sum: '$totalValue' } } },
      { $sort: { cumulativeValue: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'clients', localField: '_id', foreignField: '_id', as: 'clientInfo' } },
      { $unwind: { path: '$clientInfo', preserveNullAndEmptyArrays: true } }
    ]);

    const topClientName = topClientAgg.length > 0 && topClientAgg[0].clientInfo 
      ? topClientAgg[0].clientInfo.fullName 
      : 'None Yet';

    // JSON response with explicit keys
    res.status(200).json({
      success: true,
      todayTradeCount,
      todayTotalValue,
      topClientName,
      totalPortfolio // This must match frontend state
    });
  } catch (error) {
    console.error("CRITICAL DASHBOARD ERROR:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getDashboardSummary
};
