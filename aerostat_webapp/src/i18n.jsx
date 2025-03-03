import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locals/en";
import ar from "./locals/ar";

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Initializes react-i18next
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: localStorage.getItem("language") || "en", // Default language
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

// Set direction dynamically
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng; // Set language attribute
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr"; // Set direction
  localStorage.setItem("language", lng); // Save language preference
});

export default i18n;
