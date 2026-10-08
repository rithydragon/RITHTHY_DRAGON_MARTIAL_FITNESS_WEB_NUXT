import { computed, unref } from 'vue'
import pageSeoData from '~/assets/json/page_seo.json'
import { useI18n } from '#imports'

/* ────────────────────────────────────────────────────────────────────────────
   SITE CONSTANTS — edit these once, every page picks them up
──────────────────────────────────────────────────────────────────────────── */
const SITE_NAME = 'RTY Fitness' // <- the name Google should show in results
const SITE_ALTERNATE_NAMES = ['RTY FITNESS', 'Rithy Martial & Fitness', 'RTY']
const DEFAULT_SITE_URL = 'https://rtyfitness.riththydragon.site'
const DEFAULT_IMAGE = '/og-image.png' // 1200x630
const LOGO = '/logo.png' // square, >= 112x112 px (adjust to your real file)

const LOCALES = ['en', 'km', 'zh']
const OG_LOCALE = { en: 'en_US', km: 'km_KH', zh: 'zh_CN' }
const DESC_LIMIT = { en: 160, km: 160, zh: 80 }
const PAGE_LABEL = { en: (n) => `Page ${n}`, km: (n) => `ទំព័រ ${n}`, zh: (n) => `第 ${n} 页` }
const HOME_LABEL = { en: 'Home', km: 'ទំព័រដើម', zh: '首页' }

const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
const ROBOTS_NOINDEX = 'noindex, nofollow'

const BUSINESS = {
  telephone: '+855-97-90-53-790',
  priceRange: '$$',
  address: {
    streetAddress: 'Phnom Penh, Cambodia',
    addressLocality: 'Phnom Penh',
    addressCountry: 'KH'
  },
  opening: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '06:00',
      closes: '21:00'
    }
  ],
  founder: { name: 'Mr. Ny Rithy', jobTitle: 'Founder, CEO & Master Trainer' },
  sameAs: [] // add Facebook / YouTube / TikTok / Instagram profile URLs
}

const FALLBACK = {
  title: {
    en: 'RTY Fitness — Martial Arts & Fitness Training in Phnom Penh',
    km: 'RTY Fitness — ការបង្វឹកក្បាច់គុន និងកាយសម្បទា',
    zh: 'RTY Fitness — 金边武术与健身训练'
  },
  description: {
    en: 'Premium Cambodian martial arts training center led by Kru Ny Rithy. Bokator, Kun Khmer, BJJ & Strength Conditioning.',
    km: 'មជ្ឈមណ្ឌលហ្វឹកហាត់ក្បាច់គុនខ្មែរជាន់ខ្ពស់ ដឹកនាំដោយគ្រូនី រិទ្ធី។',
    zh: '由 Kru Ny Rithy 领导的顶级柬埔寨武术训练中心。'
  },
  keywords: {
    en: 'Martial arts Cambodia, Bokator, Kun Khmer, BJJ, Fitness Phnom Penh',
    km: 'ក្បាច់គុនកម្ពុជា, បុកាទ័រ, គុនខ្មែរ, BJJ, ហ្វ៊ីតនេសភ្នំពេញ',
    zh: '柬埔寨武术, 斗狮拳, 高棉拳, 巴西柔术, 金边健身'
  },
  twitterCard: 'summary_large_image'
}

/* ────────────────────────────────────────────────────────────────────────────
   Small helpers
──────────────────────────────────────────────────────────────────────────── */
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

// string | { en, km, zh } -> string for the active locale
function pick(v, loc, fb = '') {
  if (v === undefined || v === null || v === '') return fb
  if (Array.isArray(v)) return v.join(', ')
  if (typeof v === 'string') return v
  if (isObj(v)) return v[loc] || v.en || fb
  return String(v)
}

// first non-empty localized text out of several candidates
function firstText(loc, ...vals) {
  for (const v of vals) {
    const t = pick(v, loc)
    if (t) return t
  }
  return ''
}

// replaces {placeholders}
function fill(str = '', data = {}) {
  let out = String(str || '')
  for (const [k, v] of Object.entries(data || {})) {
    out = out.split(`{${k}}`).join(v === undefined || v === null ? '' : String(v))
  }
  return out
}

const clean = (s = '') => String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

function truncate(s, max) {
  if (s.length <= max) return s
  const cut = s.slice(0, max - 1)
  const i = cut.lastIndexOf(' ')
  return `${(i > max * 0.6 ? cut.slice(0, i) : cut).trimEnd()}…`
}

function toAbs(u, base) {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('//')) return `https:${u}`
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`
}

// An absolute canonical that points at another host (e.g. the API host) would
// make Google ignore this site, so it is re-based onto the public site URL.
function sameSite(u, siteUrl) {
  try {
    const a = new URL(u)
    const b = new URL(siteUrl)
    return a.host === b.host ? u : `${siteUrl}${a.pathname}${a.search}`
  } catch {
    return u
  }
}

function normPath(p = '/') {
  let s = String(p).split(/[?#]/)[0] || '/'
  if (!s.startsWith('/')) s = `/${s}`
  if (s.length > 1) s = s.replace(/\/+$/, '')
  return s || '/'
}

function toIso(v) {
  if (!v) return ''
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

const imgOf = (v) => (typeof v === 'string' ? v : v?.url || v?.src || '')
const shortTitle = (t = '') => String(t).split(/\s+[|—–-]\s+/)[0].trim()

function humanize(seg) {
  let s = seg
  try { s = decodeURIComponent(seg) } catch { /* keep raw */ }
  s = s.replace(/[-_]+/g, ' ').trim()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// drops '', null, undefined and empty arrays/objects so JSON-LD stays valid/clean
function compact(v) {
  if (Array.isArray(v)) {
    const a = v.map(compact).filter((x) => x !== undefined)
    return a.length ? a : undefined
  }
  if (isObj(v)) {
    const o = {}
    for (const [k, x] of Object.entries(v)) {
      const c = compact(x)
      if (c !== undefined) o[k] = c
    }
    return Object.keys(o).length ? o : undefined
  }
  if (v === '' || v === null || v === undefined) return undefined
  return v
}

// API `structuredData` -> flat array of schema nodes.
// Accepts: a single node, an array, { '@graph': [...] }, or a dictionary of named nodes.
function toBlocks(sd) {
  if (!sd || typeof sd !== 'object') return []
  if (Array.isArray(sd)) return sd.flatMap(toBlocks)
  if (Array.isArray(sd['@graph'])) return sd['@graph'].filter(isObj)
  if ('@type' in sd) {
    const { '@context': _ctx, ...rest } = sd
    return [rest]
  }
  return Object.values(sd).flatMap((v) => (isObj(v) ? toBlocks(v) : []))
}

function findStatic(pageId, path) {
  return (
    pageSeoData.pages.find(
      (p) => (pageId && p.id === pageId) || p.path === path || (pageId && p.path === `/${pageId}`)
    ) || null
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Breadcrumbs (BreadcrumbList)
──────────────────────────────────────────────────────────────────────────── */
function buildBreadcrumbs({ siteUrl, path, loc, pageTitle, custom }) {
  if (Array.isArray(custom) && custom.length) {
    return custom
      .map((c) => ({ name: pick(c.name || c.title, loc), url: toAbs(c.url || c.path, siteUrl) }))
      .filter((c) => c.name && c.url)
  }
  const segs = path.split('/').filter(Boolean)
  const prefix = LOCALES.includes(segs[0]) ? `/${segs.shift()}` : ''
  if (!segs.length) return []

  const crumbs = [{ name: HOME_LABEL[loc] || HOME_LABEL.en, url: `${siteUrl}${prefix || '/'}` }]
  segs.forEach((seg, i) => {
    const p = `${prefix}/${segs.slice(0, i + 1).join('/')}`
    const isLast = i === segs.length - 1
    const st = findStatic(null, p)
    const name = isLast
      ? shortTitle(pageTitle) || humanize(seg)
      : shortTitle(pick(st?.title, loc)) || humanize(seg)
    crumbs.push({ name, url: `${siteUrl}${p}` })
  })
  return crumbs
}

/* ────────────────────────────────────────────────────────────────────────────
   Pure builder: input -> normalized SEO model + JSON-LD graph
──────────────────────────────────────────────────────────────────────────── */
function buildSeo({ input, dynamicData, route, locale, siteUrl, switchLocalePath }) {
  const loc = LOCALES.includes(locale) ? locale : 'en'
  const o = isObj(input) ? input : {} // explicit overrides win over everything
  const isPair = isObj(input) && 'object' in input

  let pageId = typeof input === 'string' ? input : o.id || ''
  const path = normPath(o.path || route.path)

  // API envelope ({ status, data, seo }) OR just the seo block
  let envelope = {}
  let seo = {}
  if (isPair) {
    if (typeof o.object === 'string') pageId = pageId || o.object // legacy: object: 'home'
    else if (isObj(o.object)) {
      envelope = o.object
      seo = isObj(envelope.seo)
        ? envelope.seo
        : envelope.metaTitle || envelope.metaDescription || envelope.openGraph
          ? envelope
          : {}
    }
  }

  const item = isObj(o.item) ? o.item : null // detail record, used only as a fallback source
  const og = isObj(seo.openGraph) ? seo.openGraph : {}
  const tw = isObj(seo.twitter) ? seo.twitter : {}
  const matched = findStatic(pageId, path)
  const st = matched?.seo || {}

  const isHome = path === '/' || LOCALES.some((l) => path === `/${l}`)

  // ── placeholders: {total} {page} {pageSize} {siteName} {title} + caller data
  const pagination = envelope.data?.pagination
  const pageNo = Number(pagination?.page || route.query?.page) || 1
  const itemTitle = item ? pick(item.seoTitle || item.metaTitle || item.title || item.name, loc) : ''
  const itemDesc = item
    ? clean(pick(item.metaDescription || item.summary || item.excerpt || item.description, loc))
    : ''
  const itemImage = item ? imgOf(item.ogImage || item.coverImage || item.image || item.thumbnail || item.cover) : ''
  const dyn = {
    siteName: SITE_NAME,
    ...(itemTitle ? { title: itemTitle } : {}),
    ...(pagination ? { total: pagination.total, page: pagination.page, pageSize: pagination.pageSize } : {}),
    ...(dynamicData || {})
  }

  // ── title / description
  const rawTitle = firstText(loc, o.title, seo.metaTitle, og.title, itemTitle, matched?.title, FALLBACK.title)
  let pageTitle = fill(rawTitle, dyn)
  if (pageNo > 1 && !rawTitle.includes('{page}')) {
    pageTitle = `${pageTitle} (${(PAGE_LABEL[loc] || PAGE_LABEL.en)(pageNo)})`
  }
  const hasBrand = pageTitle.toLowerCase().includes(SITE_NAME.toLowerCase())
  const title = isHome || hasBrand ? pageTitle : `${pageTitle} | ${SITE_NAME}`

  const description = truncate(
    clean(fill(firstText(loc, o.description, seo.metaDescription, og.description, itemDesc, matched?.description, FALLBACK.description), dyn)),
    DESC_LIMIT[loc]
  )
  const ogTitle = fill(firstText(loc, o.ogTitle, og.title, seo.ogTitle, st.ogTitle, pageTitle), dyn)
  const ogDescription = truncate(
    clean(fill(firstText(loc, o.ogDescription, og.description, seo.ogDescription, st.ogDescription, description), dyn)),
    200
  )
  const twTitle = fill(firstText(loc, o.twitterTitle, seo.twitterTitle, st.twitterTitle, ogTitle), dyn)
  const twDescription = truncate(
    clean(fill(firstText(loc, o.twitterDescription, seo.twitterDescription, st.twitterDescription, ogDescription), dyn)),
    200
  )
  const keywords = fill(
    firstText(loc, o.keywords, seo.keywords, st.keywords, FALLBACK.keywords),
    dyn
  )

  // ── image (must be absolute for og:image / JSON-LD)
  const rawImage = o.image || imgOf(og.image) || seo.ogImage || itemImage || st.ogImage || DEFAULT_IMAGE
  const image = toAbs(rawImage, siteUrl)
  const isDefaultImage = rawImage === DEFAULT_IMAGE
  const imageWidth = o.imageWidth || og.imageWidth || seo.ogImageWidth || (isDefaultImage ? 1200 : undefined)
  const imageHeight = o.imageHeight || og.imageHeight || seo.ogImageHeight || (isDefaultImage ? 630 : undefined)
  const imageAlt = clean(firstText(loc, o.imageAlt, og.imageAlt, itemTitle, pageTitle))

  // ── type / robots / twitter
  const blogDetail = !!item && /^\/(blog|articles?|news)\//.test(path)
  const type = o.type || og.type || (blogDetail ? 'article' : 'website')
  const isArticle = type === 'article'

  let robots =
    o.robots ||
    (o.noindex ? ROBOTS_NOINDEX : '') ||
    seo.robots ||
    (matched?.requiresAuth ? ROBOTS_NOINDEX : '') ||
    st.robots ||
    ROBOTS_INDEX
  const noindex = /noindex/i.test(robots)
  if (!noindex && !/max-image-preview/i.test(robots)) robots += ', max-image-preview:large, max-snippet:-1'

  const twitterCard = o.twitterCard || tw.card || seo.twitterCard || st.twitterCard || FALLBACK.twitterCard
  const twitterCreator = o.twitterCreator || tw.creator || ''

  // ── dates / author
  const publishedAt = toIso(o.publishedAt || seo.publishedTime || og.publishedTime || item?.publishedAt || item?.createdAt || dyn.publishedAt)
  const modifiedAt = toIso(o.modifiedAt || seo.modifiedTime || og.modifiedTime || item?.updatedAt || item?.modifiedAt || dyn.modifiedAt)
  const author =
    o.author ||
    (typeof item?.author === 'string' ? item.author : item?.author?.name) ||
    dyn.author ||
    BUSINESS.founder.name

  // ── canonical (self-referencing; paginated pages keep their own ?page=N)
  let rawCanon = o.canonical || o.url || seo.canonicalUrl || seo.canonical || st.canonical || ''
  if (rawCanon && rawCanon.includes(':') && !/^https?:/i.test(rawCanon)) {
    Object.entries(dyn).forEach(([k, v]) => { rawCanon = rawCanon.replace(`:${k}`, String(v)) })
  }
  let url = rawCanon ? sameSite(toAbs(rawCanon, siteUrl), siteUrl) : `${siteUrl}${path === '/' ? '/' : path}`
  if (!rawCanon && pageNo > 1) url += `?page=${pageNo}`

  // ── hreflang (only when locales have their own URLs, see config.public.i18nPrefix)
  let alternates = []
  if (switchLocalePath && !noindex) {
    alternates = LOCALES.map((l) => ({ hreflang: l, href: `${siteUrl}${switchLocalePath(l)}` }))
    alternates.push({ hreflang: 'x-default', href: `${siteUrl}${switchLocalePath('en')}` })
  }

  /* ── JSON-LD @graph ─────────────────────────────────────────────────────── */
  const orgId = `${siteUrl}/#organization`
  const siteId = `${siteUrl}/#website`
  const pageNodeId = `${url}#webpage`

  const organization = {
    '@type': 'HealthClub',
    '@id': orgId,
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url: `${siteUrl}/`,
    description: pick(FALLBACK.description, loc),
    logo: { '@type': 'ImageObject', url: toAbs(LOGO, siteUrl) },
    image: toAbs(DEFAULT_IMAGE, siteUrl),
    telephone: BUSINESS.telephone,
    priceRange: BUSINESS.priceRange,
    address: { '@type': 'PostalAddress', ...BUSINESS.address },
    areaServed: 'Phnom Penh, Cambodia',
    openingHoursSpecification: BUSINESS.opening.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes
    })),
    founder: { '@type': 'Person', ...{ name: BUSINESS.founder.name, jobTitle: BUSINESS.founder.jobTitle } },
    sameAs: BUSINESS.sameAs
  }

  // Google reads the site name from WebSite markup on the HOMEPAGE
  const website = isHome
    ? {
        '@type': 'WebSite',
        '@id': siteId,
        url: `${siteUrl}/`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        inLanguage: LOCALES,
        publisher: { '@id': orgId }
      }
    : null

  const crumbs = isHome ? [] : buildBreadcrumbs({ siteUrl, path, loc, pageTitle, custom: o.breadcrumbs || seo.breadcrumbs })
  const breadcrumb = crumbs.length >= 2
    ? {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url }))
      }
    : null

  const schemaPageType =
    o.pageType ||
    matched?.schemaType ||
    (/^\/(en|km|zh)?\/?contact/.test(path) ? 'ContactPage'
      : /^\/(en|km|zh)?\/?about/.test(path) ? 'AboutPage'
        : pagination && !item ? 'CollectionPage' : 'WebPage')

  const webpage = {
    '@type': schemaPageType,
    '@id': pageNodeId,
    url,
    name: pageTitle,
    description,
    inLanguage: loc,
    isPartOf: { '@id': siteId },
    about: { '@id': orgId },
    primaryImageOfPage: { '@type': 'ImageObject', url: image },
    breadcrumb: breadcrumb ? { '@id': breadcrumb['@id'] } : undefined,
    datePublished: publishedAt,
    dateModified: modifiedAt
  }

  const article = isArticle
    ? {
        '@type': /\/blog\//.test(path) ? 'BlogPosting' : 'Article',
        '@id': `${url}#article`,
        mainEntityOfPage: { '@id': pageNodeId },
        headline: truncate(pageTitle, 110),
        description,
        image: [image],
        inLanguage: loc,
        datePublished: publishedAt,
        dateModified: modifiedAt || publishedAt,
        author: { '@type': 'Person', name: author },
        publisher: { '@id': orgId }
      }
    : null

  // API-provided blocks win over generated nodes of the same @type
  const apiBlocks = toBlocks(seo.structuredData || o.structuredData)
  const apiTypes = new Set(apiBlocks.flatMap((b) => [].concat(b['@type'] || [])))
  const generated = [organization, website, webpage, breadcrumb, article]
    .filter(Boolean)
    .filter((n) => ![].concat(n['@type']).some((t) => apiTypes.has(t)))

  const graph = compact({ '@context': 'https://schema.org', '@graph': [...generated, ...apiBlocks] })

  return {
    loc, title, pageTitle, description, ogTitle, ogDescription, twTitle, twDescription,
    keywords, image, imageWidth, imageHeight, imageAlt, type, isArticle, robots, noindex,
    twitterCard, twitterCreator, publishedAt, modifiedAt, author, url, alternates, graph,
    matchedPage: matched
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   useSeo
   ────
   Call it ONCE at the top level of <script setup>, after `await`-ing your data,
   and pass a GETTER so it stays reactive to route / locale / API data:

     useSeo('about')                                          // static page_seo.json
     useSeo({ title, description, image, noindex })           // explicit
     useSeo(() => ({ path: route.path, object: data.value })) // API-driven (preferred)
     useSeo(() => ({ path, object: data.value, item }))       // detail / slug route

   Extra options (any style): id, path, item, breadcrumbs[], structuredData,
   canonical, robots, noindex, type ('article'), pageType, publishedAt,
   modifiedAt, author, image, imageAlt, ogTitle, twitterCreator …
──────────────────────────────────────────────────────────────────────────── */
export function useSeo(input = {}, dynamicData = null) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const { locale } = useI18n()
  const siteUrl = String(config.public.siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '')
  // set runtimeConfig.public.i18nPrefix = true only if URLs look like /km/..., /zh/...
  const switchLocalePath = config.public.i18nPrefix ? useSwitchLocalePath() : null

  const resolve = (v) => (typeof v === 'function' ? v() : unref(v))

  const model = computed(() =>
    buildSeo({
      input: resolve(input),
      dynamicData: resolve(dynamicData),
      route,
      locale: locale?.value,
      siteUrl,
      switchLocalePath
    })
  )

  useSeoMeta(() => {
    const m = model.value
    return {
      title: m.title,
      description: m.description,
      robots: m.robots,
      keywords: m.keywords,
      ogTitle: m.ogTitle,
      ogDescription: m.ogDescription,
      ogImage: m.image,
      ogImageAlt: m.imageAlt,
      ogImageWidth: m.imageWidth,
      ogImageHeight: m.imageHeight,
      ogUrl: m.url,
      ogType: m.type,
      ogSiteName: SITE_NAME,
      ogLocale: OG_LOCALE[m.loc],
      ogLocaleAlternate: LOCALES.filter((l) => l !== m.loc).map((l) => OG_LOCALE[l]),
      twitterCard: m.twitterCard,
      twitterTitle: m.twTitle,
      twitterDescription: m.twDescription,
      twitterImage: m.image,
      twitterImageAlt: m.imageAlt,
      ...(m.twitterCreator ? { twitterCreator: m.twitterCreator } : {}),
      ...(m.isArticle
        ? {
            articlePublishedTime: m.publishedAt || undefined,
            articleModifiedTime: m.modifiedAt || undefined,
            articleAuthor: [m.author]
          }
        : {})
    }
  })

  useHead(() => {
    const m = model.value
    return {
      titleTemplate: '%s', // the full title is built here; prevents double "| RTY Fitness"
      meta: [{ name: 'application-name', content: SITE_NAME }],
      link: [
        { rel: 'canonical', href: m.url },
        ...m.alternates.map((a) => ({ rel: 'alternate', hreflang: a.hreflang, href: a.href }))
      ],
      script: [
        {
          key: 'ld-json-graph', // one graph, replaced (not duplicated) on navigation
          type: 'application/ld+json',
          innerHTML: JSON.stringify(m.graph).replace(/</g, '\\u003c')
        }
      ]
    }
  })

  return {
    model,
    page: computed(() => model.value.matchedPage),
    title: computed(() => model.value.title),
    description: computed(() => model.value.description),
    ogImage: computed(() => model.value.image),
    url: computed(() => model.value.url),
    keywords: computed(() => model.value.keywords),
    robots: computed(() => model.value.robots),
    noindex: computed(() => model.value.noindex)
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   Other helpers (unchanged API)
──────────────────────────────────────────────────────────────────────────── */
export function usePageData(pageId) {
  return pageSeoData.pages.find((p) => p.id === pageId) || null
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

  return computed(() =>
    navIds
      .map((id) => {
        const page = pageSeoData.pages.find((p) => p.id === id)
        if (!page) return null
        return {
          id: page.id,
          path: page.path,
          title: pick(page.title, locale.value, id),
          requiresAuth: page.requiresAuth
        }
      })
      .filter(Boolean)
  )
}