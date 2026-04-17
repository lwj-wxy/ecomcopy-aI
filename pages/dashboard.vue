<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

import { ref, onMounted, watch, computed } from 'vue';
import { 
  Sparkles, 
  ShoppingBag, 
  Loader2, 
  Copy, 
  Check,
  Zap,
  Gem,
  Globe,
  LogOut,
  User as UserIcon,
  History,
  Trash2,
  TrendingUp,
  Target,
  BarChart3,
  Search,
  ArrowRight,
  Info,
  RotateCcw,
  XCircle,
  Briefcase,
  Lock,
  ArrowUpCircle
} from 'lucide-vue-next';
// OpenAI moved to server-side for security and to avoid CORS
import { auth, db, handleFirestoreError, OperationType } from '~/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useLocale } from '~/composables/useLocale';
import { translations } from '~/lib/translations';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  limit,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc
} from 'firebase/firestore';

interface GeneratedResult {
  title: string;
  description: string;
  tags: string[];
  socialCopy: string;
}

interface KeywordItem {
  term: string;
  volume: string;
  competition: number;
  score: number;
  intent: string;
  reason: string;
}

interface KeywordCategory {
  name: string;
  keywords: KeywordItem[];
}

interface KeywordResult {
  summary: {
    total: number;
    avgCompetition: string;
    topRecommendation: string;
  };
  categories: KeywordCategory[];
}

interface CompetitorMetric {
  name: string;
  mine: number;
  competitor: number;
  comment: string;
}

interface CompetitorStrategy {
  title: string;
  action: string;
  impact: string;
}

interface CompetitorResult {
  comparison: {
    score: { mine: number; competitor: number };
    metrics: CompetitorMetric[];
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  strategies: CompetitorStrategy[];
}

interface MarketItem {
  category: string;
  searchVolume: number;
  growth: number;
}

interface MarketProduct {
  rank: number;
  name: string;
  price: string;
  sales: string;
  hotpoint: string;
  thumbnail: string;
}

interface MarketResearchResult {
  lastUpdate: string;
  platform: string;
  categories: MarketItem[];
  products: MarketProduct[];
  insights: string[];
}

const user = ref<any>(null);
const userProfile = ref<any>(null);
const authLoading = ref(true);

const { locale, setLocale, initLocale } = useLocale();
const t = computed(() => translations[locale.value]);
const router = useRouter();

const toneOptions = computed(() => [
  { value: 'professional', label: t.value.copywriting.tones.professional },
  { value: 'emotional', label: t.value.copywriting.tones.emotional },
  { value: 'premium', label: t.value.copywriting.tones.premium }
]);

// Watch locale changes to sync with Firestore
watch(locale, (newLocale) => {
  if (user.value && userProfile.value && userProfile.value.locale !== newLocale) {
    updateDoc(doc(db, 'users', user.value.uid), {
      locale: newLocale
    }).catch(e => console.error('Failed to sync locale to Firestore:', e));
  }
});

const PLAN_LIMITS: Record<string, number> = {
  'free': 5,
  'starter': 100,
  'pro': 999999
};

const PLAN_NAMES = computed<Record<string, string>>(() => ({
  'free': locale.value === 'zh' ? '免费版' : 'Free',
  'starter': locale.value === 'zh' ? '入门版' : 'Starter',
  'pro': locale.value === 'zh' ? '专业版' : 'Pro'
}));

const logout = async () => {
  try {
    await auth.signOut();
    await $fetch('/api/auth/logout', { method: 'POST' });
    navigateTo('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const loading = ref(false);
const result = ref<GeneratedResult | null>(null);
const copiedField = ref<string | null>(null);
const activeTab = ref('copywriting');
const historyList = ref<any[]>([]);
const keywordResult = ref<KeywordResult | null>(null);
const keywordLoading = ref(false);
const keywordSearchInput = ref('');
const keywordLanguage = ref('中文');

const competitorResult = ref<CompetitorResult | null>(null);
const competitorLoading = ref(false);
const competitorInput = ref({
  productName: '',
  competitorInfo: '',
  language: '中文'
});

const marketResearchResult = ref<MarketResearchResult | null>(null);
const marketLoading = ref(false);
const marketParams = ref({
  platform: 'Etsy',
  timeframe: '7',
  language: '中文'
});

const params = ref({
  platform: 'Etsy',
  productName: '',
  features: '',
  targetAudience: '年轻女性, 手工艺爱好者',
  tone: 'professional',
  language: '中文'
});

const fetchHistory = () => {
  if (!user.value) return;
  let unsubscribe: (() => void) | null = null;
  try {
    const q = query(
      collection(db, 'listings'),
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    unsubscribe = onSnapshot(q, (snapshot) => {
      historyList.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.error('[Auth Safe Guard] Permission denied for listings. Unsubscribing history listener.');
        if (unsubscribe) unsubscribe();
      }
      handleFirestoreError(error, OperationType.LIST, 'listings');
    });
  } catch (error) {
    console.error('Error setting up history listener:', error);
  }
};

const deleteHistoryItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'listings', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `listings/${id}`);
  }
};

const fetchUserProfile = () => {
  if (!user.value) return;
  let unsubscribe: (() => void) | null = null;
  try {
    unsubscribe = onSnapshot(doc(db, 'users', user.value.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Force Pro plan for specific admin email
        if (user.value.email === '807301075@qq.com' || user.value.email === 'lwjwxy132308@gmail.com') {
          data.plan = 'pro';
        }

        // Sync locale from Firestore to local
        if (data.locale && data.locale !== locale.value) {
          setLocale(data.locale);
        }

        userProfile.value = data;
        
        if (!data.plan || data.usage === undefined || !data.locale) {
          updateDoc(doc(db, 'users', user.value.uid), {
            plan: data.plan || 'free',
            usage: data.usage ?? 0,
            locale: data.locale || locale.value
          }).catch(() => {});
        }
      } else {
        const defaultProfile = {
          uid: user.value.uid,
          email: user.value.email,
          name: user.value.displayName || '用户',
          role: 'user',
          plan: (user.value.email === '807301075@qq.com' || user.value.email === 'lwjwxy132308@gmail.com') ? 'pro' : 'free',
          usage: 0,
          locale: locale.value,
          createdAt: serverTimestamp()
        };
        setDoc(doc(db, 'users', user.value.uid), defaultProfile).catch(() => {});
        userProfile.value = defaultProfile;
      }
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.error('[Auth Safe Guard] Permission denied for user profile. Unsubscribing.');
        if (unsubscribe) unsubscribe();
      }
      handleFirestoreError(error, OperationType.GET, `users/${user.value.uid}`);
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};

onMounted(() => {
  initLocale();
  // Handle Mock Payment Success
  const route = useRoute();
    if (route.query.status === 'success' && route.query.mock_plan) {
    const newPlan = route.query.mock_plan as string;
    if (user.value) {
      updateDoc(doc(db, 'users', user.value.uid), {
        plan: newPlan,
        usage: 0 // Reset usage on upgrade for demo
      }).then(() => {
        ElNotification({
          title: t.value.common.upgradeSuccessTitle,
          message: t.value.common.upgradeSuccessMsg,
          type: 'success',
          duration: 5000
        });
        // Clear query params
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }

  onAuthStateChanged(auth, (firebaseUser) => {
    authLoading.value = false;
    if (firebaseUser) {
      user.value = {
        displayName: firebaseUser.displayName || '用户',
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        photoURL: firebaseUser.photoURL
      };
      fetchHistory();
      fetchUserProfile();
    } else {
      user.value = null;
      userProfile.value = null;
      console.log('Firebase auth state: null');
    }
  });
});

const fillExample = (example: any) => {
  params.value.productName = example.name;
  params.value.features = example.features;
  params.value.targetAudience = example.audience;
};

const showUsageLimitDialog = () => {
  const currentPlan = userProfile.value?.plan || 'free';
  const currentUsage = userProfile.value?.usage || 0;
  const limit = PLAN_LIMITS[currentPlan];
  const planName = PLAN_NAMES.value[currentPlan];

  ElMessageBox.confirm(
    t.value.common.usageLimitDesc
      .replace('{plan}', planName)
      .replace('{usage}', currentUsage.toString())
      .replace('{limit}', limit.toString()),
    t.value.common.usageLimitTitle,
    {
      confirmButtonText: t.value.common.upgradeNow,
      cancelButtonText: t.value.common.cancel,
      type: 'warning',
    }
  ).then(() => {
    navigateTo('/pricing');
  }).catch(() => {});
};

const handleGenerate = async () => {
  if (!user.value) {
    ElMessage.warning(t.value.common.loginFirst);
    return;
  }
  
  if (!params.value.productName || !params.value.features) {
    ElMessage.warning(t.value.common.missingParams);
    return;
  }

  // Restore usage limit check
  const currentPlan = userProfile.value?.plan || 'free';
  const currentUsage = userProfile.value?.usage || 0;
  const limit = PLAN_LIMITS[currentPlan];

  if (currentUsage >= limit) {
    showUsageLimitDialog();
    return;
  }

  loading.value = true;
  result.value = null; 
  
  let drainTimer: any = null;
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: params.value.platform,
        productName: params.value.productName,
        features: params.value.features,
        targetAudience: params.value.targetAudience,
        tone: params.value.tone,
        language: params.value.language
      })
    });

    if (!response.ok) throw new Error('网络请求失败');
    if (!response.body) throw new Error('未获取到数据流');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let accumulatedContent = '';
    let revealedContent = '';

    result.value = { title: '', description: '', tags: [], socialCopy: '' };

    const updateResultFromText = (text: string) => {
      const extract = (key: string) => {
        const regex = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`, 'i');
        const match = text.match(regex);
        return match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';
      };
      const tagsMatch = text.match(/"tags"\s*:\s*\[([^\]]*)/i);
      let tags: string[] = [];
      if (tagsMatch) {
        tags = tagsMatch[1].split(',').map(t => t.replace(/["\s]/g, '')).filter(t => t.length > 0);
      }
      result.value = {
        title: extract('title'),
        description: extract('description'),
        socialCopy: extract('socialCopy'),
        tags: tags
      };
    };

    drainTimer = setInterval(() => {
      if (revealedContent.length < accumulatedContent.length) {
        // Speed up if we are far behind to look responsive
        const diff = accumulatedContent.length - revealedContent.length;
        const step = diff > 100 ? 15 : (diff > 20 ? 8 : 3);
        revealedContent += accumulatedContent.slice(revealedContent.length, revealedContent.length + step);
        updateResultFromText(revealedContent);
      }
    }, 40);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      accumulatedText += decoder.decode(value, { stream: true });
      const lines = accumulatedText.split('\n');
      accumulatedText = lines.pop() || ''; 

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
        if (trimmedLine.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmedLine.slice(6));
            accumulatedContent += (parsed.choices?.[0]?.delta?.content || '');
          } catch (e) { }
        }
      }
    }

    // Final catch-up
    while (revealedContent.length < accumulatedContent.length) {
      await new Promise(r => setTimeout(r, 100));
    }
    
    // Final UI update to ensure any leftover formatting is perfect
    updateResultFromText(accumulatedContent);

    // Save to Firestore - wrapped in a separate try/catch so it doesn't break the UI
    try {
      if (result.value && result.value.title) {
        await addDoc(collection(db, 'listings'), {
          userId: user.value.uid,
          platform: params.value.platform,
          productName: params.value.productName,
          features: params.value.features,
          title: result.value.title,
          description: result.value.description,
          tags: result.value.tags.join(', '),
          socialCopy: result.value.socialCopy,
          createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, 'users', user.value.uid), {
          usage: increment(1)
        });
        
        ElMessage.success(t.value.common.saveSuccess);
      }
    } catch (dbError: any) {
      handleFirestoreError(dbError, OperationType.CREATE, 'listings');
    }

  } catch (err: any) {
    console.error('Generation failure:', err);
    ElMessage.error(t.value.common.errorPrefix + (err.message || t.value.common.systemError));
  } finally {
    if (drainTimer) clearInterval(drainTimer);
    loading.value = false;
  }
};

const handleGenerateKeywords = async () => {
  if (!user.value) {
    ElMessage.warning(t.value.common.loginFirst);
    return;
  }
  
  if (!keywordSearchInput.value) {
    ElMessage.warning(t.value.common.missingParams);
    return;
  }

  const currentPlan = userProfile.value?.plan || 'free';
  if ((userProfile.value?.usage || 0) >= PLAN_LIMITS[currentPlan]) {
    showUsageLimitDialog();
    return;
  }

  keywordLoading.value = true;
  keywordResult.value = null;

  try {
    const response = await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        productName: keywordSearchInput.value,
        language: keywordLanguage.value
      })
    });

    if (!response.ok) throw new Error('网络请求失败');
    if (!response.body) throw new Error('未获取到数据流');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      accumulatedText += decoder.decode(value, { stream: true });
      const lines = accumulatedText.split('\n');
      accumulatedText = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
        if (trimmedLine.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmedLine.slice(6));
            fullContent += (data.choices?.[0]?.delta?.content || '');
            
            // Attempt a loose parse to show early results if possible
            // But for Keywords, let's just wait or do a very simple check
          } catch (e) {}
        }
      }
    }

    if (fullContent) {
      try {
        keywordResult.value = JSON.parse(fullContent);
        
        // Count as one usage
        await updateDoc(doc(db, 'users', user.value.uid), {
          usage: increment(1)
        });
      } catch (parseError) {
        // Fallback: try to find the JSON block if AI added conversational text
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          keywordResult.value = JSON.parse(jsonMatch[0]);
        }
      }
    }
  } catch (err: any) {
    console.error('Keyword generation failure:', err);
    ElMessage.error('发生错误: ' + (err.message || '系统繁忙'));
  } finally {
    keywordLoading.value = false;
  }
};

const handleAnalyzeCompetitor = async () => {
  if (!user.value) {
    ElMessage.warning(t.value.common.loginFirst);
    return;
  }
  
  if (!competitorInput.value.productName || !competitorInput.value.competitorInfo) {
    ElMessage.warning(t.value.common.missingParams);
    return;
  }

  const currentPlan = userProfile.value?.plan || 'free';
  if ((userProfile.value?.usage || 0) >= PLAN_LIMITS[currentPlan]) {
    showUsageLimitDialog();
    return;
  }

  competitorLoading.value = true;
  competitorResult.value = null;

  try {
    const response = await fetch('/api/competitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(competitorInput.value)
    });

    if (!response.ok) throw new Error('分析请求失败');
    if (!response.body) throw new Error('流传输异常');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            fullContent += (data.choices?.[0]?.delta?.content || '');
          } catch (e) {}
        }
      }
    }

    if (fullContent) {
      try {
        competitorResult.value = JSON.parse(fullContent);
        await updateDoc(doc(db, 'users', user.value.uid), { usage: increment(1) });
      } catch (e) {
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) competitorResult.value = JSON.parse(jsonMatch[0]);
      }
    }
  } catch (err: any) {
    ElMessage.error(err.message);
  } finally {
    competitorLoading.value = false;
  }
};

const useKeywordInCopy = (keyword: string) => {
  if (params.value.features) {
    params.value.features += `, ${keyword}`;
  } else {
    params.value.features = keyword;
  }
  activeTab.value = 'copywriting';
};

const handleMarketResearch = async () => {
  if (!user.value) {
    ElMessage.warning(t.value.common.loginFirst);
    return;
  }

  const currentPlan = userProfile.value?.plan || 'free';
  if (currentPlan !== 'pro') {
    showUsageLimitDialog();
    return;
  }

  if ((userProfile.value?.usage || 0) >= PLAN_LIMITS[currentPlan]) {
    showUsageLimitDialog();
    return;
  }

  marketLoading.value = true;
  marketResearchResult.value = null;

  try {
    const response = await fetch('/api/market-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...marketParams.value,
        locale: locale.value
      })
    });

    if (!response.ok) throw new Error('调研请求失败');
    if (!response.body) throw new Error('流传输异常');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            fullContent += (data.choices?.[0]?.delta?.content || '');
          } catch (e) {}
        }
      }
    }

    if (fullContent) {
      try {
        const parsed = JSON.parse(fullContent);
        const normalized: any = {};
        Object.keys(parsed).forEach(k => normalized[k.toLowerCase()] = parsed[k]);
        
        const rawCategories = normalized.categories || parsed.categories || [];
        const normalizedCategories = Array.isArray(rawCategories) ? rawCategories.map((c: any) => ({
          category: c.category || c.Category || '',
          searchVolume: Number(c.searchVolume || c.searchvolume || c.SearchVolume || 0) || 0,
          growth: Number(c.growth || c.Growth || 0) || 0
        })) : [];

        const rawProducts = normalized.products || parsed.products || [];
        const normalizedProducts = Array.isArray(rawProducts) ? rawProducts.map((p: any) => ({
          rank: Number(p.rank || p.Rank || 0) || 0,
          name: p.name || p.Name || '',
          price: p.price || p.Price || '',
          sales: p.sales || p.Sales || '',
          hotpoint: p.hotpoint || p.Hotpoint || '',
          thumbnail: p.thumbnail || p.Thumbnail || ''
        })) : [];

        marketResearchResult.value = {
          lastUpdate: normalized.lastupdate || parsed.lastUpdate || new Date().toISOString().split('T')[0],
          platform: normalized.platform || parsed.platform || marketParams.value.platform,
          categories: normalizedCategories,
          products: normalizedProducts,
          insights: normalized.insights || parsed.insights || []
        };
        
        await updateDoc(doc(db, 'users', user.value.uid), { usage: increment(1) });
      } catch (e) {
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const innerParsed = JSON.parse(jsonMatch[0]);
            const innerNormalized: any = {};
            Object.keys(innerParsed).forEach(k => innerNormalized[k.toLowerCase()] = innerParsed[k]);
            
            const rawCategories = innerNormalized.categories || innerParsed.categories || [];
            const normalizedCategories = Array.isArray(rawCategories) ? rawCategories.map((c: any) => ({
              category: c.category || c.Category || '',
              searchVolume: Number(c.searchVolume || c.searchvolume || c.SearchVolume || 0) || 0,
              growth: Number(c.growth || c.Growth || 0) || 0
            })) : [];

            const rawProducts = innerNormalized.products || innerParsed.products || [];
            const normalizedProducts = Array.isArray(rawProducts) ? rawProducts.map((p: any) => ({
              rank: Number(p.rank || p.Rank || 0) || 0,
              name: p.name || p.Name || '',
              price: p.price || p.Price || '',
              sales: p.sales || p.Sales || '',
              hotpoint: p.hotpoint || p.Hotpoint || '',
              thumbnail: p.thumbnail || p.Thumbnail || ''
            })) : [];

            marketResearchResult.value = {
              lastUpdate: innerNormalized.lastupdate || innerParsed.lastUpdate || new Date().toISOString().split('T')[0],
              platform: innerNormalized.platform || innerParsed.platform || marketParams.value.platform,
              categories: normalizedCategories,
              products: normalizedProducts,
              insights: innerNormalized.insights || innerParsed.insights || []
            };
          } catch (e2) {
            console.error('Failed to parse fallback JSON', e2);
          }
        }
      }
    }
  } catch (err: any) {
    ElMessage.error(err.message);
  } finally {
    marketLoading.value = false;
  }
};

const copyToClipboard = (text: string, field: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copiedField.value = field;
    ElMessage.success(t.value.copywriting.copySuccess);
    setTimeout(() => copiedField.value = null, 2000);
  }).catch(err => {
    console.error('Copy failed:', err);
    ElMessage.error(locale.value === 'zh' ? '复制失败' : 'Copy failed');
  });
};
</script>

<template>
  <div class="flex flex-col h-screen bg-bg-main overflow-hidden font-sans">
    <!-- Auth Modal -->
    <AuthModal v-if="!user && !authLoading" />

    <!-- Header -->
    <header class="h-16 bg-bg-card border-b border-border-theme flex items-center justify-between px-8 flex-shrink-0 z-10">
      <div class="flex items-center gap-2">
        <div class="text-primary font-bold text-xl tracking-tight flex items-center gap-2">
          <ShoppingBag class="h-6 w-6" />
          ListingCraft AI
        </div>
      </div>
      
      <div v-if="user" class="flex items-center gap-6">
        <LanguageSwitcher />
        <div class="h-8 w-px bg-border-theme"></div>
        
        <!-- User Info & Logout -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <img 
              v-if="user?.photoURL" 
              :src="user.photoURL" 
              class="h-8 w-8 rounded-full border border-border-theme"
              referrerPolicy="no-referrer"
            />
            <div 
              v-else 
              class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm"
            >
              {{ user?.displayName?.charAt(0) || 'U' }}
            </div>
            <div class="hidden md:block text-left">
              <div class="text-xs font-bold text-text-main truncate max-w-[120px]">{{ user?.displayName || (locale === 'zh' ? '用户' : 'User') }}</div>
              <div v-if="userProfile" class="text-[10px] text-primary font-bold uppercase">{{ PLAN_NAMES[userProfile.plan] }}</div>
            </div>
          </div>
          <button 
            @click="logout"
            class="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-all flex items-center gap-2"
            :title="t.common.logout"
          >
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div v-else-if="authLoading" class="flex items-center gap-2 text-gray-400">
        <Loader2 class="h-4 w-4 animate-spin" />
        <span class="text-sm">{{ locale === 'zh' ? '正在同步状态...' : 'Syncing status...' }}</span>
      </div>
    </header>

    <main class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-[240px] bg-bg-card border-r border-border-theme p-6 flex flex-col gap-2 flex-shrink-0">
        <div class="text-[12px] font-semibold uppercase tracking-wider text-text-muted mb-2 px-2">{{ locale === 'zh' ? '主要功能' : 'FEATURES' }}</div>
        <div 
          @click="activeTab = 'copywriting'"
          :class="[
            'px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors flex items-center gap-2',
            activeTab === 'copywriting' ? 'bg-[#EEF2FF] text-primary' : 'text-text-main hover:bg-gray-100'
          ]"
        >
          <Sparkles class="h-4 w-4" />
          {{ t.sidebar.copywriting }}
        </div>
        <div 
          @click="activeTab = 'keywords'"
          :class="[
            'px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors flex items-center gap-2',
            activeTab === 'keywords' ? 'bg-[#EEF2FF] text-primary' : 'text-text-main hover:bg-gray-100'
          ]"
        >
          <Zap class="h-4 w-4" />
          {{ t.sidebar.keywords }}
        </div>
        <div 
          @click="activeTab = 'competitor'"
          :class="[
            'px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors flex items-center gap-2',
            activeTab === 'competitor' ? 'bg-[#EEF2FF] text-primary' : 'text-text-main hover:bg-gray-100'
          ]"
        >
          <ShoppingBag class="h-4 w-4" />
          {{ t.sidebar.competitor }}
        </div>
        <div 
          @click="activeTab = 'research'"
          :class="[
            'px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors flex items-center gap-2',
            activeTab === 'research' ? 'bg-[#EEF2FF] text-primary' : 'text-text-main hover:bg-gray-100'
          ]"
        >
          <BarChart3 class="h-4 w-4" />
          {{ t.sidebar.research }}
        </div>
        
        <div class="text-[12px] font-semibold uppercase tracking-wider text-text-muted mt-6 mb-2 px-2">{{ t.sidebar.recent }}</div>
        <div class="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
          <div v-if="historyList.length > 0" class="space-y-1">
            <div 
              v-for="item in historyList" 
              :key="item.id"
              @click="result = item; activeTab = 'copywriting'"
              class="group px-3 py-2 rounded-md text-xs text-text-main hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-between gap-2"
            >
              <div class="flex items-center gap-2 truncate">
                <History class="h-3 w-3 flex-shrink-0 text-gray-400" />
                <span class="truncate">{{ item.productName }}</span>
              </div>
              <button 
                @click.stop="deleteHistoryItem(item.id)"
                class="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
              >
                <Trash2 class="h-3 w-3" />
              </button>
            </div>
          </div>
          <div v-else class="px-3 py-2 text-xs text-gray-400 italic">
            {{ t.sidebar.noHistory }}
          </div>
        </div>

        <!-- Subscription Footer -->
        <div v-if="userProfile" class="mt-auto pt-6 border-t border-border-theme">
          <!-- Subscription Card -->
          <div class="bg-primary/5 rounded-xl p-4 border border-primary/10 mx-2">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-primary uppercase">{{ t.common.currentPlan }}: {{ PLAN_NAMES[userProfile.plan] }}</span>
              <Gem v-if="userProfile.plan !== 'free'" class="h-3 w-3 text-primary" />
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div 
                class="bg-primary h-1.5 rounded-full transition-all" 
                :style="{ width: `${Math.min((userProfile.usage / (PLAN_LIMITS[userProfile.plan] || 1)) * 100, 100)}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-400 mb-3">
              <span>{{ t.common.usage }}: {{ userProfile.usage }} / {{ userProfile.plan === 'pro' ? '∞' : PLAN_LIMITS[userProfile.plan] }}</span>
            </div>
            <button 
              v-if="userProfile.plan !== 'pro'"
              @click="navigateTo('/pricing')"
              class="w-full py-2 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary-hover transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Zap class="h-3 w-3" /> {{ t.common.upgrade }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Content Area -->
      <div class="flex-1 p-8 overflow-hidden">
        <div v-if="activeTab === 'copywriting'" class="h-full grid grid-cols-[380px_1fr] gap-8 overflow-hidden">
          <!-- Editor Panel -->
          <div class="flex flex-col gap-5 overflow-y-auto pr-2">
            <div class="bg-bg-card border border-border-theme rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 space-y-4">
              <!-- Quick Examples -->
              <div class="space-y-2 mb-2">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{{ t.copywriting.examples }}</label>
                <div class="flex flex-wrap gap-2">
                  <button 
                    @click="fillExample({ name: '手工陶瓷马克杯', features: '纯手工制作, 极简主义设计, 莫兰迪色系', audience: '追求品质生活的年轻人' })"
                    class="px-2 py-1 bg-gray-50 border border-border-theme rounded text-[11px] hover:border-primary hover:text-primary transition-all"
                  >
                    {{ t.copywriting.exampleHome }}
                  </button>
                  <button 
                    @click="fillExample({ name: '925纯银蒲公英颈链', features: '防过敏材质, 森林系风格, 精美礼盒', audience: '送礼需求的年轻女性' })"
                    class="px-2 py-1 bg-gray-50 border border-border-theme rounded text-[11px] hover:border-primary hover:text-primary transition-all"
                  >
                    {{ t.copywriting.exampleGift }}
                  </button>
                </div>
              </div>

              <h2 class="text-base font-semibold mb-2">{{ t.copywriting.title }}</h2>
              
              <div class="space-y-1.5">
                <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.platform }}</label>
                <select v-model="params.platform" class="w-full h-10 border border-border-theme rounded-md px-3 text-sm">
                  <option value="Etsy">Etsy</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Shopify">Shopify</option>
                  <option value="eBay">eBay</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.productName }}</label>
                <input 
                  v-model="params.productName"
                  :placeholder="locale === 'zh' ? '例如: 手工陶瓷马克杯' : 'e.g. Handmade Ceramic Mug'" 
                  class="w-full h-10 border border-border-theme rounded-md px-3 text-sm"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.features }}</label>
                <textarea 
                  v-model="params.features"
                  :placeholder="locale === 'zh' ? '例如: 纯手工, 极简主义, 礼物, 磨砂感' : 'e.g. Handmade, Minimalist, Gift, Matte finish'" 
                  class="w-full min-h-[80px] border border-border-theme rounded-md p-3 text-sm resize-none"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.tone }}</label>
                  <select v-model="params.tone" class="w-full h-10 border border-border-theme rounded-md px-3 text-sm">
                    <option v-for="opt in toneOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.language }}</label>
                  <select v-model="params.language" class="w-full h-10 border border-border-theme rounded-md px-3 text-sm">
                    <option value="中文">{{ locale === 'zh' ? '中文 (Simplified)' : 'Chinese' }}</option>
                    <option value="英文">{{ locale === 'zh' ? '英文 (English)' : 'English' }}</option>
                    <option value="德语">{{ locale === 'zh' ? '德语 (German)' : 'German' }}</option>
                    <option value="日语">{{ locale === 'zh' ? '日语 (Japanese)' : 'Japanese' }}</option>
                  </select>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.audience }}</label>
                <input 
                  v-model="params.targetAudience"
                  :placeholder="locale === 'zh' ? '例如: 追求高品质生活的白领' : 'e.g. Professionals seeking quality life'" 
                  class="w-full h-10 border border-border-theme rounded-md px-3 text-sm"
                />
              </div>

              <button 
                @click="handleGenerate"
                :disabled="loading"
                class="w-full bg-primary hover:bg-primary-hover text-white h-11 rounded-md font-semibold transition-all flex items-center justify-center disabled:opacity-70"
              >
                <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                <template v-else>{{ t.copywriting.generate }}</template>
              </button>
            </div>
          </div>

          <!-- Preview Panel -->
          <div class="flex flex-col gap-5 overflow-y-auto pr-2">
            <!-- Initial State -->
            <div v-if="!result && !loading" class="h-full flex flex-col items-center justify-center text-center p-12 bg-bg-card rounded-xl border border-dashed border-border-theme">
              <Sparkles class="h-12 w-12 text-gray-200 mb-4" />
              <h3 class="text-lg font-semibold text-text-main mb-1">{{ t.copywriting.waitTitle }}</h3>
              <p class="text-sm text-text-muted max-w-[280px]">
                {{ t.copywriting.waitDesc }}
              </p>
            </div>

            <!-- Deep Thinking / Initial Loading State -->
            <div v-else-if="loading && (!result || !result.title)" class="h-full flex flex-col items-center justify-center space-y-4 p-12 bg-bg-card rounded-xl border border-border-theme">
              <Loader2 class="h-8 w-8 text-primary animate-spin" />
              <p class="font-medium text-text-main animate-pulse">{{ t.copywriting.loadingTitle }}</p>
            </div>

            <!-- Streaming / Final Result State -->
            <div v-else class="space-y-6">
              <div class="bg-bg-card border border-border-theme rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                <div class="py-4 px-6 border-b border-border-theme flex flex-row items-center justify-between bg-gray-50/50">
                  <div class="flex items-center gap-2">
                    <h2 class="text-base font-semibold">{{ t.copywriting.resultHeader }}</h2>
                    <Loader2 v-if="loading" class="h-3 w-3 animate-spin text-primary" />
                    <button 
                      v-if="result && !loading" 
                      @click="result = null"
                      class="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                      :title="t.common.reset"
                    >
                      <RotateCcw class="h-3 w-3 text-gray-500" />
                    </button>
                  </div>
                  <span class="bg-primary/10 text-primary border border-primary/20 rounded-[4px] px-2 py-0.5 text-[11px] font-bold uppercase">
                    {{ t.copywriting.platformFormat.replace('{platform}', params.platform) }}
                  </span>
                </div>
                <div class="p-6 space-y-6">
                  
                  <!-- Title Section -->
                  <div class="space-y-2">
                    <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.suggestTitle }}</label>
                    <div class="bg-bg-main border border-dashed border-border-theme rounded-lg p-4 relative group">
                      <div 
                        @click="copyToClipboard(result!.title, 'title')"
                        class="absolute top-2 right-2 text-[11px] font-medium text-primary cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {{ copiedField === 'title' ? t.copywriting.copied : t.copywriting.copy }}
                      </div>
                      <p class="text-sm font-semibold text-text-main leading-relaxed pr-8">
                        {{ result!.title }}
                      </p>
                    </div>
                  </div>

                  <!-- Description Section -->
                  <div class="space-y-2">
                    <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.descTitle }}</label>
                    <div class="bg-bg-main border border-dashed border-border-theme rounded-lg p-4 relative group">
                      <div 
                        @click="copyToClipboard(result!.description, 'desc')"
                        class="absolute top-2 right-2 text-[11px] font-medium text-primary cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {{ copiedField === 'desc' ? t.copywriting.copied : t.copywriting.copy }}
                      </div>
                      <div class="text-sm text-text-main leading-relaxed whitespace-pre-wrap pr-8">
                        {{ result!.description }}
                      </div>
                    </div>
                  </div>

                  <!-- Tags Section -->
                  <div class="space-y-2">
                    <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.tagTitle }}</label>
                    <div class="flex flex-wrap gap-1.5">
                      <span v-for="(tag, i) in (typeof result!.tags === 'string' ? result!.tags.split(', ') : result!.tags)" :key="i" class="bg-white border border-border-theme px-2.5 py-1 rounded-[4px] text-[12px] text-text-muted">
                        #{{ tag }}
                      </span>
                    </div>
                  </div>

                  <!-- Social Copy Section -->
                  <div class="space-y-2">
                    <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.socialTitle }}</label>
                    <div class="bg-bg-main border border-dashed border-border-theme rounded-lg p-4 relative group">
                      <div 
                        @click="copyToClipboard(result!.socialCopy, 'social')"
                        class="absolute top-2 right-2 text-[11px] font-medium text-primary cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {{ copiedField === 'social' ? t.copywriting.copied : t.copywriting.copy }}
                      </div>
                      <p class="text-sm italic text-text-muted pr-8">
                        {{ result!.socialCopy }}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'research'" class="h-full flex flex-col gap-6 overflow-hidden relative">
          <!-- PAYWALL MASK -->
          <div v-if="userProfile?.plan !== 'pro'" class="absolute inset-0 z-[20] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-white/60 backdrop-blur-[6px]"></div>
            <div class="relative bg-white p-10 md:p-12 rounded-[40px] border border-border-theme shadow-2xl w-full max-w-[480px] text-center space-y-8 animate-in fade-in zoom-in duration-500 overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <div class="h-20 w-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Lock class="h-10 w-10 text-orange-500" />
              </div>
              <div class="space-y-4">
                <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  {{ t.research.lockedTitle }}
                </h2>
                <p class="text-sm text-gray-500 leading-relaxed max-w-[320px] mx-auto">
                  {{ t.research.lockedDesc }}
                </p>
              </div>
              <div class="pt-4 flex justify-center">
                <button 
                  @click="router.push('/pricing')"
                  class="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-lg font-bold rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 flex-shrink-0"
                >
                  <ArrowUpCircle class="h-6 w-6" />
                  {{ t.common.upgradeNow }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex-shrink-0 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-text-main flex items-center gap-2">
                <BarChart3 class="h-5 w-5 text-primary" />
                {{ t.research.title }}
              </h2>
              <p class="text-sm text-text-muted italic serif">{{ t.research.subtitle }}</p>
            </div>
            <button 
              v-if="marketResearchResult"
              @click="marketResearchResult = null"
              class="h-10 px-6 bg-white border border-border-theme text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <RotateCcw class="h-4 w-4" />
              {{ t.research.reAnalyze }}
            </button>
          </div>

          <!-- Input Panel (Similar to Copywriting) -->
          <div v-if="!marketResearchResult && !marketLoading" class="grid grid-cols-[380px_1fr] gap-8 h-full">
            <div class="bg-white p-6 rounded-2xl border border-border-theme shadow-sm space-y-6">
              <div class="space-y-1.5">
                <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.platform }}</label>
                <select v-model="marketParams.platform" class="w-full h-10 border border-border-theme rounded-md px-3 text-sm">
                  <option value="Etsy">Etsy</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Shopify">Shopify</option>
                  <option value="TikTok Shop">TikTok Shop</option>
                  <option value="eBay">eBay</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-[13px] font-medium text-text-muted">{{ t.copywriting.language }}</label>
                <select v-model="marketParams.language" class="w-full h-10 border border-border-theme rounded-md px-3 text-sm">
                  <option value="中文">{{ locale === 'zh' ? '中文 (Simplified)' : 'Chinese' }}</option>
                  <option value="English">{{ locale === 'zh' ? '英文 (English)' : 'English' }}</option>
                  <option value="German">{{ locale === 'zh' ? '德语 (German)' : 'German' }}</option>
                  <option value="Japanese">{{ locale === 'zh' ? '日语 (Japanese)' : 'Japanese' }}</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-[13px] font-medium text-text-muted">{{ t.research.timeframe }}</label>
                <div class="grid grid-cols-3 gap-2">
                  <button 
                    @click="marketParams.timeframe = '1'"
                    :class="['h-10 rounded-md text-xs font-bold border transition-all', marketParams.timeframe === '1' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border-theme text-gray-400']"
                  >
                    {{ t.research.t1 }}
                  </button>
                  <button 
                    @click="marketParams.timeframe = '3'"
                    :class="['h-10 rounded-md text-xs font-bold border transition-all', marketParams.timeframe === '3' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border-theme text-gray-400']"
                  >
                    {{ t.research.t3 }}
                  </button>
                  <button 
                    @click="marketParams.timeframe = '7'"
                    :class="['h-10 rounded-md text-xs font-bold border transition-all', marketParams.timeframe === '7' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border-theme text-gray-400']"
                  >
                    {{ t.research.t7 }}
                  </button>
                </div>
              </div>
              <button 
                @click="handleMarketResearch"
                class="w-full bg-primary hover:bg-primary-hover text-white h-12 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <Zap class="h-4 w-4" />
                {{ t.research.getBtn }}
              </button>

              <div class="p-4 bg-amber-50 rounded-xl border border-amber-100 mt-8">
                <div class="flex gap-3">
                  <Info class="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p class="text-[11px] text-amber-900 leading-relaxed font-medium">
                    {{ t.research.hint }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-center justify-center text-center px-12 opacity-40">
              <BarChart3 class="h-24 w-24 text-gray-300 mb-6" />
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t.research.waitTitle }}</h3>
              <p class="text-sm max-w-[320px]">{{ t.research.waitDesc }}</p>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="marketLoading" class="flex-1 flex flex-col items-center justify-center space-y-6 bg-white rounded-3xl border border-border-theme">
            <Loader2 class="h-10 w-10 text-primary animate-spin" />
            <div class="text-center">
              <h3 class="text-lg font-bold text-gray-900 mb-1">{{ t.research.syncTitle.replace('{platform}', marketParams.platform) }}</h3>
              <p class="text-xs text-gray-400">{{ t.research.syncDesc }}</p>
            </div>
          </div>

          <!-- Result Section with Chart and Products -->
          <div v-else-if="marketResearchResult" class="flex-1 overflow-y-auto space-y-10 pr-2">
            <!-- Macro View: Category Insights -->
            <div class="space-y-4">
              <div class="flex items-center justify-between px-2">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                  <h3 class="font-bold text-lg text-text-main">{{ t.research.macroTitle }}</h3>
                </div>
                <div class="text-[10px] font-mono text-gray-400 italic">{{ t.research.lastUpdateLabel }} {{ marketResearchResult.lastUpdate }}</div>
              </div>
              
              <div class="grid grid-cols-[1fr_360px] gap-8">
                <div class="bg-white p-8 rounded-3xl border border-border-theme shadow-sm relative overflow-hidden">
                  <div class="flex items-center justify-between mb-8">
                    <div>
                      <h4 class="text-sm font-bold text-gray-900 mb-1">{{ t.research.trafficDistribution }}</h4>
                      <p class="text-[10px] text-gray-400 italic">{{ t.research.trafficDesc }}</p>
                    </div>
                    <span class="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded">{{ t.research.volumeRank }}</span>
                  </div>
                  <MarketChart :data="marketResearchResult.categories" />
                </div>

                <div class="bg-[#1e293b] text-white p-6 rounded-3xl shadow-xl flex flex-col">
                  <h3 class="text-sm font-bold flex items-center gap-2 mb-6">
                    <Sparkles class="h-4 w-4 text-amber-400" />
                    {{ t.research.aiReport }}
                  </h3>
                  <div class="space-y-6 flex-1">
                    <div v-for="(insight, idx) in marketResearchResult.insights" :key="idx" class="relative pl-8">
                      <div class="absolute left-0 top-0 w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-bold text-amber-400 border border-white/5">{{ idx + 1 }}</div>
                      <p class="text-xs text-white/80 leading-relaxed font-medium">{{ insight }}</p>
                    </div>
                  </div>
                  <div class="mt-8 pt-6 border-t border-white/10 flex items-center gap-4">
                    <div class="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center">
                      <TrendingUp class="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ t.research.overallActivity }}</div>
                      <div class="text-sm font-bold text-white">{{ t.research.bullishStatus }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Micro View: Top Selling Products -->
            <div class="space-y-4 pb-12">
              <div class="flex items-center gap-2 px-2">
                <div class="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                <h3 class="font-bold text-lg text-text-main">{{ t.research.microTitle }}</h3>
              </div>
              
              <div class="grid grid-cols-2 gap-6">
                <div v-for="p in marketResearchResult.products" :key="p.rank" class="bg-white p-4 rounded-3xl border border-border-theme hover:border-orange-200 transition-all flex gap-4 group cursor-default">
                  <div class="w-24 h-24 rounded-2xl bg-gray-50 flex-shrink-0 relative overflow-hidden">
                    <img :src="p.thumbnail" class="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                    <div class="absolute top-0 left-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg italic">
                      #{{ p.rank }}
                    </div>
                  </div>
                  <div class="flex flex-col justify-between py-1 flex-1 relative group/copy">
                    <div>
                      <div class="flex items-center justify-between">
                        <h4 class="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1">{{ p.name }}</h4>
                        <button 
                          @click.stop="copyToClipboard(p.name, 'mp-' + p.rank)"
                          class="opacity-0 group-hover/copy:opacity-100 p-1 hover:text-primary transition-all ml-1"
                          :title="t.copywriting.copy"
                        >
                          <Copy class="h-3 w-3" />
                        </button>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-xs font-mono font-bold text-gray-900">{{ p.price }}</span>
                        <span class="text-[10px] text-gray-400 font-medium">{{ t.research.estSalesLabel }} <span class="text-text-main">{{ p.sales }}</span></span>
                      </div>
                    </div>
                    <div class="pt-2">
                      <div class="text-[10px] text-orange-600 font-bold italic leading-tight">
                        <span class="bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100/50 flex items-center gap-1 w-fit">
                          <Zap class="h-2 w-2" /> {{ p.hotpoint }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="activeTab === 'keywords'" class="h-full flex flex-col gap-6 overflow-hidden">
          <!-- Header for Keywords -->
          <div class="flex-shrink-0 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-text-main">{{ t.keywords.title }}</h2>
              <p class="text-sm text-text-muted">{{ t.keywords.subtitle }}</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="space-y-0.5 mr-2">
                <select v-model="keywordLanguage" class="h-10 border border-border-theme rounded-lg px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium">
                  <option value="中文">{{ locale === 'zh' ? '结果: 中文' : 'Output: Chinese' }}</option>
                  <option value="英文">{{ locale === 'zh' ? '结果: 英文' : 'Output: English' }}</option>
                  <option value="德语">{{ locale === 'zh' ? '结果: 德语' : 'Output: German' }}</option>
                  <option value="日语">{{ locale === 'zh' ? '结果: 日语' : 'Output: Japanese' }}</option>
                </select>
              </div>
              <div class="relative w-[300px]">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  v-model="keywordSearchInput"
                  @keyup.enter="handleGenerateKeywords"
                  :placeholder="t.keywords.placeholder"
                  class="w-full h-10 pl-10 pr-4 bg-white border border-border-theme rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <button 
                v-if="keywordResult"
                @click="keywordResult = null"
                class="h-10 px-4 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
                :title="t.keywords.reset"
              >
                <RotateCcw class="h-4 w-4" />
                {{ t.keywords.reset }}
              </button>
              <button 
                @click="handleGenerateKeywords"
                :disabled="keywordLoading"
                class="h-10 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-all flex items-center gap-2 disabled:opacity-70"
              >
                <Loader2 v-if="keywordLoading" class="h-4 w-4 animate-spin" />
                <Sparkles v-else class="h-4 w-4" />
                {{ t.keywords.analyze }}
              </button>
            </div>
          </div>

          <!-- Content Section -->
          <div v-if="!keywordResult && !keywordLoading" class="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-dashed border-border-theme">
            <div class="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <Search class="h-8 w-8 text-primary" />
            </div>
            <h3 class="text-lg font-semibold text-text-main mb-2">{{ t.keywords.waitTitle }}</h3>
            <p class="text-sm text-text-muted max-w-[420px] leading-relaxed">
              {{ t.keywords.waitDesc }}
            </p>
          </div>

          <div v-else-if="keywordLoading" class="flex-1 flex flex-col items-center justify-center space-y-4 bg-white rounded-2xl border border-border-theme">
            <div class="relative">
              <div class="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <Loader2 class="h-10 w-10 text-primary animate-spin relative z-10" />
            </div>
            <div class="text-center">
              <p class="font-bold text-text-main mb-1">{{ t.keywords.loadingTitle }}</p>
              <p class="text-xs text-text-muted">{{ t.keywords.loadingDesc }}</p>
            </div>
          </div>

          <div v-else-if="keywordResult" class="flex-1 overflow-y-auto space-y-6 pr-2">
            <!-- Summary Stats (Recipe 8 style) -->
            <div class="grid grid-cols-3 gap-6">
              <div class="bg-white p-6 rounded-2xl border border-border-theme shadow-sm flex items-center gap-5">
                <div class="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <BarChart3 class="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{{ t.keywords.statsTotal }}</div>
                  <div class="text-2xl font-bold text-gray-900">{{ keywordResult.summary.total }}</div>
                </div>
              </div>
              <div class="bg-white p-6 rounded-2xl border border-border-theme shadow-sm flex items-center gap-5">
                <div class="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <TrendingUp class="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{{ t.keywords.statsCompetition }}</div>
                  <div class="text-2xl font-bold text-gray-900">{{ keywordResult.summary.avgCompetition }}</div>
                </div>
              </div>
              <div class="bg-white p-6 rounded-2xl border border-border-theme shadow-sm flex items-center gap-5">
                <div class="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Target class="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{{ t.keywords.statsTop }}</div>
                  <div class="text-2xl font-bold text-gray-900">{{ keywordResult.summary.topRecommendation }}</div>
                </div>
              </div>
            </div>

            <!-- Categories and Tables (Recipe 1 style grid) -->
            <div v-for="cat in keywordResult.categories" :key="cat.name" class="space-y-4">
              <div class="flex items-center gap-2">
                <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                <h3 class="font-bold text-text-main">{{ cat.name }}</h3>
                <span class="text-xs text-text-muted bg-gray-100 px-2 py-0.5 rounded ml-2">{{ t.keywords.resultsFound.replace('{count}', cat.keywords.length) }}</span>
              </div>

              <div class="bg-white rounded-xl border border-border-theme overflow-hidden shadow-sm">
                <div class="grid grid-cols-[1fr_120px_100px_100px_100px] gap-4 px-6 py-3 bg-gray-50 border-b border-border-theme">
                  <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider italic">{{ t.keywords.tableHeader }}</div>
                  <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider italic">{{ t.keywords.tableTrend }}</div>
                  <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider italic">{{ t.keywords.tableDiff }}</div>
                  <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider italic">{{ t.keywords.tableScore }}</div>
                  <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider italic">{{ t.keywords.tableActions }}</div>
                </div>

                <div v-for="(kw, idx) in cat.keywords" :key="idx" class="group grid grid-cols-[1fr_120px_100px_100px_100px] gap-4 px-6 py-4 border-b border-gray-50 hover:bg-primary-hover/5 transition-colors cursor-default last:border-b-0">
                  <div class="flex flex-col gap-1">
                    <span class="font-bold text-gray-900">{{ kw.term }}</span>
                    <span class="text-xs text-gray-400 line-clamp-1">{{ kw.reason }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-xs font-mono font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{{ kw.volume }}</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div :style="{ width: (kw.competition * 100) + '%' }" :class="['h-full rounded-full', kw.competition > 0.7 ? 'bg-red-400' : (kw.competition > 0.4 ? 'bg-orange-400' : 'bg-green-400')]"></div>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <span :class="['font-mono font-bold', kw.score > 80 ? 'text-green-600' : 'text-orange-600']">{{ kw.score }}%</span>
                  </div>
                  <div class="flex items-center">
                    <button 
                      @click="useKeywordInCopy(kw.term)"
                      class="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      {{ t.copywriting.applyKeyword }} <ArrowRight class="h-3 w-3" />
                    </button>
                    <button 
                      @click="copyToClipboard(kw.term, 'kw')"
                      class="ml-3 text-gray-300 hover:text-primary transition-colors"
                      :title="t.copywriting.copy"
                    >
                      <Copy class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'competitor'" class="h-full flex flex-col gap-6 overflow-hidden">
          <!-- Header (Modern Technical style) -->
          <div class="flex-shrink-0 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-text-main flex items-center gap-2">
                <Target class="h-5 w-5 text-primary" />
                {{ t.competitor.title }}
              </h2>
              <p class="text-sm text-text-muted italic serif">{{ t.competitor.subtitle }}</p>
            </div>
            <button 
              v-if="competitorResult"
              @click="competitorResult = null"
              class="h-10 px-6 bg-white border border-border-theme text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <RotateCcw class="h-4 w-4" />
              {{ t.competitor.reset }}
            </button>
          </div>

          <!-- Analysis Form -->
          <div v-if="!competitorResult && !competitorLoading" class="grid grid-cols-2 gap-8 items-center h-full">
            <div class="space-y-8 bg-white p-8 rounded-3xl border border-border-theme shadow-lg">
              <div class="space-y-6">
                <div class="space-y-2">
                  <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <ShoppingBag class="h-4 w-4" /> {{ t.competitor.productLabel }}
                  </label>
                  <input 
                    v-model="competitorInput.productName"
                    :placeholder="t.competitor.productPlaceholder"
                    class="w-full h-12 px-4 bg-gray-50 border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Zap class="h-4 w-4" /> {{ t.competitor.compLabel }}
                  </label>
                  <textarea 
                    v-model="competitorInput.competitorInfo"
                    :placeholder="t.competitor.compPlaceholder"
                    class="w-full h-32 p-4 bg-gray-50 border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                  ></textarea>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Globe class="h-4 w-4" /> {{ t.copywriting.language }}
                  </label>
                  <select v-model="competitorInput.language" class="w-full h-12 px-4 bg-gray-50 border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium">
                    <option value="中文">{{ locale === 'zh' ? '报告语言: 中文 (Simplified)' : 'Output: Chinese' }}</option>
                    <option value="英文">{{ locale === 'zh' ? '报告语言: 英文 (English)' : 'Output: English' }}</option>
                    <option value="德语">{{ locale === 'zh' ? '报告语言: 德语 (German)' : 'Output: German' }}</option>
                    <option value="日语">{{ locale === 'zh' ? '报告语言: 日语 (Japanese)' : 'Output: Japanese' }}</option>
                  </select>
                </div>
              </div>
              <button 
                @click="handleAnalyzeCompetitor"
                class="w-full h-14 bg-primary text-white text-lg font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                {{ t.competitor.analyze }}
              </button>
            </div>
            <div class="flex flex-col items-center text-center px-12">
              <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <TrendingUp class="h-10 w-10 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">{{ t.competitor.waitTitle }}</h3>
              <p class="text-gray-500 leading-relaxed font-medium">
                {{ t.competitor.waitDesc }}
              </p>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="competitorLoading" class="flex-1 flex flex-col items-center justify-center space-y-6 bg-white rounded-3xl border border-border-theme">
            <div class="relative w-24 h-24">
              <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <Target class="absolute inset-0 m-auto h-8 w-8 text-primary" />
            </div>
            <div class="text-center">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t.competitor.loadingTitle }}</h3>
              <p class="text-sm text-gray-400 font-mono tracking-widest uppercase">{{ t.competitor.loadingDesc }}</p>
            </div>
          </div>

          <!-- Result Section (Technical Dashboard Recipe) -->
          <div v-else-if="competitorResult" class="flex-1 overflow-y-auto space-y-8 pr-2">
            <!-- Top Score Overview -->
            <div class="bg-[#141414] text-white p-8 rounded-3xl flex items-center justify-between border-2 border-primary">
              <div class="space-y-1">
                <div class="text-[10px] font-mono opacity-60 uppercase tracking-widest italic">{{ t.competitor.intelligenceScore }}</div>
                <h3 class="text-2xl font-bold serif italic">{{ t.competitor.title }}</h3>
              </div>
              <div class="flex items-center gap-12">
                <div class="text-center">
                  <div class="text-3xl font-bold text-primary">{{ competitorResult.comparison.score.mine }}</div>
                  <div class="text-[10px] uppercase tracking-tighter opacity-60">{{ t.competitor.me }}</div>
                </div>
                <div class="h-8 w-px bg-white/20"></div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-white">{{ competitorResult.comparison.score.competitor }}</div>
                  <div class="text-[10px] uppercase tracking-tighter opacity-60">{{ t.competitor.vs }}</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-[1fr_320px] gap-8">
              <!-- Left: Metrics & Strategies -->
              <div class="space-y-8">
                <!-- Metrics Table -->
                <div class="bg-white rounded-2xl border border-border-theme overflow-hidden shadow-sm">
                  <div class="px-6 py-4 bg-gray-50 border-b border-border-theme font-bold text-sm">{{ t.competitor.metricsTitle }}</div>
                  <div class="p-6 space-y-6">
                    <div v-for="m in competitorResult.comparison.metrics" :key="m.name" class="space-y-2">
                      <div class="flex justify-between items-end">
                        <span class="text-sm font-bold text-gray-700">{{ m.name }}</span>
                        <span class="text-xs text-gray-400 serif italic">{{ m.comment }}</span>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div :style="{ width: m.mine + '%' }" class="h-full bg-primary rounded-full"></div>
                          </div>
                          <div class="flex justify-between text-[10px] font-mono text-primary font-bold">
                            <span>ME</span>
                            <span>{{ m.mine }}%</span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div :style="{ width: m.competitor + '%' }" class="h-full bg-gray-400 rounded-full"></div>
                          </div>
                          <div class="flex justify-between text-[10px] font-mono text-gray-400 font-bold">
                            <span>VS</span>
                            <span>{{ m.competitor }}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Strategies Section -->
                <div class="space-y-4">
                  <h3 class="font-bold text-gray-900 flex items-center gap-2 px-2">
                    <Zap class="h-4 w-4 text-orange-500" />
                    {{ t.competitor.strategyTitle }}
                  </h3>
                  <div class="grid grid-cols-1 gap-4">
                    <div v-for="s in competitorResult.strategies" :key="s.title" class="bg-white p-5 rounded-2xl border border-border-theme hover:border-primary transition-all group">
                      <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-2">
                          <h4 class="font-bold text-gray-900 group-hover:text-primary transition-colors">{{ s.title }}</h4>
                          <button 
                            @click.stop="copyToClipboard(s.action, 'cs-' + s.title)"
                            class="opacity-0 group-hover:opacity-100 p-1 hover:text-primary transition-all"
                            :title="t.copywriting.copy"
                          >
                            <Copy class="h-3 w-3" />
                          </button>
                        </div>
                        <span :class="['text-[10px] font-bold px-2 py-0.5 rounded uppercase', s.impact === '高' || s.impact === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500']">
                          {{ s.impact === '高' ? t.competitor.impactHigh : (s.impact === '中' ? t.competitor.impactLow : s.impact) }} {{ t.competitor.impactLabel }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 leading-relaxed">{{ s.action }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: SWOT Matrix -->
              <div class="bg-gray-50 p-6 rounded-3xl border border-border-theme h-fit sticky top-0">
                <h3 class="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target class="h-4 w-4" /> {{ t.competitor.swotTitle }}
                </h3>
                <div class="space-y-6">
                  <div class="space-y-3">
                    <div class="text-[10px] font-bold text-green-600 uppercase tracking-widest border-b border-green-100 pb-1">{{ t.competitor.swotStrengths }}</div>
                    <ul class="text-xs text-gray-600 space-y-2">
                      <li v-for="s in competitorResult.swot.strengths" :key="s" class="flex items-start gap-2 group/swot">
                        <div class="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <span class="flex-1">{{ s }}</span>
                        <button 
                          @click.stop="copyToClipboard(s, 'swot-s')"
                          class="opacity-0 group-hover/swot:opacity-100 p-1 hover:text-primary transition-all"
                        >
                          <Copy class="h-3 w-3" />
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div class="space-y-3">
                    <div class="text-[10px] font-bold text-red-600 uppercase tracking-widest border-b border-red-100 pb-1">{{ t.competitor.swotWeaknesses }}</div>
                    <ul class="text-xs text-gray-600 space-y-2">
                      <li v-for="w in competitorResult.swot.weaknesses" :key="w" class="flex items-start gap-2 group/swot">
                        <div class="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                        <span class="flex-1">{{ w }}</span>
                        <button 
                          @click.stop="copyToClipboard(w, 'swot-w')"
                          class="opacity-0 group-hover/swot:opacity-100 p-1 hover:text-primary transition-all"
                        >
                          <Copy class="h-3 w-3" />
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div class="space-y-3">
                    <div class="text-[10px] font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-1">{{ t.competitor.swotOpportunities }}</div>
                    <ul class="text-xs text-gray-600 space-y-2">
                      <li v-for="o in competitorResult.swot.opportunities" :key="o" class="flex items-start gap-2 group/swot">
                        <div class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <span class="flex-1">{{ o }}</span>
                        <button 
                          @click.stop="copyToClipboard(o, 'swot-o')"
                          class="opacity-0 group-hover/swot:opacity-100 p-1 hover:text-primary transition-all"
                        >
                          <Copy class="h-3 w-3" />
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div class="space-y-3">
                    <div class="text-[10px] font-bold text-orange-600 uppercase tracking-widest border-b border-orange-100 pb-1">{{ t.competitor.swotThreats }}</div>
                    <ul class="text-xs text-gray-600 space-y-2">
                      <li v-for="th in competitorResult.swot.threats" :key="th" class="flex items-start gap-2 group/swot">
                        <div class="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1 flex-shrink-0"></div>
                        <span class="flex-1">{{ th }}</span>
                        <button 
                          @click.stop="copyToClipboard(th, 'swot-th')"
                          class="opacity-0 group-hover/swot:opacity-100 p-1 hover:text-primary transition-all"
                        >
                          <Copy class="h-3 w-3" />
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
