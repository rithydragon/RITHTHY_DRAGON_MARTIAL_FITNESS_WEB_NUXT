// https://nuxt.com/docs/api/configuration/nuxt-config

import getComponentPaths from './app/utils/getComponentPaths'
import os from 'os';

function getLocalIp() {
  const interfaces = os.networkInterfaces();

  for (const network of Object.values(interfaces)) {
    for (const iface of network || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return 'localhost';
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: false },
  ssr: false,

  site: {
    url: 'https://rithymartialfitness.com',
    name: 'Rithy Martial & Fitness'
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

  devServer: {
    // host: getLocalIp(),
    host:'0.0.0.0',
    port: 3001,
    url: `http://${getLocalIp()}:3000`,
  },

  css: ['./app/assets/styles/main.scss'],

  imports: {
    dirs: ['stores', 'utils', 'plugins', 'composables'],
  },

  components: getComponentPaths(),

  app: {
    // titleTemplate: '%s | Rithy Martial & Fitness',
    rootId: 'riththy',
    rootTag: 'riththy-main',
    baseUrl: '/',
    buildAssetsDir: '_riththy_dragon',
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },

    head: {
      htmlAttrs: { lang: 'en', dir: 'ltr' },
      title: 'Rithy Martial & Fitness — Premier Cambodian Martial Arts & Fitness Training',
      bodyAttrs: {
        class: 'riththy-dragon-fitness',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0a0a0a' },
        { name: 'description', content: 'Premium martial arts and fitness training in Cambodia led by Mr. Ny Rithy. Bokator, Yuthakram Khom, Pradal Serey (Kun Khmer), BJJ, strength & conditioning, private and group classes.' },
        { name: 'keywords', content: 'Cambodian martial arts, Bokator, Yuthakram Khom, Pradal Serey, Kun Khmer, BJJ Phnom Penh, fitness training Cambodia, Ny Rithy, Rithy Martial Fitness' },
        
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Rithy Martial & Fitness — Premier Combat Training' },
        { property: 'og:description', content: 'Train in traditional Bokator, Kun Khmer kickboxing, BJJ, and high-performance athletic conditioning with Master Ny Rithy.' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: 'https://images.pexels.com/photos/7045699/pexels-photo-7045699.jpeg' },
        { property: 'og:url', content: 'https://rithymartialfitness.com' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Rithy Martial & Fitness' },
        { name: 'twitter:description', content: 'Cambodian Martial Arts, Bokator, Kun Khmer, BJJ & Strength Conditioning in Phnom Penh.' },
        { name: 'twitter:image', content: 'https://images.pexels.com/photos/7045699/pexels-photo-7045699.jpeg' },
      ],

      script: [
        {
          // Apply saved theme before first paint to avoid FOUC.
          // Mirrors the theme store (app/stores/theme.ts) — default: dark.
          innerHTML: `(function(){try{var t=localStorage.getItem('rmf-theme');var d='dark';if(t==='light'){d='light'}else if(t==='system'){d=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark'}}catch(e){}var r=document.documentElement;r.classList.add(d);r.setAttribute('data-theme',d)})()`,
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@400;500;700&family=Noto+Serif+Khmer:wght@400;600;700&display=swap',
        },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/remixicon@4.9.1/fonts/remixicon.min.css' },
      ],
    },
  },
    
  i18n: {
    lazy: true,
    langDir: 'locales/',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'km', iso: 'km-KH', name: 'ខ្មែរ', file: 'km.json' },
      { code: 'zh', iso: 'zh-CN', name: '中文', file: 'zh.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    compilation: {
      strictMessage: false
    }
  },

  runtimeConfig: {
    supabaseUrl: process.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
    apiInternalBase: process.env.API_INTERNAL_BASE || 'http://127.0.0.1:8000',
    apiInternalSecret: process.env.API_INTERNAL_SECRET || '',
    apiBase: `http://${getLocalIp()}:58721`,
    wsBase: process.env.NUXT_PUBLIC_WS_BASE || 'wss://api.rithymartialfitness.com/ws',
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://rithymartialfitness.com',
    oauth: {
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      facebookAppId: process.env.NUXT_PUBLIC_FACEBOOK_APP_ID || '',
      tiktokClientKey: process.env.NUXT_PUBLIC_TIKTOK_CLIENT_KEY || '',
      telegramBotName: process.env.NUXT_PUBLIC_TELEGRAM_BOT_NAME || 'RithyMartialBot',
    },
  },

  robots: {
    rules: [
      {
        userAgent: '*',
        allow: '/'
      }
    ],
    sitemap: 'https://rithymartialfitness.com/sitemap.xml'
  },

  sitemap: {
    gzip: true,
    autoLastmod: true,
    urls: [
      '/',
      '/about',
      '/services',
      '/programs',
      '/trainers',
      '/portfolio',
      '/schedule',
      '/testimonials',
      '/blog',
      '/blog/history-of-bokator',
      '/blog/kun-khmer-vs-muay-thai',
      '/blog/strength-training-for-martial-artists',
      '/blog/yuthakram-khom-complete-system',
      '/blog/nutrition-for-fighters',
      '/pricing',
      '/faq',
      '/contact'
    ]
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },

  typescript: {
    strict: true,
  },
})
