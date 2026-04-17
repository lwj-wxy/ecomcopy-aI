import { ref, watch } from 'vue';

const locale = ref('en');

export const useLocale = () => {
  const setLocale = (newLocale: string) => {
    locale.value = newLocale;
    if (process.client) {
      localStorage.setItem('user-locale', newLocale);
    }
  };

  const initLocale = () => {
    if (process.client) {
      const saved = localStorage.getItem('user-locale');
      if (saved) {
        locale.value = saved;
      } else {
        // Default to English for international audience
        locale.value = 'en';
      }
    }
  };

  return {
    locale,
    setLocale,
    initLocale
  };
};
