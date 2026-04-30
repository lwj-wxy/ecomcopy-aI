<script setup lang="ts">
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const loading = ref(true);
const errorMessage = ref('');

const transactionId = computed(() => {
  const raw = route.query._ptxn || route.query.ptxn;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && raw.length > 0) return raw[0];
  return '';
});

const paddleClientToken = computed(() => {
  return runtimeConfig.public.paddleClientToken as string | undefined;
});

const paddleEnv = computed(() => {
  return String(runtimeConfig.public.paddleEnv || '').toLowerCase();
});

const resolvedPaddleEnv = computed<'sandbox' | 'production'>(() => {
  if (paddleEnv.value === 'sandbox') return 'sandbox';
  if ((paddleClientToken.value || '').startsWith('test_')) return 'sandbox';
  return 'production';
});

declare global {
  interface Window {
    Paddle?: {
      Environment?: {
        set: (env: 'sandbox' | 'production') => void;
      };
      Initialize: (payload: Record<string, any>) => void;
      Checkout: {
        open: (payload: Record<string, any>) => void;
      };
    };
    __paddleInitialized?: boolean;
  }
}

function loadPaddleScript() {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timed out while loading Paddle.js.'));
    }, 12000);

    const done = (fn: () => void) => {
      clearTimeout(timeout);
      fn();
    };

    if (window.Paddle) {
      done(() => resolve());
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-paddle-sdk="v2"]');
    if (existingScript) {
      if (existingScript.dataset.loaded === 'true' && window.Paddle) {
        done(() => resolve());
        return;
      }
      existingScript.addEventListener('load', () => done(() => resolve()), { once: true });
      existingScript.addEventListener(
        'error',
        () => done(() => reject(new Error('Failed to load Paddle.js'))),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.dataset.paddleSdk = 'v2';
    script.onload = () => {
      script.dataset.loaded = 'true';
      done(() => resolve());
    };
    script.onerror = () => done(() => reject(new Error('Failed to load Paddle.js')));
    document.head.appendChild(script);
  });
}

onMounted(async () => {
  try {
    if (!transactionId.value) {
      throw new Error('Missing transaction id in URL.');
    }

    if (!paddleClientToken.value) {
      throw new Error('Missing NUXT_PUBLIC_PADDLE_CLIENT_TOKEN in environment.');
    }

    await loadPaddleScript();

    if (!window.Paddle) {
      throw new Error('Paddle.js loaded but Paddle object is missing.');
    }

    if (resolvedPaddleEnv.value === 'sandbox') {
      window.Paddle.Environment?.set?.('sandbox');
    }

    if (!window.__paddleInitialized) {
      window.Paddle.Initialize({
        token: paddleClientToken.value,
        eventCallback: (event: any) => {
          if (event?.name === 'checkout.completed') {
            navigateTo('/dashboard?status=success', { external: true });
          }
          if (event?.name === 'checkout.payment.failed' || event?.name === 'checkout.error') {
            errorMessage.value = 'Paddle checkout returned an error. Please retry.';
          }
        }
      });
      window.__paddleInitialized = true;
    }

    window.Paddle.Checkout.open({
      transactionId: transactionId.value,
      settings: {
        displayMode: 'overlay'
      }
    });
  } catch (error: any) {
    errorMessage.value = error?.message || 'Failed to open checkout.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
      <h1 class="text-xl font-bold text-gray-900">Opening checkout...</h1>
      <p class="text-sm text-gray-500">
        Please wait while we open Paddle checkout for your transaction.
      </p>

      <div v-if="loading" class="text-sm text-primary font-medium">
        Initializing payment...
      </div>

      <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
        {{ errorMessage }}
      </div>

      <div class="pt-2">
        <NuxtLink to="/pricing" class="text-sm font-medium text-primary hover:underline">
          Back to pricing
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
