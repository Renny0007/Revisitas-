import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Manage Service Worker registration safely
if ('serviceWorker' in navigator) {
  const isProduction = Boolean((import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD);
  if (isProduction) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('PWA ServiceWorker registered in production:', registration.scope);
          registration.update();
        })
        .catch((error) => {
          console.warn('PWA ServiceWorker registration failed:', error);
        });
    });
  } else {
    // In development mode, unregister any stale service workers to prevent cached chunk errors
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

