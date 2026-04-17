<script setup lang="ts">
import { ref } from 'vue';
import { ShoppingBag, Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-vue-next';
import { auth, db } from '~/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const isLogin = ref(true);
const loading = ref(false);

const form = ref({
  email: '',
  password: '',
  name: ''
});

const handleAuth = async () => {
  if (loading.value) return;
  loading.value = true;
  let isSuccess = false;
  
  try {
    let userCredential;
    if (isLogin.value) {
      userCredential = await signInWithEmailAndPassword(auth, form.value.email, form.value.password);
    } else {
      userCredential = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password);
      await updateProfile(userCredential.user, { displayName: form.value.name });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: form.value.email,
        name: form.value.name,
        role: 'user',
        plan: 'free',
        usage: 0,
        createdAt: serverTimestamp()
      });
    }

    // Sync with backend to set HttpOnly Cookie
    const idToken = await userCredential.user.getIdToken();
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { idToken, email: form.value.email }
    });
    
    isSuccess = true;
    ElMessage.success(isLogin.value ? '登录成功！正在跳转...' : '注册成功！正在跳转...');
    
    // 使用 navigateTo(..., { external: true }) 强制全页刷新跳转
    setTimeout(() => {
      console.log('Redirecting to dashboard...');
      navigateTo('/dashboard', { external: true });
    }, 1500);
  } catch (err: any) {
    console.error('Auth error:', err);
    
    // 映射 Firebase 错误码到友好提示
    const errorCode = err.code;
    let errorMsg = '';
    switch (errorCode) {
      case 'auth/email-already-in-use':
        errorMsg = '该邮箱已被注册，请直接登录';
        isLogin.value = true; // 自动切换到登录模式
        break;
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        errorMsg = '邮箱或密码错误';
        break;
      case 'auth/weak-password':
        errorMsg = '密码强度太低，请输入至少 6 位字符';
        break;
      case 'auth/invalid-email':
        errorMsg = '请输入有效的邮箱地址';
        break;
      case 'auth/operation-not-allowed':
        errorMsg = '邮箱登录功能尚未开启，请联系管理员';
        break;
      default:
        errorMsg = err.message || '认证失败，请检查您的信息';
    }
    ElMessage.error(errorMsg);
  } finally {
    if (!isSuccess) {
      loading.value = false;
    }
  }
};

const handleGoogleLogin = async () => {
  if (loading.value) return;
  loading.value = true;
  let isSuccess = false;
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Ensure user exists in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      name: result.user.displayName,
      role: 'user',
      plan: 'free',
      usage: 0,
      createdAt: serverTimestamp()
    }, { merge: true });

    const idToken = await result.user.getIdToken();
    await $fetch('/api/auth/google', { 
      method: 'POST',
      body: { idToken }
    });
    
    isSuccess = true;
    ElMessage.success('Google 登录成功！正在跳转...');
    
    // 使用 navigateTo(..., { external: true }) 强制全页刷新跳转
    setTimeout(() => {
      console.log('Redirecting to dashboard (Google)...');
      navigateTo('/dashboard', { external: true });
    }, 1500);
  } catch (err: any) {
    console.error('Google login error details:', err);
    let errorMsg = '';
    if (err.code === 'auth/popup-closed-by-user') {
      errorMsg = '登录窗口被关闭';
    } else if (err.code === 'auth/unauthorized-domain') {
      errorMsg = '当前域名未获授权，请在 Firebase 控制台添加域名';
    } else {
      errorMsg = `Google 登录失败: ${err.message}`;
    }
    ElMessage.error(errorMsg);
  } finally {
    if (!isSuccess) {
      loading.value = false;
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <NuxtLink to="/" class="flex justify-center items-center gap-2 mb-6 group">
        <ArrowLeft class="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
        <ShoppingBag class="h-10 w-10 text-primary" />
      </NuxtLink>
      <h2 class="text-center text-3xl font-extrabold text-gray-900">
        {{ isLogin ? '登录您的账号' : '创建新账号' }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        {{ isLogin ? '还没有账号？' : '已经有账号？' }}
        <button @click="isLogin = !isLogin" class="font-medium text-primary hover:text-primary/80">
          {{ isLogin ? '立即注册' : '立即登录' }}
        </button>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
        <form class="space-y-6" @submit.prevent="handleAuth">
          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-gray-700">姓名</label>
            <div class="mt-1 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="h-5 w-5 text-gray-400" />
              </div>
              <input v-model="form.name" type="text" required class="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="您的姓名" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">邮箱地址</label>
            <div class="mt-1 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-400" />
              </div>
              <input v-model="form.email" type="email" required class="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="name@example.com" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">密码</label>
            <div class="mt-1 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input v-model="form.password" type="password" required class="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all">
              <Loader2 v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              {{ isLogin ? '登录' : '注册' }}
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">或者使用</span>
            </div>
          </div>

          <div class="mt-6">
            <button @click="handleGoogleLogin" class="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="h-5 w-5 mr-2" />
              <span>Google 账号登录</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
