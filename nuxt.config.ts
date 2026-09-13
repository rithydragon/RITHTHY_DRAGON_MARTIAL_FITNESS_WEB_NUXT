// https://nuxt.com/docs/api/configuration/nuxt-config

import getComponentPaths from './app/utils/getComponentPaths'
import articles from './app/assets/json/articles.json'
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

const blogRoutes = Array.isArray(articles)
  ? articles
      .filter(article => article?.slug)
      .map(article => `/blog/${article.slug}`)
  : []
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: false },
  ssr: true,

  site: {
    url: 'https://rithymartialfitness.com',
    name: 'RITHTHY Fitness'
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
    // url: `http://${getLocalIp()}:3000`,
  },

  css: ['./app/assets/styles/main.scss'],

  imports: {
    dirs: ['stores', 'utils', 'plugins', 'composables'],
  },

  components: getComponentPaths(),

  app: {
    // titleTemplate: '%s | RITHTHY Fitness',
    rootId: 'riththy',
    rootTag: 'riththy-main',
    baseUrl: '/',
    buildAssetsDir: '_riththy_dragon',
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    dark: true,

    head: {
      htmlAttrs: { lang: 'en', dir: 'ltr' },
      title: 'RITHTHY Fitness — Premier Fitness Training',
      bodyAttrs: {
        class: 'riththy-dragon-fitness',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0a0a0a' },
        { name: 'description', content: 'Premium fitness training in Cambodia led by Mr. Ny Rithy. Strength & conditioning, private and group classes.' },
        { name: 'keywords', content: 'Fitness training Cambodia, Ny Rithy,RITHTHY Fitness' },
        
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'RITHTHY Fitness — Premier Fitness Training' },
        { property: 'og:description', content: 'Train with high-performance athletic conditioning with Master Ny Rithy.' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: '/og-image.jpg' },
        { property: 'og:url', content: 'https://rithymartialfitness.com' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'RITHTHY Fitness' },
        { name: 'twitter:description', content: 'Strength Conditioning in Phnom Penh.' },
        { name: 'twitter:image', content: '/og-image.jpg' },
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
    fallbackLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English',language:'English', file: 'en.json',isotime:'En', flag:'/flags/gb.svg' },
      { code: 'km', iso: 'km-KH', name: 'ខ្មែរ',language:'Khmer', file: 'km.json',isotime:'Kh', flag:'/flags/kh.svg' },
      { code: 'zh', iso: 'zh-CN', name: '中文',language:'Chinese', file: 'zh.json',isotime:'Ch', flag:'/flags/zh.svg' }
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
    // apiBase: `http://${getLocalIp()}:58721`,
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.rithymartialfitness.com',
    wsBase: process.env.NUXT_PUBLIC_WS_BASE || 'wss://api.rithymartialfitness.com/ws',
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://rithymartialfitness.com',
    oauth: {
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      facebookAppId: process.env.NUXT_PUBLIC_FACEBOOK_APP_ID || '',
      tiktokClientKey: process.env.NUXT_PUBLIC_TIKTOK_CLIENT_KEY || '',
      telegramBotName: process.env.NUXT_PUBLIC_TELEGRAM_BOT_NAME || 'RithyMartialBot',
    },
  },

  nitro: {
    preset: 'vercel'
    // prerender: {
    //   crawlLinks: true,
    //   failOnError: true,

    //   routes: [
    //     '/',
    //     '/about',
    //     '/contact',
    //     '/blog',
    //     '/schedule',
    //     '/services',

    //     ...blogRoutes
    //   ]
    // }
  },
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: '/'
      }
    ],
    // sitemap: 'https://rithymartialfitness.com/sitemap.xml'
  },

  // sitemap: {
  //   gzip: true,
  //   autoLastmod: true,

  //   urls: [
  //     '/',
  //     '/about',
  //     '/services',
  //     '/programs',
  //     '/trainers',
  //     '/portfolio',
  //     '/schedule',
  //     '/testimonials',
  //     '/blog',
  //     '/pricing',
  //     '/faq',
  //     '/contact',

  //     ...blogRoutes
  //   ]
  // },

  vite: {
    esbuild: {
      drop: process.env.NODE_ENV === 'production'
        ? ['console', 'debugger']
        : [],
    },
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
