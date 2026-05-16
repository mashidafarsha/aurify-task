const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  kycStatus: { type: String, enum: ['Verified', 'Pending', 'Rejected'], default: 'Pending' },
  metalPreference: {
    gold: { bought: { type: Number, default: 0 }, sold: { type: Number, default: 0 } },
    silver: { bought: { type: Number, default: 0 }, sold: { type: Number, default: 0 } },
    platinum: { bought: { type: Number, default: 0 }, sold: { type: Number, default: 0 } }
  },
  assignedTrader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', clientSchema);
