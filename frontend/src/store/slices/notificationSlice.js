// notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const res = await api.get('/notifications');
  return res.data.data;
});

export const markRead = createAsyncThunk('notifications/markRead', async (id) => {
  await api.patch(`/notifications/${id}/read`);
  return id;
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async () => {
  await api.patch('/notifications/read-all');
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, loading: false },
  reducers: {
    addRealtime: (state, action) => {
      state.items.unshift({ ...action.payload, _id: Date.now(), isRead: false, createdAt: new Date() });
      state.unreadCount += 1;
    }
  },
  extraReducers: (b) => {
    b.addCase(fetchNotifications.pending,   (s) => { s.loading = true; })
     .addCase(fetchNotifications.fulfilled, (s, a) => {
       s.loading     = false;
       s.items       = a.payload.notifications;
       s.unreadCount = a.payload.unreadCount;
     })
     .addCase(fetchNotifications.rejected,  (s) => { s.loading = false; })
     .addCase(markRead.fulfilled, (s, a) => {
       const n = s.items.find(i => i._id === a.payload);
       if (n && !n.isRead) { n.isRead = true; s.unreadCount = Math.max(0, s.unreadCount - 1); }
     })
     .addCase(markAllRead.fulfilled, (s) => {
       s.items.forEach(i => { i.isRead = true; });
       s.unreadCount = 0;
     });
  }
});
export const { addRealtime } = notificationSlice.actions;
export default notificationSlice.reducer;
