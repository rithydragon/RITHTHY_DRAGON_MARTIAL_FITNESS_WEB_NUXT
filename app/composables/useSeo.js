import pageSeoData from '~/assets/json/page_seo.json'

function getLocaleText(textObj, locale, fallbackStr = '') {
  if (!textObj) return fallbackStr
  if (typeof textObj === 'string') return textObj
  return textObj[locale] || textObj.en || fallbackStr
}

function processTemplate(str = '', dynamicData = {}) {
  if (!str) return ''
  let result = str
  Object.keys(dynamicData).forEach((key) => {
    const val = dynamicData[key] !== undefined && dynamicData[key] !== null ? String(dynamicData[key]) : ''
    result = result.replace(new RegExp(`{${key}}`, 'g'), val)
  })
  return result
}

export function useSeo(input = {}, dynamicData = null) {
  const config = useRuntimeConfig()
  const siteUrl = config.public.apiBase || 'https://rithymartialfitness.com'
  const { locale } = useI18n()
  const route = useRoute()

  const currentLocale = ['en', 'km', 'zh'].includes(locale?.value) ? locale.value : 'en'

  // Standard Fallback Values
  const fallback = {
    title: {
      en: 'Rithy Martial & Fitness — Combat & Fitness Training',
      km: 'រិទ្ធី ម៉ាសល & ហ្វ៊ីតនេស — ការបង្វឹកក្បាច់គុន និងកាយសម្បទា',
      zh: 'Rithy 武术与健身 — 搏击与健身训练'
    },
    description: {
      en: 'Premium Cambodian martial arts training center led by Kru Ny Rithy. Bokator, Kun Khmer, BJJ & Strength Conditioning.',
      km: 'មជ្ឈមណ្ឌលហ្វឹកហាត់ក្បាច់គុនខ្មែរជាន់ខ្ពស់ ដឹកនាំដោយគ្រូនី រិទ្ធី។',
      zh: '由 Kru Ny Rithy 领导的顶级柬埔寨武术训练中心。'
    },
    ogImage: '/og-image.jpg',
    twitterCard: 'summary_large_image',
    keywords: {
      en: 'Martial arts Cambodia, Bokator, Kun Khmer, BJJ, Fitness Phnom Penh',
      km: 'ក្បាច់គុនកម្ពុជា, បុកាទ័រ, គុនខ្មែរ, BJJ, ហ្វ៊ីតនេសភ្នំពេញ',
      zh: '柬埔寨武术, 斗狮拳, 高棉拳, 巴西柔术, 金边健身'
    },
    robots: 'index, follow'
  }

  let title = ''
  let description = ''
  let image = ''
  let url = ''
  let type = 'website'
  let publishedAt = ''
  let modifiedAt = ''
  let author = ''
  let noindex = false
  let keywords = ''
  let twitterCard = 'summary_large_image'
  let robots = 'index, follow'
  let matchedPage = null

  // Case A: input is string (pageId or route path or slug)
  if (typeof input === 'string') {
    const pageId = input || route.name || (typeof route.params.slug === 'string' ? route.params.slug : 'home')
    matchedPage = pageSeoData.pages.find((p) => p.id === pageId || p.path === route.path || p.path === `/${pageId}`)

    const baseTitle = getLocaleText(matchedPage?.title, currentLocale, fallback.title[currentLocale] || fallback.title.en)
    const baseDescription = getLocaleText(matchedPage?.description, currentLocale, fallback.description[currentLocale] || fallback.description.en)

    title = baseTitle
    description = baseDescription

    if (dynamicData) {
      title = processTemplate(title, dynamicData)
      description = processTemplate(description, dynamicData)
    }

    let ogTitle = getLocaleText(matchedPage?.seo?.ogTitle, currentLocale, title)
    let ogDescription = getLocaleText(matchedPage?.seo?.ogDescription, currentLocale, description)
    let twTitle = getLocaleText(matchedPage?.seo?.twitterTitle, currentLocale, ogTitle)
    let twDescription = getLocaleText(matchedPage?.seo?.twitterDescription, currentLocale, ogDescription)
    keywords = getLocaleText(matchedPage?.seo?.keywords, currentLocale, fallback.keywords[currentLocale] || fallback.keywords.en)

    if (dynamicData) {
      ogTitle = processTemplate(ogTitle, dynamicData)
      ogDescription = processTemplate(ogDescription, dynamicData)
      twTitle = processTemplate(twTitle, dynamicData)
      twDescription = processTemplate(twDescription, dynamicData)
      keywords = processTemplate(keywords, dynamicData)
      if (dynamicData.image) image = dynamicData.image
      if (dynamicData.author) author = dynamicData.author
      if (dynamicData.publishedAt) publishedAt = dynamicData.publishedAt
      if (dynamicData.type) type = dynamicData.type
    }

    title = title || ogTitle
    description = description || ogDescription
    image = image || matchedPage?.seo?.ogImage || fallback.ogImage
    twitterCard = matchedPage?.seo?.twitterCard || fallback.twitterCard
    robots = matchedPage?.seo?.robots || fallback.robots
    noindex = robots.includes('noindex')

    let canonicalPath = matchedPage?.seo?.canonical || matchedPage?.path || route.path
    if (dynamicData && canonicalPath.includes(':')) {
      Object.keys(dynamicData).forEach((k) => {
        canonicalPath = canonicalPath.replace(`:${k}`, String(dynamicData[k]))
      })
    }
    url = canonicalPath.startsWith('http') ? canonicalPath : `${siteUrl}${canonicalPath}`
    if (pageId?.includes('blog') || pageId?.includes('article')) type = 'article'
  }
  // Case B: input is Object
  else if (typeof input === 'object' && input !== null) {
    title = input.title || 'Rithy Martial & Fitness — Premium Cambodian Martial Arts & Fitness Training'
    description = input.description || 'Premium martial arts and fitness training in Cambodia led by Mr. Ny Rithy. Bokator, Yuthakram Khom, Pradal Serey, BJJ, and strength & conditioning.'
    image = input.image || '/og-image.jpg'
    url = input.url ? (input.url.startsWith('http') ? input.url : `${siteUrl}${input.url}`) : siteUrl
    type = input.type || 'website'
    publishedAt = input.publishedAt || ''
    modifiedAt = input.modifiedAt || ''
    author = input.author || 'Mr. Ny Rithy'
    noindex = !!input.noindex
    keywords = input.keywords || 'Cambodian Martial Arts, Bokator, Kun Khmer, Pradal Serey, BJJ, Strength and Conditioning, Phnom Penh Gym'
    twitterCard = input.twitterCard || 'summary_large_image'
    robots = noindex ? 'noindex, nofollow' : (input.robots || 'index, follow')
  }

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogUrl: url,
    ogType: type,
    ogSiteName: 'Rithy Martial & Fitness',
    twitterCard,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    keywords,
    robots
  })

  // Schema markup
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'SportsActivityLocation'],
    name: 'Rithy Martial & Fitness',
    description: 'Premium Cambodian martial arts and fitness training center.',
    founder: {
      '@type': 'Person',
      name: 'Mr. Ny Rithy',
      jobTitle: 'Founder, CEO & Master Trainer',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Phnom Penh, Cambodia',
      addressLocality: 'Phnom Penh',
      addressCountry: 'KH',
    },
    telephone: '+855-12-345-678',
    openingHours: ['Mo-Sa 06:00-21:00'],
    priceRange: '$$',
    ...(type === 'article' ? {
      '@type': 'Article',
      headline: title,
      datePublished: publishedAt,
      dateModified: modifiedAt,
      author: { '@type': 'Person', name: author || 'Mr. Ny Rithy' },
      image: image,
    } : {}),
  }

  useHead({
    htmlAttrs: {
      lang: currentLocale === 'km' ? 'km' : currentLocale === 'zh' ? 'zh' : 'en'
    },
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      },
    ],
  })

  return {
    page: matchedPage,
    title,
    description,
    ogImage: image,
    url,
    keywords,
    robots
  }
}

export function usePageData(pageId) {
  const page = pageSeoData.pages.find((p) => p.id === pageId)
  return page || null
}

export function getAllPages() {
  return pageSeoData.pages
}

export function getPublicPages() {
  return pageSeoData.pages.filter((p) => !p.requiresAuth)
}

export function useNavigation() {
  const { locale } = useI18n()
  const navIds = ['home', 'services', 'programs', 'trainers', 'portfolio', 'schedule', 'testimonials', 'blog', 'about', 'contact']
  
  return navIds
    .map((id) => {
      const page = pageSeoData.pages.find((p) => p.id === id)
      if (!page) return null
      return {
        id: page.id,
        path: page.path,
        title: getLocaleText(page.title, locale.value, page.title.en),
        requiresAuth: page.requiresAuth
      }
    })
    .filter(Boolean)
}
