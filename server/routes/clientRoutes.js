const express = require('express');
const router = express.Router();
const {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  getClientStats
} = require('../controllers/clientController');

// Client routes
router.route('/')
  .post(createClient)
  .get(getClients);

router.route('/stats')
  .get(getClientStats);

router.route('/:id')
  .get(getClient)
  .put(updateClient)
  .delete(deleteClient);

module.exports = router;
