import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './slices/authSlice.js';
import cartReducer         from './slices/cartSlice.js';
import productReducer      from './slices/productSlice.js';
import orderReducer        from './slices/orderSlice.js';
import notificationReducer from './slices/notificationSlice.js';
import uiReducer           from './slices/uiSlice.js';
import wishlistReducer     from './slices/wishlistSlice.js';
import adminReducer        from './slices/adminSlice.js';

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    cart:          cartReducer,
    products:      productReducer,
    orders:        orderReducer,
    notifications: notificationReducer,
    ui:            uiReducer,
    wishlist:      wishlistReducer,
    admin:         adminReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false })
});
