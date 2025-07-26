const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment,
  getInvoiceStats,
  sendInvoice,
  generatePDF
} = require('../controllers/invoiceController');

// Invoice routes
router.route('/')
  .post(createInvoice)
  .get(getInvoices);

router.route('/stats')
  .get(getInvoiceStats);

router.route('/:id')
  .get(getInvoice)
  .put(updateInvoice)
  .delete(deleteInvoice);

router.route('/:id/payments')
  .post(recordPayment);

router.route('/:id/send')
  .post(sendInvoice);

router.route('/:id/pdf')
  .get(generatePDF);

module.exports = router;
