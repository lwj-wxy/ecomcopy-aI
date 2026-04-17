import { ref, watch } from 'vue';

const locale = ref('zh');

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
      if (saved) locale.value = saved;
    }
  };

  return {
    locale,
    setLocale,
    initLocale
  };
};
