import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar arquivos de tradução
import enTranslation from './locales/en.json';
import ptTranslation from './locales/pt.json';

i18n
  .use(initReactI18next) // Passa i18n para react-i18next
  .init({
    resources: {
      en: enTranslation,
      pt: ptTranslation,
    },
    lng: 'pt', // Forçando o idioma para português para depuração
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false, // React já escapa por padrão
    },
  });

export default i18n;
