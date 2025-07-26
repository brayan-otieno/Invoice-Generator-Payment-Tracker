const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Invoice = require('../models/Invoice');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Invoice API', () => {
  let testInvoiceId;

  test('should create a new invoice', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({
        client: 'Test Client',
        items: [
          { description: 'Test Item', quantity: 1, price: 100 }
        ],
        dueDate: new Date(),
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    testInvoiceId = res.body._id;
  });

  test('should get all invoices', async () => {
    const res = await request(app).get('/api/invoices');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test('should get a single invoice', async () => {
    const res = await request(app).get(`/api/invoices/${testInvoiceId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', testInvoiceId);
  });
});
