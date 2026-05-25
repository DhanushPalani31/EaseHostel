import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

// ─── Thunks ───────────────────────────────────────────────────────

export const fetchDashboardStats = createAsyncThunk('admin/dashboard', async () => {
  const res = await api.get('/analytics/dashboard');
  return res.data.data;
});

export const fetchAllUsers = createAsyncThunk('admin/users', async () => {
  const res = await api.get('/users');
  return res.data.data.users;
});

export const fetchAllCoupons = createAsyncThunk('admin/coupons', async () => {
  const res = await api.get('/coupons');
  return res.data.data.coupons;
});

export const toggleUserStatus = createAsyncThunk('admin/toggleUser', async (userId, { rejectWithValue }) => {
  try {
    await api.patch(`/users/${userId}/toggle`);
    return userId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

// ─── Slice ────────────────────────────────────────────────────────
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats:   null,
    users:   [],
    coupons: [],
    loading: false,
    error:   null
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDashboardStats.pending,   (s) => { s.loading = true; })
     .addCase(fetchDashboardStats.fulfilled, (s, a) => { s.loading = false; s.stats = a.payload; })
     .addCase(fetchDashboardStats.rejected,  (s, a) => { s.loading = false; s.error = a.error.message; })

     .addCase(fetchAllUsers.fulfilled, (s, a) => { s.users = a.payload; })
     .addCase(fetchAllCoupons.fulfilled, (s, a) => { s.coupons = a.payload; })

     .addCase(toggleUserStatus.fulfilled, (s, a) => {
       const user = s.users.find(u => u._id === a.payload);
       if (user) { user.isActive = !user.isActive; }
       toast.success('User status updated');
     })
     .addCase(toggleUserStatus.rejected, (_, a) => { toast.error(a.payload); });
  }
});

export default adminSlice.reducer;
