import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export const submitDelivery = createAsyncThunk('deliveries/submit', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/external-deliveries', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data.delivery;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit');
  }
});

export const fetchMyDeliveries = createAsyncThunk('deliveries/fetchMine', async () => {
  const res = await api.get('/external-deliveries/my');
  return res.data.data.deliveries;
});

export const fetchAllDeliveries = createAsyncThunk('deliveries/fetchAll', async (params = {}) => {
  const res = await api.get('/external-deliveries', { params });
  return res.data;
});

export const fetchDeliveryById = createAsyncThunk('deliveries/fetchOne', async (id) => {
  const res = await api.get(`/external-deliveries/${id}`);
  return res.data.data.delivery;
});

export const cancelDelivery = createAsyncThunk('deliveries/cancel', async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/external-deliveries/${id}`);
    return res.data.data.delivery;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Cannot cancel');
  }
});

const deliverySlice = createSlice({
  name: 'deliveries',
  initialState: {
    myDeliveries: [], allDeliveries: [], current: null,
    pagination: null, loading: false, submitting: false
  },
  reducers: {
    updateDeliveryRealtime: (state, action) => {
      const { deliveryId, status } = action.payload;
      const idx = state.myDeliveries.findIndex(d => d._id === deliveryId);
      if (idx >= 0) state.myDeliveries[idx].deliveryStatus = status;
      if (state.current?._id === deliveryId) state.current.deliveryStatus = status;
    }
  },
  extraReducers: (b) => {
    b.addCase(submitDelivery.pending,    (s) => { s.submitting = true; })
     .addCase(submitDelivery.rejected,  (s, a) => { s.submitting = false; toast.error(a.payload); })
     .addCase(submitDelivery.fulfilled, (s, a) => {
       s.submitting = false; s.myDeliveries.unshift(a.payload);
       toast.success('Pickup request submitted! 🎉');
     })
     .addCase(fetchMyDeliveries.pending,  (s) => { s.loading = true; })
     .addCase(fetchMyDeliveries.fulfilled,(s, a) => { s.loading = false; s.myDeliveries = a.payload; })
     .addCase(fetchMyDeliveries.rejected, (s) => { s.loading = false; })
     .addCase(fetchAllDeliveries.pending,  (s) => { s.loading = true; })
     .addCase(fetchAllDeliveries.fulfilled,(s, a) => {
       s.loading = false; s.allDeliveries = a.payload.data; s.pagination = a.payload.pagination;
     })
     .addCase(fetchDeliveryById.fulfilled, (s, a) => { s.current = a.payload; })
     .addCase(cancelDelivery.fulfilled, (s, a) => {
       const idx = s.myDeliveries.findIndex(d => d._id === a.payload._id);
       if (idx >= 0) s.myDeliveries[idx] = a.payload;
       toast.success('Pickup request cancelled');
     })
     .addCase(cancelDelivery.rejected, (_, a) => { toast.error(a.payload); });
  }
});

export const { updateDeliveryRealtime } = deliverySlice.actions;
export const deliveryReducer = deliverySlice.reducer;
