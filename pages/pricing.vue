<script setup lang="ts">
import { Rocket, Gem, Check, ArrowRight, ShieldCheck, Zap, ArrowLeft } from 'lucide-vue-next';
import { onAuthStateChanged } from 'firebase/auth';

import { useLocale } from '~/composables/useLocale';
import { auth } from '~/lib/firebase';
import { translations } from '~/lib/translations';

const { locale, initLocale } = useLocale();
const t = computed(() => translations[locale.value]);

const currentUser = ref<{ uid: string; email: string | null } | null>(null);

onMounted(() => {
  initLocale();
  onAuthStateChanged(auth, (firebaseUser) => {
    currentUser.value = firebaseUser
      ? {
          uid: firebaseUser.uid,
          email: firebaseUser.email
        }
      : null;
  });
});

const router = useRouter();
const goBack = () => {
  router.back();
};

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  color: string;
}

const plans = computed<PricingPlan[]>(() => [
  {
    id: 'free',
    name: t.value.pricing.free.name,
    price: locale.value === 'zh' ? '¥0' : '$0',
    period: locale.value === 'zh' ? '/ 月' : '/ mo',
    description: t.value.pricing.free.desc,
    features: t.value.pricing.free.features,
    buttonText: t.value.pricing.current,
    color: 'gray'
  },
  {
    id: 'starter',
    name: t.value.pricing.starter.name,
    price: locale.value === 'zh' ? '¥69' : '$9.9',
    period: locale.value === 'zh' ? '/ 月' : '/ mo',
    description: t.value.pricing.starter.desc,
    features: t.value.pricing.starter.features,
    buttonText: t.value.pricing.upgrade,
    popular: true,
    color: 'primary'
  },
  {
    id: 'pro',
    name: t.value.pricing.pro.name,
    price: locale.value === 'zh' ? '¥199' : '$29.9',
    period: locale.value === 'zh' ? '/ 月' : '/ mo',
    description: t.value.pricing.pro.desc,
    features: t.value.pricing.pro.features,
    buttonText: t.value.pricing.subscribe,
    color: 'orange'
  }
]);

const checkoutLoading = ref<string | null>(null);

const handleSubscription = async (planId: string) => {
  if (planId === 'free') return;
  if (!currentUser.value) {
    ElMessage.warning(t.value.common.loginFirst || 'Please login first');
    navigateTo('/login');
    return;
  }
  
  checkoutLoading.value = planId;
  try {
    const res: any = await $fetch('/api/create-checkout', {
      method: 'POST',
      body: {
        planId,
        userId: currentUser.value.uid,
        email: currentUser.value.email
      }
    });
    
    if (res.url) {
      window.location.href = res.url;
    } else {
      throw new Error('无法创建支付会话');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '系统繁忙，请稍后再试');
  } finally {
    checkoutLoading.value = null;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] py-20 px-4 relative">
    <!-- Back Button -->
    <div class="fixed top-8 left-8 z-50">
      <button 
        @click="goBack"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-sm font-medium text-gray-600 group"
      >
        <ArrowLeft class="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        {{ t.common.back }}
      </button>
    </div>
    
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/10">
          <Zap class="h-3 w-3" /> 
          Pricing & Plans
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">{{ t.pricing.title }}</h1>
        <p class="text-gray-500 max-w-2xl mx-auto text-lg">
          {{ t.pricing.subtitle }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        <div 
          v-for="plan in plans" 
          :key="plan.id"
          class="relative bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col"
          :class="{'scale-105 border-primary ring-4 ring-primary/5 z-10': plan.popular}"
        >
          <!-- Special Badge -->
          <div v-if="plan.popular" class="absolute top-6 right-6">
            <span class="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest shadow-lg shadow-primary/20">{{ t.pricing.mostPopular }}</span>
          </div>

          <div class="mb-8">
            <div class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{{ plan.name }}</div>
            <div class="flex items-baseline gap-1 mb-4">
              <span class="text-4xl font-bold text-gray-900">{{ plan.price }}</span>
              <span class="text-gray-400 font-medium">{{ plan.period }}</span>
            </div>
            <p class="text-sm text-gray-500 leading-relaxed">{{ plan.description }}</p>
          </div>

          <div class="flex-1 space-y-4 mb-10">
            <div v-for="feature in plan.features" :key="feature" class="flex items-center gap-3">
              <div class="h-5 w-5 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Check class="h-3 w-3 text-primary" />
              </div>
              <span class="text-sm text-gray-600 font-medium">{{ feature }}</span>
            </div>
          </div>

          <button 
            @click="handleSubscription(plan.id)"
            :disabled="!!checkoutLoading || plan.id === 'free'"
            class="w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            :class="[
              plan.popular ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25' : 'bg-gray-900 text-white hover:bg-gray-800',
              {'opacity-50 cursor-not-allowed': !!checkoutLoading || plan.id === 'free'}
            ]"
          >
            <template v-if="checkoutLoading === plan.id">
              <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              {{ t.common.loading }}
            </template>
            <template v-else>
              {{ plan.buttonText }}
              <ArrowRight class="h-4 w-4" />
            </template>
          </button>
        </div>
      </div>

      <!-- Trust Footer -->
      <div class="mt-20 pt-12 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div class="flex flex-col items-center md:items-start gap-4">
          <div class="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <ShieldCheck class="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h4 class="font-bold text-gray-900 mb-1">{{ locale === 'zh' ? '支付加密保护' : 'Secure Payment' }}</h4>
            <p class="text-xs text-gray-400">{{ locale === 'zh' ? '所有交易通过 Stripe 银行级加密完成' : 'All transactions are encrypted with Stripe' }}</p>
          </div>
        </div>
        <div class="flex flex-col items-center md:items-start gap-4">
          <div class="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <Rocket class="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h4 class="font-bold text-gray-900 mb-1">{{ locale === 'zh' ? '即时开通' : 'Instant Access' }}</h4>
            <p class="text-xs text-gray-400">{{ locale === 'zh' ? '支付完成后 10 秒内自动生效' : 'Access granted within seconds after payment' }}</p>
          </div>
        </div>
        <div class="flex flex-col items-center md:items-start gap-4">
          <div class="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <Gem class="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h4 class="font-bold text-gray-900 mb-1">{{ locale === 'zh' ? '品质保证' : 'Quality Guaranteed' }}</h4>
            <p class="text-xs text-gray-400">{{ locale === 'zh' ? '致力于为您提供全网最高质量的电商 AI 建议' : 'Committed to providing high-quality AI e-commerce insights' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
