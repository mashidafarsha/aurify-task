const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  tradeType: { type: String, enum: ['Buy', 'Sell'], required: true },
  metal: { type: String, enum: ['Gold', 'Silver', 'Platinum'], required: true },
  weightInGrams: { type: Number, required: true },
  pricePerGram: { type: Number, required: true, default: 400 },
  totalValue: { type: Number, required: true }, // Auto-calculated (weight * price)
  trader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', tradeSchema);
