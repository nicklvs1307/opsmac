import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/shared/styles/global.css';
import App from './App';
import i18n from '@/shared/lib/i18n'; // Importar a configuração do i18n
import { I18nextProvider } from 'react-i18next';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();
