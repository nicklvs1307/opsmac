import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar arquivos de tradução
import enTranslation from '@/locales/en.json';
import ptTranslation from '@/locales/pt.json';

i18n
  .use(LanguageDetector) // Detecta o idioma do navegador
  .use(initReactI18next) // Passa i18n para react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      pt: {
        translation: ptTranslation,
      },
    },
    // Fallback para o idioma se o detectado não estiver disponível
    fallbackLng: 'en',
    // Opções do LanguageDetector
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    // Idioma padrão se nenhum for detectado ou armazenado
    lng: 'pt', // Pode ser removido ou definido como undefined para depender totalmente do detector

    interpolation: {
      escapeValue: false, // React já escapa por padrão
    },
  });

export default i18n;
