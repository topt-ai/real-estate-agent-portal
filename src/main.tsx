import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './lib/auth';
import { AGENT_CONFIG, BRAND_CONFIG } from './config';

// Apply per-client brand color and document title at boot.
document.documentElement.style.setProperty('--color-brand-accent', AGENT_CONFIG.primaryColor);
document.title = `${BRAND_CONFIG.name} — Portal de Agentes`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
