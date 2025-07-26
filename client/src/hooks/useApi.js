import { useState, useCallback } from 'react';

export const useApi = (apiCall) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...params) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiCall(...params);
        setData(response.data);
        return { success: true, data: response.data };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || 'An unexpected error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  return { data, loading, error, execute };
};

export const useInfiniteScroll = (apiCall, params = {}) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const loadMore = useCallback(
    async (reset = false) => {
      if (loading) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const currentPage = reset ? 1 : page;
        const response = await apiCall({ ...params, page: currentPage });
        const newItems = response.data.data || [];
        
        setItems(prev => reset ? newItems : [...prev, ...newItems]);
        setTotal(response.data.total || 0);
        setHasMore(newItems.length > 0 && newItems.length === (params.limit || 10));
        
        if (!reset) {
          setPage(prev => prev + 1);
        } else {
          setPage(2);
        }
        
        return { success: true, data: response.data };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to load items';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [apiCall, page, params, loading]
  );

  const refresh = useCallback(() => {
    return loadMore(true);
  }, [loadMore]);

  return {
    items,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    refresh,
  };
};

export const useForm = (initialState, onSubmit) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (files ? files[0] : value),
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  const setFieldValue = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return {
    formData,
    errors,
    submitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFormData,
  };
};
