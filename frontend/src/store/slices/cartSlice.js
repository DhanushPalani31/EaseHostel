// cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export const fetchCart    = createAsyncThunk('cart/fetch',   async () => (await api.get('/cart')).data.data.cart);
export const addToCart    = createAsyncThunk('cart/add',     async (data) => (await api.post('/cart', data)).data.data.cart);
export const updateItem   = createAsyncThunk('cart/update',  async ({ productId, quantity }) => (await api.put(`/cart/${productId}`, { quantity })).data.data.cart);
export const removeItem   = createAsyncThunk('cart/remove',  async (productId) => (await api.delete(`/cart/${productId}`)).data.data.cart);
export const clearCartAPI = createAsyncThunk('cart/clear',   async () => { await api.delete('/cart/clear'); return { items: [], totalPrice: 0 }; });

const cartSlice = createSlice({
  name: 'cart',
  initialState: { cart: null, loading: false },
  reducers: {},
  extraReducers: (b) => {
    const set = (state, action) => { state.loading = false; state.cart = action.payload; };
    b.addCase(fetchCart.pending,    (s) => { s.loading = true; })
     .addCase(fetchCart.fulfilled,  set)
     .addCase(fetchCart.rejected,   (s) => { s.loading = false; })
     .addCase(addToCart.fulfilled,  (s, a) => { set(s, a); toast.success('Added to cart'); })
     .addCase(removeItem.fulfilled, set)
     .addCase(updateItem.fulfilled, set)
     .addCase(clearCartAPI.fulfilled, set);
  }
});
export default cartSlice.reducer;
