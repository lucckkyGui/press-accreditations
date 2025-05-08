
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './hooks/useAuth'
import { BrowserRouter } from 'react-router-dom'
import { I18nProvider } from './hooks/useI18n'

// Create a stable root element
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

// Create the React root using createRoot API
const root = ReactDOM.createRoot(rootElement)

// Render the app with proper StrictMode wrapper
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/serviceWorker.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
