
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Declare the registration property on the Window interface
declare global {
  interface Window {
    registration?: ServiceWorkerRegistration;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.ts')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        window.registration = registration;
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
