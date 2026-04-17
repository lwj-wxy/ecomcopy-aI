<script setup lang="ts">
import { 
  ShoppingBag, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Star,
  Globe,
  ShieldCheck,
  MessageSquare
} from 'lucide-vue-next';
import { useLocale } from '~/composables/useLocale';
import { translations } from '~/lib/translations';

const { locale, initLocale } = useLocale();
const t = computed(() => translations[locale.value]);

onMounted(() => {
  initLocale();
});

const features = computed(() => [
  {
    title: t.value.landing.features.f1.title,
    description: t.value.landing.features.f1.description,
    icon: Globe
  },
  {
    title: t.value.landing.features.f2.title,
    description: t.value.landing.features.f2.description,
    icon: Zap
  },
  {
    title: t.value.landing.features.f3.title,
    description: t.value.landing.features.f3.description,
    icon: Sparkles
  }
]);

const faqs = computed(() => [
  {
    question: t.value.landing.faq.q1.q,
    answer: t.value.landing.faq.q1.a
  },
  {
    question: t.value.landing.faq.q2.q,
    answer: t.value.landing.faq.q2.a
  },
  {
    question: t.value.landing.faq.q3.q,
    answer: t.value.landing.faq.q3.a
  }
]);
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-gray-900">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center gap-2">
            <ShoppingBag class="h-6 w-6 text-primary" />
            <span class="text-xl font-bold tracking-tight">ListingCraft AI</span>
          </div>
          <div class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" class="hover:text-primary transition-colors">{{ t.landing.nav.features }}</a>
            <a href="#how-it-works" class="hover:text-primary transition-colors">{{ t.landing.nav.howItWorks }}</a>
            <a href="#faq" class="hover:text-primary transition-colors">{{ t.landing.nav.faq }}</a>
          </div>
          <div class="flex items-center gap-4">
            <LanguageSwitcher />
            <div class="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <NuxtLink to="/login" class="text-sm font-medium text-gray-600 hover:text-primary">{{ t.landing.nav.login }}</NuxtLink>
            <NuxtLink to="/login" class="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              {{ t.landing.nav.tryFree }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
          <Zap class="h-3 w-3" /> {{ t.landing.hero.badge }}
        </div>
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          {{ t.landing.hero.titlePart1 }}<br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">{{ t.landing.hero.titlePart2 }}</span>
        </h1>
        <p class="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          {{ t.landing.hero.subtitle }}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink to="/login" class="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
            {{ t.landing.hero.cta }} <ArrowRight class="h-5 w-5" />
          </NuxtLink>
        </div>

        <!-- Real-world Example Section -->
        <div class="mt-16 max-w-4xl mx-auto">
          <div class="grid md:grid-cols-2 gap-8 items-stretch">
            <!-- Before -->
            <div class="bg-gray-50 rounded-3xl p-6 text-left border border-gray-100 relative overflow-hidden">
              <div class="absolute top-0 right-0 bg-gray-200 text-gray-600 px-4 py-1 text-xs font-bold rounded-bl-xl uppercase">{{ t.landing.comparision.before }}</div>
              <h4 class="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">{{ t.landing.comparision.ordinary }}</h4>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-full"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                <p class="text-gray-400 text-sm italic">{{ t.landing.comparision.ordinaryContent }}</p>
              </div>
              <div class="mt-6 pt-6 border-t border-gray-200 flex items-center gap-2 text-gray-400 text-xs">
                <Star class="h-3 w-3 fill-current" /> {{ t.landing.comparision.lowConversion }}
              </div>
            </div>

            <!-- After -->
            <div class="bg-white rounded-3xl p-6 text-left border-2 border-primary shadow-2xl shadow-primary/10 relative overflow-hidden">
              <div class="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-xs font-bold rounded-bl-xl uppercase animate-pulse">{{ t.landing.comparision.after }}</div>
              <h4 class="text-sm font-bold text-primary mb-4 uppercase tracking-widest">{{ t.landing.comparision.winning }}</h4>
              <div class="space-y-3">
                <h5 class="font-bold text-gray-900 leading-tight">{{ t.landing.comparision.winningTitle }}</h5>
                <p class="text-gray-600 text-sm leading-relaxed">
                  {{ t.landing.comparision.winningContent }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded">{{ t.landing.comparision.tag1 }}</span>
                  <span class="px-2 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded">{{ t.landing.comparision.tag2 }}</span>
                </div>
              </div>
              <div class="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2 text-green-600 text-xs font-bold">
                <CheckCircle2 class="h-4 w-4" /> {{ t.landing.comparision.highConversion }}
              </div>
            </div>
          </div>
        </div>

        <!-- Hero Image Placeholder -->
        <div class="mt-20 relative max-w-5xl mx-auto">
          <div class="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-3xl opacity-30"></div>
          <div class="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <img src="https://picsum.photos/seed/dashboard/1200/800" alt="App Preview" class="w-full h-auto opacity-90" />
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold mb-4">{{ t.landing.features.title }}</h2>
          <p class="text-gray-500">{{ t.landing.features.subtitle }}</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.title" class="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
            <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <component :is="feature.icon" class="h-6 w-6" />
            </div>
            <h3 class="text-xl font-bold mb-3">{{ feature.title }}</h3>
            <p class="text-gray-500 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="py-24">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold mb-4">{{ t.landing.howItWorks.title }}</h2>
          <p class="text-gray-500">{{ t.landing.howItWorks.subtitle }}</p>
        </div>
        <div class="grid md:grid-cols-3 gap-12 relative">
          <!-- Connector Line (Desktop) -->
          <div class="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
          
          <div class="relative z-10 bg-white text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-xl shadow-primary/20">1</div>
            <h3 class="text-xl font-bold">{{ t.landing.howItWorks.s1.title }}</h3>
            <p class="text-gray-500">{{ t.landing.howItWorks.s1.description }}</p>
          </div>
          
          <div class="relative z-10 bg-white text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-xl shadow-primary/20">2</div>
            <h3 class="text-xl font-bold">{{ t.landing.howItWorks.s2.title }}</h3>
            <p class="text-gray-500">{{ t.landing.howItWorks.s2.description }}</p>
          </div>
          
          <div class="relative z-10 bg-white text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-xl shadow-primary/20">3</div>
            <h3 class="text-xl font-bold">{{ t.landing.howItWorks.s3.title }}</h3>
            <p class="text-gray-500">{{ t.landing.howItWorks.s3.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-24">
      <div class="max-w-3xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-16">{{ t.landing.faq.title }}</h2>
        <div class="space-y-6">
          <div v-for="faq in faqs" :key="faq.question" class="p-6 rounded-2xl border border-gray-100 bg-white">
            <h3 class="text-lg font-bold mb-2 flex items-center gap-2">
              <MessageSquare class="h-5 w-5 text-primary" />
              {{ faq.question }}
            </h3>
            <p class="text-gray-500 leading-relaxed">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <div class="flex items-center justify-center gap-2 mb-6">
          <ShoppingBag class="h-6 w-6 text-primary" />
          <span class="text-xl font-bold tracking-tight">ListingCraft AI</span>
        </div>
        <p class="text-gray-400 text-sm mb-8">{{ t.landing.footer.copy }}</p>
        <div class="flex justify-center gap-6 text-gray-500 text-sm">
          <a href="#" class="hover:text-white">{{ t.landing.footer.privacy }}</a>
          <a href="#" class="hover:text-white">{{ t.landing.footer.terms }}</a>
          <a href="#" class="hover:text-white">{{ t.landing.footer.contact }}</a>
        </div>
      </div>
    </footer>
  </div>
</template>
