<template>
  <article class="article-card card" data-animate="slide-up">
    <NuxtLink :to="localePath(`/blog/${article.slug}`)" class="article-card__link">
      <div class="article-card__image">
        <img :src="article.cover" :alt="article.title" loading="lazy" />
        <span class="article-card__category">{{ article.category }}</span>
      </div>
      <div class="article-card__body">
        <h3 class="article-card__title">{{ tBy({ en: article.title, km: article.titleBy?.km, zh: article.titleBy?.zh }) }}</h3>
        <p class="article-card__excerpt">{{ tBy({ en: article.excerpt, km: article.excerptBy?.km, zh: article.excerptBy?.zh }) }}</p>
        <footer class="article-card__meta">
          <span class="article-card__author">{{ article.author }}</span>
          <span class="article-card__date">{{ formatDate(article.date) }}</span>
          <span class="article-card__read">{{ article.readTime }} {{ t('blog.minRead') }}</span>
        </footer>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
interface Article {
  id: number
  slug: string
  title: string
  titleBy?: { en?: string; km?: string; zh?: string }
  excerpt: string
  excerptBy?: { en?: string; km?: string; zh?: string }
  cover: string
  author: string
  date: string
  readTime: number
  category: string
}

const props = defineProps<{ article: Article }>()
const { t } = useI18n()
const { tBy } = useTBy()

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.article-card {
  padding: 0;
  overflow: hidden;
}

.article-card__link {
  display: block;
  color: inherit;
  height: 100%;
}

.article-card__image {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-slow);
  }
}

.article-card__link:hover .article-card__image img {
  transform: scale(1.08);
}

.article-card__category {
  position: absolute;
  top: var(--space-1);
  left: var(--space-1);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  background: var(--c-overlay);
  backdrop-filter: blur(8px);
  color: var(--c-primary);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.article-card__body {
  padding: var(--space-3);
}

.article-card__title {
  font-family: var(--font-sans);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: var(--space-1);
  transition: color var(--transition-fast);
}

.article-card__link:hover .article-card__title {
  color: var(--c-primary);
}

.article-card__excerpt {
  font-size: 0.875rem;
  color: var(--c-muted);
  line-height: 1.5;
  margin-bottom: var(--space-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--c-muted);
}

.article-card__author {
  color: var(--c-primary);
  font-weight: 600;
}

.article-card__date::before {
  content: '·';
  margin-right: 0.5rem;
}

.article-card__read::before {
  content: '·';
  margin-right: 0.5rem;
}
</style>
