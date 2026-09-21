import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from '@/lib/auth-provider';
import { initGTM } from '@/lib/gtm';

// Initialize Google Tag Manager if VITE_GTM_ID is provided
initGTM();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

// Register PWA service worker in production or supported environments
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[Azhai SW]: Registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[Azhai SW Registration Error]:', error);
      });
  });
}

