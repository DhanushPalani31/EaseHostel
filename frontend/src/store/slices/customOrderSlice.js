// customOrderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export const submitCustomOrder = createAsyncThunk('customOrders/submit', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/custom-orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit');
  }
});

export const fetchMyCustomOrders = createAsyncThunk('customOrders/fetchMine', async () => {
  const res = await api.get('/custom-orders/my');
  return res.data.data.orders;
});

export const fetchAllCustomOrders = createAsyncThunk('customOrders/fetchAll', async (params = {}) => {
  const res = await api.get('/custom-orders', { params });
  return res.data;
});

export const cancelCustomOrder = createAsyncThunk('customOrders/cancel', async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/custom-orders/${id}`);
    return res.data.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Cannot cancel');
  }
});

const customOrderSlice = createSlice({
  name: 'customOrders',
  initialState: { myOrders: [], allOrders: [], pagination: null, loading: false, submitting: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(submitCustomOrder.pending,    (s) => { s.submitting = true; })
     .addCase(submitCustomOrder.rejected,  (s, a) => { s.submitting = false; toast.error(a.payload); })
     .addCase(submitCustomOrder.fulfilled, (s, a) => {
       s.submitting = false;
       s.myOrders.unshift(a.payload);
       toast.success('Custom order submitted! We\'ll review it shortly.');
     })
     .addCase(fetchMyCustomOrders.pending,  (s) => { s.loading = true; })
     .addCase(fetchMyCustomOrders.fulfilled,(s, a) => { s.loading = false; s.myOrders = a.payload; })
     .addCase(fetchMyCustomOrders.rejected, (s) => { s.loading = false; })
     .addCase(fetchAllCustomOrders.pending,  (s) => { s.loading = true; })
     .addCase(fetchAllCustomOrders.fulfilled,(s, a) => {
       s.loading = false; s.allOrders = a.payload.data; s.pagination = a.payload.pagination;
     })
     .addCase(cancelCustomOrder.fulfilled, (s, a) => {
       const idx = s.myOrders.findIndex(o => o._id === a.payload._id);
       if (idx >= 0) s.myOrders[idx] = a.payload;
       toast.success('Order cancelled');
     })
     .addCase(cancelCustomOrder.rejected, (_, a) => { toast.error(a.payload); });
  }
});
export const customOrderReducer = customOrderSlice.reducer;
