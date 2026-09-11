import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {installCanonicalApiTransportR183} from './canonicalApiTransportR183';
import {installEarthVisualEnhancerR277} from './earthVisualEnhancerR277';
import './index.css';
import './b036.css';
import './b037.css';

installCanonicalApiTransportR183();
installEarthVisualEnhancerR277();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
