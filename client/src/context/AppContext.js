import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { invoiceApi, clientApi } from '../services/api';

// Initial state
const initialState = {
  invoices: [],
  clients: [],
  stats: {
    invoices: {},
    clients: {},
  },
  loading: false,
  error: null,
};

// Action types
const ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_INVOICES_SUCCESS: 'FETCH_INVOICES_SUCCESS',
  FETCH_CLIENTS_SUCCESS: 'FETCH_CLIENTS_SUCCESS',
  FETCH_STATS_SUCCESS: 'FETCH_STATS_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  RESET_ERROR: 'RESET_ERROR',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null };
    case ACTIONS.FETCH_INVOICES_SUCCESS:
      return { ...state, loading: false, invoices: action.payload };
    case ACTIONS.FETCH_CLIENTS_SUCCESS:
      return { ...state, loading: false, clients: action.payload };
    case ACTIONS.FETCH_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        stats: { ...state.stats, ...action.payload },
      };
    case ACTIONS.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case ACTIONS.RESET_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      const [invoicesRes, clientsRes, statsRes] = await Promise.all([
        invoiceApi.getAll(),
        clientApi.getAll(),
        invoiceApi.getStats(),
      ]);
      
      dispatch({
        type: ACTIONS.FETCH_INVOICES_SUCCESS,
        payload: invoicesRes.data.data || [],
      });
      
      dispatch({
        type: ACTIONS.FETCH_CLIENTS_SUCCESS,
        payload: clientsRes.data.data || [],
      });
      
      dispatch({
        type: ACTIONS.FETCH_STATS_SUCCESS,
        payload: { invoices: statsRes.data },
      });
    } catch (error) {
      dispatch({
        type: ACTIONS.FETCH_ERROR,
        payload: error.response?.data?.message || 'Failed to fetch data',
      });
    }
  };

  // Invoice actions
  const createInvoice = async (invoiceData) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      const response = await invoiceApi.create(invoiceData);
      await fetchInitialData(); // Refresh data
      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: ACTIONS.FETCH_ERROR,
        payload: error.response?.data?.message || 'Failed to create invoice',
      });
      return { success: false, error: error.response?.data };
    }
  };

  // Client actions
  const createClient = async (clientData) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      const response = await clientApi.create(clientData);
      await fetchInitialData(); // Refresh data
      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: ACTIONS.FETCH_ERROR,
        payload: error.response?.data?.message || 'Failed to create client',
      });
      return { success: false, error: error.response?.data };
    }
  };

  // Reset error
  const resetError = () => {
    dispatch({ type: ACTIONS.RESET_ERROR });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        createInvoice,
        createClient,
        resetError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
