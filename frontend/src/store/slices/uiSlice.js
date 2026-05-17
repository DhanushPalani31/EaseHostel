import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen:   false,
    cartOpen:      false,
    searchOpen:    false,
    activeModal:   null,
    modalData:     null
  },
  reducers: {
    toggleSidebar:  (s) => { s.sidebarOpen = !s.sidebarOpen; },
    closeSidebar:   (s) => { s.sidebarOpen = false; },
    toggleCart:     (s) => { s.cartOpen = !s.cartOpen; },
    closeCart:      (s) => { s.cartOpen = false; },
    toggleSearch:   (s) => { s.searchOpen = !s.searchOpen; },
    closeSearch:    (s) => { s.searchOpen = false; },
    openModal:      (s, a) => { s.activeModal = a.payload.modal; s.modalData = a.payload.data || null; },
    closeModal:     (s) => { s.activeModal = null; s.modalData = null; }
  }
});
export const { toggleSidebar, closeSidebar, toggleCart, closeCart,
               toggleSearch, closeSearch, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
