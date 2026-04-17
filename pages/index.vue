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

const features = [
  {
    title: '多平台优化',
    description: '针对 Etsy, Amazon, Shopify 等主流电商平台进行深度优化，确保文案符合平台 SEO 规则。',
    icon: Globe
  },
  {
    title: '高转化率标题',
    description: '利用 AI 分析数百万条爆款数据，为您生成点击率极高的产品标题。',
    icon: Zap
  },
  {
    title: '智能关键词提取',
    description: '自动提取产品核心卖点并转化为精准的 SEO 标签，提升搜索排名。',
    icon: Sparkles
  }
];

const faqs = [
  {
    question: 'ListingCraft AI 支持哪些语言？',
    answer: '目前我们支持中文、英文、日语、德语、法语等 20 多种主流语言的文案生成。'
  },
  {
    question: '生成的文案是否具有版权？',
    answer: '是的，AI 生成的文案完全归您所有，您可以自由用于商业用途。'
  },
  {
    question: '如何保证文案的独特性？',
    answer: '我们的模型会根据您提供的具体产品特征进行个性化创作，确保每一份文案都是独一无二的。'
  }
];
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
            <a href="#features" class="hover:text-primary transition-colors">功能特性</a>
            <a href="#how-it-works" class="hover:text-primary transition-colors">工作原理</a>
            <a href="#faq" class="hover:text-primary transition-colors">常见问题</a>
          </div>
          <div class="flex items-center gap-4">
            <NuxtLink to="/login" class="text-sm font-medium text-gray-600 hover:text-primary">登录</NuxtLink>
            <NuxtLink to="/login" class="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              免费试用
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
          <Zap class="h-3 w-3" /> 赋能全球电商卖家
        </div>
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          让您的产品在秒级内<br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">脱颖而出</span>
        </h1>
        <p class="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          专业的 AI 电商文案专家。只需输入产品特征，即可生成高转化率的标题、描述和 SEO 标签。
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink to="/login" class="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
            立即开始生产 <ArrowRight class="h-5 w-5" />
          </NuxtLink>
          <div class="flex items-center gap-2 text-sm text-gray-400">
            <ShieldCheck class="h-4 w-4" /> 无需信用卡，注册即送免费额度
          </div>
        </div>

        <!-- Real-world Example Section -->
        <div class="mt-16 max-w-4xl mx-auto">
          <div class="grid md:grid-cols-2 gap-8 items-stretch">
            <!-- Before -->
            <div class="bg-gray-50 rounded-3xl p-6 text-left border border-gray-100 relative overflow-hidden">
              <div class="absolute top-0 right-0 bg-gray-200 text-gray-600 px-4 py-1 text-xs font-bold rounded-bl-xl uppercase">优化前</div>
              <h4 class="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">普通文案</h4>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-full"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                <p class="text-gray-400 text-sm italic">"这是一款手工制作的陶瓷杯，蓝色，适合喝咖啡。质量很好，欢迎购买。"</p>
              </div>
              <div class="mt-6 pt-6 border-t border-gray-200 flex items-center gap-2 text-gray-400 text-xs">
                <Star class="h-3 w-3 fill-current" /> 转化率极低
              </div>
            </div>

            <!-- After -->
            <div class="bg-white rounded-3xl p-6 text-left border-2 border-primary shadow-2xl shadow-primary/10 relative overflow-hidden">
              <div class="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-xs font-bold rounded-bl-xl uppercase animate-pulse">AI 优化后</div>
              <h4 class="text-sm font-bold text-primary mb-4 uppercase tracking-widest">爆款文案</h4>
              <div class="space-y-3">
                <h5 class="font-bold text-gray-900 leading-tight">海洋之息：纯手工渐变蓝釉陶瓷咖啡杯 | 极简主义艺术礼品</h5>
                <p class="text-gray-600 text-sm leading-relaxed">
                  让清晨的第一口咖啡，沉浸在深邃的海洋色彩中。每一只杯子都由匠人历经 72 小时手工拉坯烧制，独特的流釉工艺确保您拥有世上独一无二的艺术品...
                </p>
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded">#手工艺术</span>
                  <span class="px-2 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded">#极简生活</span>
                </div>
              </div>
              <div class="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2 text-green-600 text-xs font-bold">
                <CheckCircle2 class="h-4 w-4" /> 转化率提升 300%+
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
          <h2 class="text-3xl font-bold mb-4">为什么选择 ListingCraft AI？</h2>
          <p class="text-gray-500">我们结合了最先进的 LLM 技术与电商营销心理学。</p>
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
          <h2 class="text-3xl font-bold mb-4">简单三步，开启爆款之路</h2>
          <p class="text-gray-500">无需复杂的指令，只需三步即可获得专业文案。</p>
        </div>
        <div class="grid md:grid-cols-3 gap-12 relative">
          <!-- Connector Line (Desktop) -->
          <div class="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
          
          <div class="relative z-10 bg-white text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-xl shadow-primary/20">1</div>
            <h3 class="text-xl font-bold">输入产品信息</h3>
            <p class="text-gray-500">填写您的产品名称、核心卖点以及目标受众。</p>
          </div>
          
          <div class="relative z-10 bg-white text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-xl shadow-primary/20">2</div>
            <h3 class="text-xl font-bold">AI 智能生成</h3>
            <p class="text-gray-500">Gemini AI 引擎根据平台算法实时生成多套文案方案。</p>
          </div>
          
          <div class="relative z-10 bg-white text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-xl shadow-primary/20">3</div>
            <h3 class="text-xl font-bold">一键复制发布</h3>
            <p class="text-gray-500">预览并微调文案，一键复制到您的店铺后台。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-24">
      <div class="max-w-3xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-16">常见问题解答</h2>
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
        <p class="text-gray-400 text-sm mb-8">© 2026 ListingCraft AI. 为全球电商卖家提供动力。</p>
        <div class="flex justify-center gap-6 text-gray-500 text-sm">
          <a href="#" class="hover:text-white">隐私政策</a>
          <a href="#" class="hover:text-white">服务条款</a>
          <a href="#" class="hover:text-white">联系我们</a>
        </div>
      </div>
    </footer>
  </div>
</template>
