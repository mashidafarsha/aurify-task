const express = require('express');
const router = express.Router();
const {
  createClient,
  getClients,
  getClientProfile,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createClient)
  .get(protect, getClients);

router.get('/:id/profile', protect, getClientProfile);

router.route('/:id')
  .put(protect, updateClient)
  .delete(protect, admin, deleteClient);

module.exports = router;
