import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { HealthDataProvider } from './contexts/HealthDataContext';

import './styles/theme.css';
import './styles/index.css';

// Support production backend deployment (e.g. on Render) via VITE_API_BASE_URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
if (API_BASE) {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === 'string' && input.startsWith('/api')) {
      input = `${API_BASE.replace(/\/+$/, '')}${input}`;
    }
    return originalFetch(input, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <HealthDataProvider>
              <App />
            </HealthDataProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
