// lib/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app.title": "AI Chat Assistant",
      "sidebar.explore": "Explore Bots",
      "sidebar.chat": "My Chats",
      "sidebar.settings": "Settings",
      "sidebar.upgrade": "Upgrade Plan",
      "chat.placeholder": "Type your message...",
      "chat.hold_voice": "Hold to record voice",
      "chat.tokens": "Token usage",
      "chat.copy": "Copy",
      "chat.regenerate": "Regenerate",
      "chat.speak": "Speak",
      // Add more translations as needed
    },
  },
  ar: {
    translation: {
      "app.title": "مساعد دردشة الذكاء الاصطناعي",
      "sidebar.explore": "استكشاف الروبوتات",
      "sidebar.chat": "محادثاتي",
      "sidebar.settings": "الإعدادات",
      "sidebar.upgrade": "ترقية الخطة",
      "chat.placeholder": "اكتب رسالتك...",
      "chat.hold_voice": "اضغط للتسجيل الصوتي",
      "chat.tokens": "استخدام الرموز",
      "chat.copy": "نسخ",
      "chat.regenerate": "إعادة إنشاء",
      "chat.speak": "تحدث",
      // Add more translations as needed
    },
  },
  fr: {
    translation: {
      "app.title": "Assistant Chat IA",
      "sidebar.explore": "Explorer les Bots",
      "sidebar.chat": "Mes discussions",
      "sidebar.settings": "Paramètres",
      "sidebar.upgrade": "Améliorer l'abonnement",
      "chat.placeholder": "Tapez votre message...",
      "chat.hold_voice": "Maintenir pour enregistrer",
      "chat.tokens": "Utilisation des jetons",
      "chat.copy": "Copier",
      "chat.regenerate": "Régénérer",
      "chat.speak": "Parler",
      // Add more translations as needed
    },
  },
  // Add more languages as needed
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;