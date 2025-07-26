const Client = require('../models/Client');
const asyncHandler = require('express-async-handler');

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private
exports.createClient = asyncHandler(async (req, res) => {
  const { name, email, phone, address, taxId } = req.body;

  // Check if client with email already exists
  const clientExists = await Client.findOne({ email });
  if (clientExists) {
    res.status(400);
    throw new Error('Client with this email already exists');
  }

  const client = await Client.create({
    name,
    email,
    phone,
    address,
    taxId
  });

  if (client) {
    res.status(201).json({
      success: true,
      data: client
    });
  } else {
    res.status(400);
    throw new Error('Invalid client data');
  }
});

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
exports.getClients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } }
    ];
  }
  
  const clients = await Client.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await Client.countDocuments(query);
  
  res.json({
    success: true,
    count: clients.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: clients
  });
});

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id).lean();
  
  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }
  
  res.json({
    success: true,
    data: client
  });
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = asyncHandler(async (req, res) => {
  const { name, email, phone, address, taxId } = req.body;
  
  const client = await Client.findById(req.params.id);
  
  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }
  
  // Check if email is being updated and if it's already taken
  if (email && email !== client.email) {
    const emailExists = await Client.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }
  
  client.name = name || client.name;
  client.email = email || client.email;
  client.phone = phone || client.phone;
  client.address = address || client.address;
  client.taxId = taxId || client.taxId;
  
  const updatedClient = await client.save();
  
  res.json({
    success: true,
    data: updatedClient
  });
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  
  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }
  
  // Check if client has invoices
  const hasInvoices = await Invoice.exists({ client: client._id });
  if (hasInvoices) {
    res.status(400);
    throw new Error('Cannot delete client with existing invoices');
  }
  
  await client.remove();
  
  res.json({
    success: true,
    data: {}
  });
});

// @desc    Get client stats
// @route   GET /api/clients/stats
// @access  Private
exports.getClientStats = asyncHandler(async (req, res) => {
  const stats = await Client.aggregate([
    {
      $lookup: {
        from: 'invoices',
        localField: '_id',
        foreignField: 'client',
        as: 'invoices'
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        totalInvoices: { $size: '$invoices' },
        totalBilled: { $sum: '$invoices.total' },
        totalPaid: { $sum: '$invoices.amountPaid' },
        totalOutstanding: { $sum: '$invoices.balance' },
        lastInvoiceDate: { $max: '$invoices.issueDate' }
      }
    },
    {
      $sort: { totalOutstanding: -1 }
    }
  ]);
  
  res.json({
    success: true,
    count: stats.length,
    data: stats
  });
});
