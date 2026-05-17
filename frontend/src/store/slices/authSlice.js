import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

// ─── Async Thunks ─────────────────────────────────────────────────
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/profile');
    return res.data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

// ─── Slice ────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        JSON.parse(localStorage.getItem('he_user')) || null,
    accessToken: localStorage.getItem('he_token') || null,
    loading:     false,
    error:       null
  },
  reducers: {
    logout(state) {
      state.user        = null;
      state.accessToken = null;
      localStorage.removeItem('he_user');
      localStorage.removeItem('he_token');
      toast.success('Logged out successfully');
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => {
      state.loading = false;
      state.error   = action.payload;
      toast.error(action.payload);
    };

    builder
      // Register
      .addCase(registerUser.pending,  pending)
      .addCase(registerUser.rejected, rejected)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading     = false;
        state.user        = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem('he_user',  JSON.stringify(action.payload.user));
        localStorage.setItem('he_token', action.payload.accessToken);
        toast.success('Welcome to HostelEase! 🎉');
      })

      // Login
      .addCase(loginUser.pending,  pending)
      .addCase(loginUser.rejected, rejected)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading     = false;
        state.user        = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem('he_user',  JSON.stringify(action.payload.user));
        localStorage.setItem('he_token', action.payload.accessToken);
        toast.success(`Welcome back, ${action.payload.user.name}!`);
      })

      // Fetch Profile
      .addCase(fetchProfile.pending,  pending)
      .addCase(fetchProfile.rejected, (state) => { state.loading = false; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload;
        localStorage.setItem('he_user', JSON.stringify(action.payload));
      })

      // Update Profile
      .addCase(updateProfile.pending,  pending)
      .addCase(updateProfile.rejected, rejected)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload;
        localStorage.setItem('he_user', JSON.stringify(action.payload));
        toast.success('Profile updated');
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
