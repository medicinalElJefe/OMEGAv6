import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {installCanonicalApiTransportR183} from './canonicalApiTransportR183';
import './index.css';
import './b036.css';
import './b037.css';
import './interfaceIntegrityR313.css';

installCanonicalApiTransportR183();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
