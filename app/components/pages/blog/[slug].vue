<template>
  <div class="article-page">
    <article v-if="article" class="article-page__article">
      <header class="article-page__hero section">
        <div class="container">
          <RLink to="/blog" class="article-page__back">← {{ t('common.close') || 'Back to Blog' }}</RLink>
          <div class="article-page__cover" data-animate="scale">
            <img :src="article.cover" :alt="article.title" />
          </div>
          <div class="article-page__meta" data-animate="slide-up">
            <span class="article-page__category">{{ article.category }}</span>
            <h1 class="article-page__title">{{ tBy({ en: article.title, km: article.titleBy?.km, zh: article.titleBy?.zh }) }}</h1>
            <div class="article-page__info">
              <span>{{ article.author }}</span>
              <span>{{ formatDate(article.date) }}</span>
              <span>{{ article.readTime }} {{ t('blog.minRead') || 'min read' }}</span>
            </div>
          </div>
        </div>
      </header>

      <section class="article-page__content section">
        <div class="container article-page__content-inner" data-animate="fade">
          <div class="article-page__body" v-html="article.content"></div>
        </div>
      </section>

      <section class="article-page__related section">
        <div class="container">
          <h2 class="section-title" data-animate="slide-up">{{ t('blog.latestArticles') || 'Related Articles' }}</h2>
          <div class="article-page__related-grid">
            <ArticleCard
              v-for="rel in relatedArticles"
              :key="rel.id"
              :article="rel"
            />
          </div>
        </div>
      </section>
    </article>

    <section v-else class="section">
      <div class="container">
        <p class="article-page__not-found">{{ t('blog.noArticles') || 'Article not found' }}</p>
        <RLink to="/blog" class="btn btn--primary">{{ t('common.viewAll') || 'View All Articles' }}</RLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import articlesData from '~/assets/json/articles.json'

const route = useRoute()
const { t } = useI18n()
const { tBy } = useTBy()
const animate = useAnimate()

const articles = Array.isArray(articlesData)
  ? articlesData
  : []

/**
 * Route slug
 */
const slug = computed(() => {
  const value = route.params.slug

  return Array.isArray(value)
    ? value[0]
    : value
})

/**
 * Current article
 */
const article = computed(() => {
  if (!slug.value) {
    return null
  }

  return articles.find(
    item => item?.slug === slug.value
  ) || null
})

/**
 * Related articles
 */
const relatedArticles = computed(() =>
  articles
    .filter(item => item?.slug !== slug.value)
    .slice(0, 3)
)

/**
 * Animation
 */
onMounted(() => {
  animate.init()
})

/**
 * SEO
 */
watch(
  article,
  (value) => {
    if (!value) {
      useSeo('blog')
      return
    }

    const titleText = tBy({
      en: value.title,
      km: value.titleBy?.km,
      zh: value.titleBy?.zh
    })

    const excerptText = tBy({
      en: value.excerpt,
      km: value.excerptBy?.km,
      zh: value.excerptBy?.zh
    })

    useSeo('blog-detail', {
      articleTitle: titleText,
      articleExcerpt: excerptText,
      image: value.cover,
      author: value.author,
      publishedAt: value.date
    })
  },
  {
    immediate: true
  }
)

function formatDate(dateStr) {
  if (!dateStr) {
    return ''
  }

  const date = new Date(dateStr)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.article-page__back {
  display: inline-block;
  margin-bottom: var(--space-2);
  font-size: 0.875rem;
  color: var(--c-muted, #9ca3af);
  transition: color var(--transition-fast, 0.2s);
  text-decoration: none;
}

.article-page__back:hover {
  color: var(--c-primary, #eab308);
}

.article-page__cover {
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  aspect-ratio: 21 / 9;
  margin-bottom: var(--space-3);
}

.article-page__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-page__category {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-primary, #eab308);
  margin-bottom: var(--space-1);
}

.article-page__title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: var(--space-1);
}

.article-page__info {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8125rem;
  color: var(--c-muted, #9ca3af);
}

.article-page__info span:first-child {
  color: var(--c-primary, #eab308);
  font-weight: 600;
}

.article-page__content-inner {
  max-width: 800px;
  margin-inline: auto;
}

.article-page__body {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--c-text, #f3f4f6);
}

.article-page__body :deep(h2) {
  font-family: var(--font-sans);
  font-size: 1.75rem;
  margin-top: var(--space-4, 2rem);
  margin-bottom: var(--space-2, 1rem);
}

.article-page__body :deep(h3) {
  font-family: var(--font-sans);
  font-size: 1.25rem;
  margin-top: var(--space-3, 1.5rem);
  margin-bottom: var(--space-1, 0.5rem);
}

.article-page__body :deep(p) {
  margin-bottom: var(--space-2, 1rem);
  color: var(--c-muted, #9ca3af);
}

.article-page__related-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2, 1rem);
  margin-top: var(--space-3, 1.5rem);
}

@media (min-width: 768px) {
  .article-page__related-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.article-page__not-found {
  font-size: 1.25rem;
  color: var(--c-muted, #9ca3af);
  margin-bottom: var(--space-2, 1rem);
}
</style>
