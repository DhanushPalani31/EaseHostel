import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const res = await api.get('/wishlist');
  return res.data.data.wishlist;
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const res = await api.post('/wishlist', { productId });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchWishlist.pending,   (s) => { s.loading = true; })
     .addCase(fetchWishlist.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(fetchWishlist.rejected,  (s) => { s.loading = false; })
     .addCase(toggleWishlist.fulfilled, (s, a) => {
       toast.success(a.payload.added ? 'Added to wishlist' : 'Removed from wishlist');
     })
     .addCase(toggleWishlist.rejected, (_, a) => { toast.error(a.payload); });
  }
});
export default wishlistSlice.reducer;
