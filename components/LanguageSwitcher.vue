<script setup lang="ts">
import { Globe } from 'lucide-vue-next';
import { useLocale } from '~/composables/useLocale';

const { locale, setLocale } = useLocale();

const toggleLocale = () => {
  setLocale(locale.value === 'zh' ? 'en' : 'zh');
};
</script>

<template>
  <button 
    @click="toggleLocale"
    class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border-theme hover:border-primary transition-all text-xs font-medium text-gray-600 shadow-sm"
  >
    <Globe class="h-3.5 w-3.5" />
    <span>{{ locale === 'zh' ? 'English' : '简体中文' }}</span>
  </button>
</template>
