import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {installCanonicalApiTransportR183} from './canonicalApiTransportR183';
import './index.css';
import './b036.css';
import './b037.css';

installCanonicalApiTransportR183();
void import('./earthVisualEnhancerR277').then(m=>m.installEarthVisualEnhancerR277()).catch(()=>{});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
