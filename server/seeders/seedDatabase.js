require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const db = require('../config/db');

// Sample data
const sampleClients = [
  {
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Rd, New York, NY 10001, USA',
    taxId: '12-3456789',
    paymentTerms: 30,
  },
  {
    name: 'Tech Solutions Inc.',
    email: 'accounts@techsolutions.com',
    phone: '+1 (555) 234-5678',
    address: '456 Tech Park, San Francisco, CA 94107, USA',
    taxId: '98-7654321',
    paymentTerms: 15,
  },
  {
    name: 'Global Retail',
    email: 'finance@globalretail.com',
    phone: '+1 (555) 345-6789',
    address: '789 Market St, Chicago, IL 60606, USA',
    taxId: '45-6789123',
    paymentTerms: 45,
  },
];

const sampleInvoices = [
  {
    invoiceNumber: 'INV-2023-1001',
    client: null, // Will be set after clients are created
    issueDate: new Date('2023-10-01'),
    dueDate: new Date('2023-11-01'),
    status: 'paid',
    items: [
      {
        description: 'Web Development Services',
        quantity: 40,
        unitPrice: 75,
        taxRate: 0,
      },
      {
        description: 'UI/UX Design',
        quantity: 20,
        unitPrice: 100,
        taxRate: 0,
      },
    ],
    payments: [
      {
        amount: 5000,
        date: new Date('2023-10-15'),
        method: 'bank_transfer',
        reference: 'BANK-REF-001',
      },
    ],
    notes: 'Thank you for your business!',
    terms: 'Payment due within 30 days',
  },
  {
    invoiceNumber: 'INV-2023-1002',
    client: null, // Will be set after clients are created
    issueDate: new Date('2023-10-15'),
    dueDate: new Date('2023-11-15'),
    status: 'pending',
    items: [
      {
        description: 'Monthly Maintenance',
        quantity: 1,
        unitPrice: 1200,
        taxRate: 10,
      },
    ],
    payments: [],
    notes: 'Recurring maintenance services',
    terms: 'Payment due within 15 days',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await db.connect();
    
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Invoice.deleteMany({});
    await Client.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample clients
    const clients = await Client.insertMany(sampleClients);
    console.log(`Inserted ${clients.length} clients`);

    // Update invoices with client references
    const invoicesWithClients = sampleInvoices.map((invoice, index) => ({
      ...invoice,
      client: clients[index % clients.length]._id,
    }));

    // Insert sample invoices
    const invoices = await Invoice.insertMany(invoicesWithClients);
    console.log(`Inserted ${invoices.length} invoices`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
