import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}) => {
  const res = await api.get('/products', { params });
  return res.data;
});

export const fetchProductById = createAsyncThunk('products/fetchOne', async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data.data.product;
});

export const fetchTrending = createAsyncThunk('products/trending', async () => {
  const res = await api.get('/products/trending');
  return res.data.data.products;
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items:      [],
    current:    null,
    trending:   [],
    pagination: null,
    loading:    false,
    error:      null
  },
  reducers: {
    clearCurrent: (state) => { state.current = null; }
  },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending,  (s) => { s.loading = true; s.error = null; })
     .addCase(fetchProducts.fulfilled, (s, a) => {
       s.loading    = false;
       s.items      = a.payload.data;
       s.pagination = a.payload.pagination;
     })
     .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
     .addCase(fetchProductById.pending,  (s) => { s.loading = true; })
     .addCase(fetchProductById.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
     .addCase(fetchProductById.rejected,  (s) => { s.loading = false; })
     .addCase(fetchTrending.fulfilled, (s, a) => { s.trending = a.payload; });
  }
});
export const { clearCurrent } = productSlice.actions;
export default productSlice.reducer;
