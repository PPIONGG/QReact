import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import ไฟล์แปลภาษาของ host
import portalLoginTH from "./locales/portal/login/th.json";
import portalLoginEN from "./locales/portal/login/en.json";
import portalDashboardTH from "./locales/portal/dashboard/th.json";
import portalDashboardEN from "./locales/portal/dashboard/en.json";

// Import ไฟล์แปลภาษาของ remote
import salesVisitorTH from "./locales/QERPc/sales/sales-visitor/th.json";
import salesVisitorEN from "./locales/QERPc/sales/sales-visitor/en.json";

const resources = {
  th: {
    "portal-login": portalLoginTH,
    "portal-dashboard": portalDashboardTH,
    "sales-visitor": salesVisitorTH,
  },
  en: {
    "portal-login": portalLoginEN,
    "portal-dashboard": portalDashboardEN,
    "sales-visitor": salesVisitorEN,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "th",
    fallbackLng: "th",
    defaultNS: "common",
    ns: ["common", "portal-login", "portal-dashboard", "sales-visitor"],

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
