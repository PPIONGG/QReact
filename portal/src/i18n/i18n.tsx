import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import ไฟล์แปลภาษา
import portalLoginTH from './locales/portal/login/th.json';
import portalLoginEN from './locales/portal/login/en.json';
import portalDashboardTH from './locales/portal/dashboard/th.json';
import portalDashboardEN from './locales/portal/dashboard/en.json';

const resources = {
  th: {
    // common: commonTH,
    'portal-login': portalLoginTH,
    'portal-dashboard': portalDashboardTH,
  },
  en: {
    // common: commonEN,
    'portal-login': portalLoginEN,
    'portal-dashboard': portalDashboardEN,
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'th', // ภาษาเริ่มต้น
    fallbackLng: 'th',
    defaultNS: 'common',
    ns: ['common', 'portal-login', 'portal-dashboard'],

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;