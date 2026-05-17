import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { store } from './store/index.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#ffffff',
              color: '#161210',
              border: '1px solid #e8e4df',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 16px -4px rgb(0 0 0 / 0.12)'
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#ffffff' }
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#ffffff' }
            }
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
