const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  }
});

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0, 'Payment amount cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'Other'],
    default: 'Bank Transfer'
  },
  reference: {
    type: String,
    trim: true
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  items: [itemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Draft'
  },
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  },
  payments: [paymentSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate totals before saving
invoiceSchema.pre('save', function(next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  
  // Calculate tax amount
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  
  // Calculate total
  this.total = this.subtotal + this.taxAmount;
  
  // Calculate balance
  this.balance = this.total - this.amountPaid;
  
  // Update status based on balance and due date
  if (this.status !== 'Cancelled') {
    if (this.balance <= 0) {
      this.status = 'Paid';
    } else if (this.dueDate < new Date() && this.status !== 'Paid') {
      this.status = 'Overdue';
    } else if (this.status === 'Draft' && this.amountPaid > 0) {
      this.status = 'Sent';
    }
  }
  
  next();
});

// Generate invoice number before saving if not provided
invoiceSchema.pre('save', async function(next) {
  if (!this.isNew || this.invoiceNumber) return next();
  
  try {
    // Find the highest invoice number and increment it
    const highest = await this.constructor.findOne({}, 'invoiceNumber', {
      sort: { invoiceNumber: -1 }
    });
    
    let nextNumber = 1;
    if (highest && highest.invoiceNumber) {
      const lastNumber = parseInt(highest.invoiceNumber.replace(/\D/g, ''), 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    // Format as INV-0001, INV-0002, etc.
    this.invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

// Add a virtual for formatted due date
invoiceSchema.virtual('formattedDueDate').get(function() {
  return this.dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Add a virtual for formatted issue date
invoiceSchema.virtual('formattedIssueDate').get(function() {
  return this.issueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Add a static method to get invoice stats
invoiceSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$total' },
        balance: { $sum: '$balance' }
      }
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
        total: 1,
        balance: 1
      }
    }
  ]);
  
  return stats;
};

// Add text index for search
invoiceSchema.index({
  'invoiceNumber': 'text',
  'client.name': 'text',
  'items.description': 'text',
  'notes': 'text'
});

module.exports = mongoose.model('Invoice', invoiceSchema);
