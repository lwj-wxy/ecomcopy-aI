<script setup lang="ts">
import { ShoppingBag, Loader2 } from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';
import { useLocale } from '~/composables/useLocale';
import { translations } from '~/lib/translations';

const { loginWithGoogle, logout } = useAuth();
const { locale } = useLocale();
const t = computed(() => translations[locale.value]);

const loading = ref(false);

const handleGoogleLogin = async () => {
  loading.value = true;
  try {
    await loginWithGoogle();
  } catch (error) {
    ElMessage.error(t.value.auth.failed);
  } finally {
    loading.value = false;
  }
};

const handleEmailLogin = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Failed to clear auth cookie before email login:', error);
  }

  try {
    await logout();
  } catch (error) {
    console.error('Failed to sign out firebase before email login:', error);
  }

  await navigateTo('/login', { external: true });
};
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
      <div class="p-8 text-center space-y-6">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-2">
          <ShoppingBag class="h-8 w-8" />
        </div>
        
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-gray-900">{{ t.auth.welcome }}</h2>
          <p class="text-gray-500 text-sm">{{ t.auth.subtitle }}</p>
        </div>

        <div class="space-y-3 pt-4">
          <button 
            @click="handleGoogleLogin"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-3 h-12 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 disabled:opacity-50"
          >
            <img v-if="!loading" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" />
            <Loader2 v-else class="h-5 w-5 animate-spin" />
            {{ loading ? t.auth.connecting : t.auth.google }}
          </button>
          
          <div class="relative py-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-white px-2 text-gray-400">{{ t.auth.or }}</span>
            </div>
          </div>

          <button 
            class="w-full h-12 px-6 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium"
            @click="handleEmailLogin"
          >
            {{ t.auth.email }}
          </button>
        </div>

        <p class="text-xs text-gray-400 pt-4">
          {{ t.auth.terms }}
        </p>
      </div>
    </div>
  </div>
</template>
