
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Create a stable root element
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

// Create the React root using createRoot API
const root = ReactDOM.createRoot(rootElement)

// Render the app with proper StrictMode wrapper
root.render(
  <React.StrictMode>
    <App />
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
