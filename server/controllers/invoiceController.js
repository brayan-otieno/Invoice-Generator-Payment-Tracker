const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = asyncHandler(async (req, res) => {
  const {
    client,
    items,
    taxRate = 0,
    dueDate,
    notes,
    terms
  } = req.body;

  // Check if client exists
  const clientExists = await Client.findById(client);
  if (!clientExists) {
    res.status(400);
    throw new Error('Client not found');
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.price;
    return sum + itemTotal;
  }, 0);

  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const invoice = await Invoice.create({
    client,
    items: items.map(item => ({
      ...item,
      total: item.quantity * item.price
    })),
    subtotal,
    taxRate,
    taxAmount,
    total,
    dueDate: new Date(dueDate),
    status: 'Draft',
    notes,
    terms
  });

  if (invoice) {
    res.status(201).json({
      success: true,
      data: invoice
    });
  } else {
    res.status(400);
    throw new Error('Invalid invoice data');
  }
});

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status,
    clientId,
    startDate,
    endDate,
    search = ''
  } = req.query;
  
  const query = {};
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by client
  if (clientId) {
    query.client = clientId;
  }
  
  // Filter by date range
  if (startDate || endDate) {
    query.issueDate = {};
    if (startDate) query.issueDate.$gte = new Date(startDate);
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.issueDate.$lte = endOfDay;
    }
  }
  
  // Search in invoice number, client name, or item descriptions
  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { 'client.name': { $regex: search, $options: 'i' } },
      { 'items.description': { $regex: search, $options: 'i' } }
    ];
  }
  
  const invoices = await Invoice.find(query)
    .populate('client', 'name email phone')
    .sort({ issueDate: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await Invoice.countDocuments(query);
  
  // Calculate summary stats
  const stats = await Invoice.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        totalPaid: { $sum: '$amountPaid' },
        totalOutstanding: { $sum: '$balance' }
      }
    }
  ]);
  
  const summary = stats[0] || {
    totalInvoices: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalOutstanding: 0
  };
  
  res.json({
    success: true,
    count: invoices.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    summary,
    data: invoices
  });
});

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('client')
    .lean();
  
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  
  res.json({
    success: true,
    data: invoice
  });
});

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = asyncHandler(async (req, res) => {
  const {
    client,
    items,
    taxRate,
    dueDate,
    status,
    notes,
    terms
  } = req.body;
  
  let invoice = await Invoice.findById(req.params.id);
  
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  
  // Check if client exists if being updated
  if (client) {
    const clientExists = await Client.findById(client);
    if (!clientExists) {
      res.status(400);
      throw new Error('Client not found');
    }
    invoice.client = client;
  }
  
  // Update items if provided
  if (items) {
    invoice.items = items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }));
  }
  
  // Update other fields if provided
  if (taxRate !== undefined) invoice.taxRate = taxRate;
  if (dueDate) invoice.dueDate = new Date(dueDate);
  if (status) invoice.status = status;
  if (notes !== undefined) invoice.notes = notes;
  if (terms !== undefined) invoice.terms = terms;
  
  // Save the invoice to trigger pre-save hooks for calculations
  invoice = await invoice.save();
  
  // Populate client data in the response
  invoice = await invoice.populate('client').execPopulate();
  
  res.json({
    success: true,
    data: invoice
  });
});

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  
  // Prevent deletion of paid invoices
  if (invoice.status === 'Paid') {
    res.status(400);
    throw new Error('Cannot delete a paid invoice');
  }
  
  await invoice.remove();
  
  res.json({
    success: true,
    data: {}
  });
});

// @desc    Record payment for an invoice
// @route   POST /api/invoices/:id/payments
// @access  Private
exports.recordPayment = asyncHandler(async (req, res) => {
  const { amount, date, method = 'Bank Transfer', reference } = req.body;
  
  if (amount <= 0) {
    res.status(400);
    throw new Error('Payment amount must be greater than zero');
  }
  
  const invoice = await Invoice.findById(req.params.id);
  
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  
  // Add payment
  invoice.payments.push({
    amount,
    date: date || new Date(),
    method,
    reference
  });
  
  // Update amount paid and balance
  invoice.amountPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
  invoice.balance = invoice.total - invoice.amountPaid;
  
  // Update status based on payment
  if (invoice.balance <= 0) {
    invoice.status = 'Paid';
  } else if (invoice.status === 'Draft') {
    invoice.status = 'Sent';
  }
  
  await invoice.save();
  
  res.status(201).json({
    success: true,
    data: invoice
  });
});

// @desc    Get invoice statistics
// @route   GET /api/invoices/stats
// @access  Private
exports.getInvoiceStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const match = {};
  
  // Add date range filter if provided
  if (startDate || endDate) {
    match.issueDate = {};
    if (startDate) match.issueDate.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.issueDate.$lte = end;
    }
  }
  
  const stats = await Invoice.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        totalPaid: { $sum: '$amountPaid' },
        totalOutstanding: { $sum: '$balance' },
        byStatus: {
          $push: {
            status: '$status',
            count: 1,
            amount: '$total',
            paid: '$amountPaid',
            outstanding: '$balance'
          }
        },
        byMonth: {
          $push: {
            month: { $month: '$issueDate' },
            year: { $year: '$issueDate' },
            amount: '$total',
            count: 1
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalInvoices: 1,
        totalAmount: 1,
        totalPaid: 1,
        totalOutstanding: 1,
        byStatus: {
          $arrayToObject: {
            $map: {
              input: {
                $reduce: {
                  input: '$byStatus',
                  initialValue: [],
                  in: {
                    $concatArrays: [
                      '$$value',
                      {
                        $cond: [
                          { $in: ['$$this.status', '$$value.status'] },
                          [],
                          ['$$this']
                        ]
                      }
                    ]
                  }
                }
              },
              as: 'status',
              in: {
                k: '$$status.status',
                v: {
                  count: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$byStatus',
                            as: 's',
                            cond: { $eq: ['$$s.status', '$$status.status'] }
                          }
                        },
                        as: 's',
                        in: '$$s.count'
                      }
                    }
                  },
                  amount: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$byStatus',
                            as: 's',
                            cond: { $eq: ['$$s.status', '$$status.status'] }
                          }
                        },
                        as: 's',
                        in: '$$s.amount'
                      }
                    }
                  },
                  paid: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$byStatus',
                            as: 's',
                            cond: { $eq: ['$$s.status', '$$status.status'] }
                          }
                        },
                        as: 's',
                        in: '$$s.paid'
                      }
                    }
                  },
                  outstanding: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$byStatus',
                            as: 's',
                            cond: { $eq: ['$$s.status', '$$status.status'] }
                          }
                        },
                        as: 's',
                        in: '$$s.outstanding'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        byMonth: {
          $arrayToObject: {
            $map: {
              input: {
                $reduce: {
                  input: '$byMonth',
                  initialValue: [],
                  in: {
                    $concatArrays: [
                      '$$value',
                      {
                        $cond: [
                          { $in: [{ month: '$$this.month', year: '$$this.year' }, '$$value.period'] },
                          [],
                          [{ month: '$$this.month', year: '$$this.year' }]
                        ]
                      }
                    ]
                  }
                }
              },
              as: 'period',
              in: {
                k: { $concat: [{ $toString: '$$period.year' }, '-', { $toString: '$$period.month' }] },
                v: {
                  count: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$byMonth',
                            as: 'm',
                            cond: {
                              $and: [
                                { $eq: ['$$m.month', '$$period.month'] },
                                { $eq: ['$$m.year', '$$period.year'] }
                              ]
                            }
                          }
                        },
                        as: 'm',
                        in: '$$m.count'
                      }
                    }
                  },
                  amount: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$byMonth',
                            as: 'm',
                            cond: {
                              $and: [
                                { $eq: ['$$m.month', '$$period.month'] },
                                { $eq: ['$$m.year', '$$period.year'] }
                              ]
                            }
                          }
                        },
                        as: 'm',
                        in: '$$m.amount'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]);
  
  res.json({
    success: true,
    data: stats[0] || {
      totalInvoices: 0,
      totalAmount: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      byStatus: {},
      byMonth: {}
    }
  });
});

// @desc    Send invoice email
// @route   POST /api/invoices/:id/send
// @access  Private
exports.sendInvoice = asyncHandler(async (req, res) => {
  const { email, subject, message } = req.body;
  
  const invoice = await Invoice.findById(req.params.id)
    .populate('client', 'name email')
    .lean();
  
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  
  // In a real application, you would send an email here
  // For now, we'll just update the status to 'Sent'
  await Invoice.updateOne(
    { _id: req.params.id, status: 'Draft' },
    { $set: { status: 'Sent', sentAt: new Date() } }
  );
  
  res.json({
    success: true,
    message: 'Invoice sent successfully',
    data: {
      to: email || invoice.client.email,
      subject: subject || `Invoice #${invoice.invoiceNumber}`,
      message: message || `Please find attached your invoice #${invoice.invoiceNumber}`
    }
  });
});

// @desc    Generate PDF for invoice
// @route   GET /api/invoices/:id/pdf
// @access  Private
exports.generatePDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('client')
    .lean();
  
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  
  // In a real application, you would generate a PDF here
  // For now, we'll return the invoice data
  res.json({
    success: true,
    message: 'PDF generated successfully',
    data: invoice
  });
});
