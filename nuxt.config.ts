import tailwindcss from '@tailwindcss/vite'
import { config as loadDotenv } from 'dotenv'

loadDotenv({ path: '.env.local' })

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  nitro: {
    // Attempt to fix resolution issues by disabling some experimental features or adjusting output
    externals: {
      inline: ['#internal/nuxt/paths']
    }
  },
  experimental: {
    // Some versions of Nuxt 3 had resolution issues that were fixed by this
  },
  modules: [
    '@vueuse/nuxt',
    '@element-plus/nuxt',
  ],
  runtimeConfig: {
    // Private keys are only available on the server
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    public: {
      // Public keys are exposed to the browser
      paddleClientToken: process.env.NUXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      paddleEnv: process.env.PADDLE_ENV
    }
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    },
  }
})
