import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/scss/style.scss';
import React from 'react';

import './lib/orderBridge';
import { createRoot } from 'react-dom/client';
import App from './App';
const el = document.getElementById('root');
createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
