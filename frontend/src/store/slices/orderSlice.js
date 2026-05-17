import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export const placeOrder = createAsyncThunk('orders/place', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/orders', data);
    return res.data.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to place order');
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async () => {
  const res = await api.get('/orders/my-orders');
  return res.data.data.orders;
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (params = {}) => {
  const res = await api.get('/orders', { params });
  return res.data;
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/orders/${id}`);
    return res.data.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Cannot cancel order');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders:   [],
    allOrders:  [],
    pagination: null,
    loading:    false,
    placing:    false,
    error:      null
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(placeOrder.pending,    (s) => { s.placing = true; s.error = null; })
     .addCase(placeOrder.rejected,   (s, a) => { s.placing = false; toast.error(a.payload); })
     .addCase(placeOrder.fulfilled,  (s, a) => { s.placing = false; s.myOrders.unshift(a.payload); toast.success('Order placed!'); })
     .addCase(fetchMyOrders.pending,  (s) => { s.loading = true; })
     .addCase(fetchMyOrders.fulfilled, (s, a) => { s.loading = false; s.myOrders = a.payload; })
     .addCase(fetchMyOrders.rejected,  (s) => { s.loading = false; })
     .addCase(fetchAllOrders.pending,  (s) => { s.loading = true; })
     .addCase(fetchAllOrders.fulfilled, (s, a) => { s.loading = false; s.allOrders = a.payload.data; s.pagination = a.payload.pagination; })
     .addCase(cancelOrder.fulfilled,  (s, a) => {
       const idx = s.myOrders.findIndex(o => o._id === a.payload._id);
       if (idx >= 0) s.myOrders[idx] = a.payload;
       toast.success('Order cancelled');
     })
     .addCase(cancelOrder.rejected, (s, a) => { toast.error(a.payload); });
  }
});
export default orderSlice.reducer;
