import pageSeoData from '~/assets/json/page_seo.json'
import { useI18n } from '#imports'

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

// Turns a `structuredData` block into one or more JSON-LD <script> entries.
// Accepts either a single schema object ({ "@type": ... }) or a dictionary
// of named schema blocks ({ product: {...}, breadcrumb: {...} }) — which is
// how the API's `structuredData: { additionalProp1: {} }` shape resolves.
function toStructuredDataBlocks(structuredData) {
  if (!structuredData || typeof structuredData !== 'object') return []
  if ('@type' in structuredData || '@context' in structuredData) return [structuredData]
  return Object.values(structuredData).filter((v) => v && typeof v === 'object')
}

/**
 * useSeo — three call styles:
 *
 * 1) useSeo(pageId | undefined, dynamicData?)
 *    Looks up a page by id/path in assets/json/page_seo.json (static SEO).
 *
 * 2) useSeo({ title, description, url, ... })
 *    Fully explicit, page-authored SEO (no lookup).
 *
 * 3) useSeo({ path, object }, dynamicData?)
 *    API-driven SEO. `object` is the raw API response (or just its `seo`
 *    block) matching the backend's SEO schema — metaTitle, metaDescription,
 *    canonicalUrl, robots, openGraph, twitter, structuredData, etc.
 *    `path` is the route path, used both for the canonical URL and as the
 *    lookup key into page_seo.json for any fields the API response omits.
 *    This is the one to use for API-backed listing/detail pages so SEO
 *    stays correct across the whole site without duplicating logic per page.
 */
export function useSeo(input = {}, dynamicData = null) {
  console.log("useSeo input ==============>", input)
  console.log("useSeo dynamicData ==============>", dynamicData)
  const config = useRuntimeConfig()
  const siteUrl = config.public.apiBase || 'https://rtyfitness.riththydragon.site'
  const { locale } = useI18n()
  const route = useRoute()

  const currentLocale = ['en', 'km', 'zh'].includes(locale?.value) ? locale.value : 'en'

  // Standard Fallback Values
  const fallback = {
    title: {
      en: 'Rithy & Fitness — Combat & Fitness Training',
      km: 'រិទ្ធី ម៉ាសល & ហ្វ៊ីតនេស — ការបង្វឹកក្បាច់គុន និងកាយសម្បទា',
      zh: 'Rithy 武术与健身 — 搏击与健身训练'
    },
    description: {
      en: 'Premium Cambodian martial arts training center led by Kru Ny Rithy. Bokator, Kun Khmer, BJJ & Strength Conditioning.',
      km: 'មជ្ឈមណ្ឌលហ្វឹកហាត់ក្បាច់គុនខ្មែរជាន់ខ្ពស់ ដឹកនាំដោយគ្រូនី រិទ្ធី។',
      zh: '由 Kru Ny Rithy 领导的顶级柬埔寨武术训练中心。'
    },
    ogImage: '/og-image.png',
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
  let imageAlt = ''
  let imageWidth = 1200
  let imageHeight = 630
  let url = ''
  let type = 'website'
  let publishedAt = ''
  let modifiedAt = ''
  let author = ''
  let noindex = false
  let keywords = ''
  let twitterCard = 'summary_large_image'
  let twitterCreator = ''
  let robots = 'index, follow'
  let matchedPage = null
  let structuredDataBlocks = []

  // ── Case A: input is a string (pageId / route path / slug) ────────────────
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

  // ── Case B: input is { path, object } — API-driven SEO ─────────────────────
  else if (typeof input === 'object' && input !== null && 'object' in input) {
    const apiPath = input.path || route.path
    const apiResponse = input.object || {}
    // Accept either the full API envelope ({ data, seo }) or the seo block itself
    const seo = apiResponse.seo || (apiResponse.metaTitle ? apiResponse : {})

    // Auto-expose a few common list fields for {placeholder} templating
    // (e.g. metaTitle: "Artists — page {page}") without the caller
    // having to wire them up manually.
    const pagination = apiResponse.data?.pagination
    const mergedDynamicData = {
      ...(pagination
        ? { total: pagination.total, page: pagination.page, pageSize: pagination.pageSize }
        : {}),
      ...(dynamicData || {})
    }

    // Static page as the lowest-priority fallback layer for this path
    matchedPage = pageSeoData.pages.find((p) => p.path === apiPath)
    const staticTitle = getLocaleText(matchedPage?.title, currentLocale, fallback.title[currentLocale] || fallback.title.en)
    const staticDescription = getLocaleText(matchedPage?.description, currentLocale, fallback.description[currentLocale] || fallback.description.en)

    // API values win whenever present
    title = seo.metaTitle || staticTitle
    description = seo.metaDescription || staticDescription

    if (Object.keys(mergedDynamicData).length) {
      title = processTemplate(title, mergedDynamicData)
      description = processTemplate(description, mergedDynamicData)
    }

    const og = seo.openGraph || {}
    const tw = seo.twitter || {}

    let ogTitle = og.title || getLocaleText(seo.ogTitle, currentLocale, title)
    let ogDescription = og.description || getLocaleText(seo.ogDescription, currentLocale, description)
    let twTitle = getLocaleText(seo.twitterTitle, currentLocale, ogTitle)
    let twDescription = getLocaleText(seo.twitterDescription, currentLocale, ogDescription)
    keywords = getLocaleText(seo.keywords, currentLocale, fallback.keywords[currentLocale] || fallback.keywords.en)

    if (Object.keys(mergedDynamicData).length) {
      ogTitle = processTemplate(ogTitle, mergedDynamicData)
      ogDescription = processTemplate(ogDescription, mergedDynamicData)
      twTitle = processTemplate(twTitle, mergedDynamicData)
      twDescription = processTemplate(twDescription, mergedDynamicData)
      keywords = processTemplate(keywords, mergedDynamicData)
    }

    title = title || ogTitle
    description = description || ogDescription
    image = og.image || seo.ogImage || matchedPage?.seo?.ogImage || fallback.ogImage
    imageAlt = og.imageAlt || title
    imageWidth = seo.ogImageWidth || imageWidth
    imageHeight = seo.ogImageHeight || imageHeight
    type = og.type || 'website'
    twitterCard = tw.card || seo.twitterCard || matchedPage?.seo?.twitterCard || fallback.twitterCard
    twitterCreator = tw.creator || ''
    robots = seo.robots || matchedPage?.seo?.robots || fallback.robots
    noindex = robots.includes('noindex')
    structuredDataBlocks = toStructuredDataBlocks(seo.structuredData)

    const canonicalPath = seo.canonicalUrl || seo.canonical || matchedPage?.seo?.canonical || apiPath
    url = canonicalPath.startsWith('http') ? canonicalPath : `${siteUrl}${canonicalPath}`
    if (apiPath?.includes('blog') || apiPath?.includes('article')) type = type || 'article'
  }

  // ── Case C: input is a plain explicit SEO object ────────────────────────────
  else if (typeof input === 'object' && input !== null) {
    title = input.title || 'RTY Fitness — Premium Fitness Training'
    description = input.description || 'Premium fitness training in Cambodia led by Mr. Ny Rithy. Strength & Conditioning.'
    image = input.image || '/og-image.png'
    url = input.url ? (input.url.startsWith('http') ? input.url : `${siteUrl}${input.url}`) : siteUrl
    type = input.type || 'website'
    publishedAt = input.publishedAt || ''
    modifiedAt = input.modifiedAt || ''
    author = input.author || 'Mr. Ny Rithy'
    noindex = !!input.noindex
    keywords = input.keywords || 'Fitness, Strength & Conditioning, Phnom Penh Gym'
    twitterCard = input.twitterCard || 'summary_large_image'
    twitterCreator = input.twitterCreator || ''
    robots = noindex ? 'noindex, nofollow' : (input.robots || 'index, follow')
  }

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogImageAlt: imageAlt || title,
    ogImageWidth: imageWidth,
    ogImageHeight: imageHeight,
    ogUrl: url,
    ogType: type,
    ogSiteName: 'Rithy Workout & Fitness',
    twitterCard,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    ...(twitterCreator ? { twitterCreator } : {}),
    keywords,
    robots
  })

  // Base business schema, always present
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'SportsActivityLocation'],
    name: 'Rithy Workout & Fitness',
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

  const scripts = [
    { type: 'application/ld+json', innerHTML: JSON.stringify(schema) },
    ...structuredDataBlocks.map((block) => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(block),
    })),
  ]

  useHead({
    htmlAttrs: {
      lang: currentLocale === 'km' ? 'km' : currentLocale === 'zh' ? 'zh' : 'en'
    },
    link: [
      // Canonical was previously only sent as og:url — real crawlers look for
      // this tag specifically, so it's now emitted explicitly.
      { rel: 'canonical', href: url }
    ],
    script: scripts,
  })

  return {
    page: matchedPage,
    title,
    description,
    ogImage: image,
    url,
    keywords,
    robots,
    noindex
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
