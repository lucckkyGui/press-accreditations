
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Create root outside of the render call
const root = ReactDOM.createRoot(document.getElementById('root')!)

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
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
