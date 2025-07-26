import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import InvoiceList from '../InvoiceList';

const mockStore = configureStore([]);

describe('InvoiceList Component', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      invoice: {
        invoices: [
          {
            _id: '1',
            invoiceNumber: 'INV-001',
            client: 'Test Client',
            total: 100,
            status: 'pending',
            dueDate: new Date().toISOString(),
          },
        ],
        loading: false,
        error: null,
      },
    });
  });

  test('renders invoice list with data', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <InvoiceList />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('Test Client')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    store = mockStore({
      invoice: {
        invoices: [],
        loading: true,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <InvoiceList />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
