import getComponentPaths from './app/utils/getComponentPaths'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  // ssr: false, //Hydration completed but contains mismatches

  modules: ['@pinia/nuxt',
    // '@nuxtjs/tailwindcss', 
    '@nuxtjs/i18n',],
  imports: {
    dirs: ['stores', 'utils', 'app', 'plugins', 'composables'],
  },

  devServer:{
    host:'0,0,0,0',
    port:3001
  },
  components: getComponentPaths(),
  css: ['~/assets/styles/main.scss'],

  app: {
    titleTemplate: '%s | RamaGallery',
    rootId: 'riththy',  // Custom root element ID
    rootTag: 'riththy-main',  // Custom root element tag
    baseUrl: '/',  // Base URL for routing
    buildAssetsDir: '_riththy_portfolio',  // Directory for build assets
    pageTransition: { name: 'page', mode: 'out-in' },  // Page transition animation
    layoutTransition: { name: 'layout', mode: 'out-in' },  // Layout transition animation
    head: {
      title: 'Ny Rithy | នី រិទ្ធី — Portfolio', // Default title for your app
      // htmlAttrs: { lang: 'en'},  // Language attribute for the HTML element
      bodyAttrs: {
        class: 'riththy-portfolio',  // Custom class for body element
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Ny Rithy — Full Stack Developer & Creative Technologist' },
        // Open Graph
        { property: "og:title", content: "Ny Rithy | Full Stack Developer" },
        { property: "og:description", content: "Full Stack Developer & Creative Technologist" },
        { property: "og:image", content: "https://riththy-portfolio.vercel.app/images/og-image.jpg" },
        { property: "og:url", content: "https://riththy-portfolio.vercel.app" },
        { property: "og:type", content: "website" },

        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Ny Rithy | Full Stack Developer" },
        { name: "twitter:description", content: "Full Stack Developer & Creative Technologist" },
        { name: "twitter:image", content: "https://riththy-portfolio.vercel.app/images/og-image.jpg" }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Battambang:wght@300;400;700&display=swap'
        },
        // {
        //   rel: 'stylesheet',
        //   href: 'https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css'
        // },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.6.0/remixicon.css' },
      ]
    }
  },
  // i18n configuration
  i18n: {
    lazy: true,
    langDir: 'locales/',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'km', iso: 'km-KH', name: 'Khmer', file: 'km.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    compilation: {
      strictMessage: false,
    },
    bundle: {
      optimizeTranslationDirective: true, // Explicitly disable
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  tailwindcss: {
    config: {
      darkMode: 'class',
      theme: {
        extend: {}
      }
    }
  }
})
