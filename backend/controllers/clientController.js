const Client = require('../models/Client');
const Trade = require('../models/Trade');

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res) => {
  try {
    const { fullName, phone, email, kycStatus } = req.body;

    const client = await Client.create({
      fullName,
      phone,
      email,
      kycStatus: kycStatus || 'Pending',
      assignedTrader: req.user._id,
      // holdings default to 0 from schema
    });

    res.status(201).json(client);
  } catch (error) {
    console.error("Create Client Error:", error);
    res.status(400).json({ message: error.message || 'Failed to create client' });
  }
};

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
  try {
    const match = req.user.role === 'Trader' ? { assignedTrader: req.user._id } : {};
    const clients = await Client.find(match).populate('assignedTrader', 'name email').sort({ fullName: 1 });
    res.json(clients);
  } catch (error) {
    console.error("Get Clients Error:", error);
    res.status(500).json({ message: 'Server error fetching clients' });
  }
};

// @desc    Get client profile & history
// @route   GET /api/clients/:id/profile
// @access  Private
const getClientProfile = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('assignedTrader', 'name email');
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Fetch all trades for this client
    const trades = await Trade.find({ client: req.params.id })
      .populate('trader', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      client,
      trades
    });
  } catch (error) {
    console.error("Get Client Profile Error:", error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private/Admin
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    await client.deleteOne();
    res.json({ message: 'Client removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientProfile,
  updateClient,
  deleteClient,
};
