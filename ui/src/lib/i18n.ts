import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import ko from '../locales/ko.json';

const resources = {
  en: { translation: en },
  ko: { translation: ko },
};

// 브라우저 언어 또는 저장된 언어 가져오기
const getInitialLanguage = (): string => {
  const saved = localStorage.getItem('language');
  if (saved && ['en', 'ko'].includes(saved)) {
    return saved;
  }
  
  const browserLang = navigator.language.split('-')[0];
  return ['en', 'ko'].includes(browserLang) ? browserLang : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

// 언어 변경 함수
export const changeLanguage = (lang: string) => {
  localStorage.setItem('language', lang);
  i18n.changeLanguage(lang);
};

// 현재 언어 가져오기
export const getCurrentLanguage = () => i18n.language;

// 사용 가능한 언어 목록
export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
];

export default i18n;
