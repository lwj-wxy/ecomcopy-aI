<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Globe, ChevronDown, Check } from 'lucide-vue-next';
import { useLocale } from '~/composables/useLocale';

const { locale, setLocale } = useLocale();
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectLocale = (newLocale: 'zh' | 'en') => {
  setLocale(newLocale);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button 
      @click.stop="toggleDropdown"
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-border-theme hover:border-primary transition-all text-xs font-medium text-gray-600 shadow-sm"
    >
      <Globe class="h-3.5 w-3.5 text-gray-400" />
      <span>{{ locale === 'zh' ? '简体中文' : 'English' }}</span>
      <ChevronDown class="h-3 w-3 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-if="isOpen"
        class="absolute right-0 mt-2 w-32 bg-white border border-border-theme rounded-xl shadow-lg z-50 py-1.5 overflow-hidden"
      >
        <button 
          @click="selectLocale('zh')"
          class="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center justify-between transition-colors"
          :class="locale === 'zh' ? 'text-primary font-semibold' : 'text-gray-600'"
        >
          简体中文
          <Check v-if="locale === 'zh'" class="h-3 w-3" />
        </button>
        <button 
          @click="selectLocale('en')"
          class="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center justify-between transition-colors"
          :class="locale === 'en' ? 'text-primary font-semibold' : 'text-gray-600'"
        >
          English
          <Check v-if="locale === 'en'" class="h-3 w-3" />
        </button>
      </div>
    </Transition>
  </div>
</template>
