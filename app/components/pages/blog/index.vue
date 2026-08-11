<template>
  <div class="blog-page">
    <!-- Blog Hero & Featured Story -->
    <section class="blog-hero section">
      <div class="container">
        <div class="blog-hero__header" data-animate="fade">
          <SectionHeader
            :eyebrow="t('blog.eyebrow') || 'KNOWLEDGE & HERITAGE'"
            :title="t('blog.title') || 'Martial Arts & Fighter Dispatch'"
            :subtitle="t('blog.subtitle') || 'Insights on 1,000-year Bokator history, Kun Khmer striking techniques, BJJ ground game, and high-performance nutrition by Kru Ny Rithy.'"
            centered
          />
        </div>

        <!-- Featured Article Highlight Banner -->
        <div v-if="featuredArticle" class="featured-banner card" data-animate="scale" data-delay="100">
          <div class="featured-banner__image-wrap">
            <img :src="featuredArticle.cover" :alt="getArticleTitle(featuredArticle)" class="featured-banner__image" />
            <span class="featured-banner__badge">FEATURED ARTICLE</span>
          </div>

          <div class="featured-banner__body">
            <div class="featured-banner__meta">
              <span><i class="ri-user-star-line"></i> {{ featuredArticle.author }}</span>
              <span><i class="ri-calendar-event-line"></i> {{ formatDate(featuredArticle.date) }}</span>
              <span><i class="ri-time-line"></i> {{ featuredArticle.readTime }} {{ t('blog.minRead') || 'min read' }}</span>
            </div>

            <h2 class="featured-banner__title">{{ getArticleTitle(featuredArticle) }}</h2>
            <p class="featured-banner__excerpt">{{ getArticleExcerpt(featuredArticle) }}</p>

            <div class="featured-banner__action">
              <RLink :to="`/blog/${featuredArticle.slug}`" class="btn btn--primary">
                Read Featured Story <i class="ri-arrow-right-line"></i>
              </RLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Search & Category Filters -->
    <section class="blog-controls section">
      <div class="container">
        <div class="blog-controls__bar" data-animate="slide-up">
          <!-- Search Bar -->
          <div class="blog-search">
            <i class="ri-search-2-line blog-search__icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              class="blog-search__input"
              placeholder="Search articles by title, topic, or keyword..."
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="blog-search__clear" aria-label="Clear search">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <!-- Category Filter Pills -->
          <div class="blog-categories">
            <button
              v-for="cat in categories"
              :key="cat.id"
              :class="['blog-category-pill', { 'is-active': selectedCategory === cat.id }]"
              @click="selectedCategory = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Active Filter Meta info -->
        <div class="blog-meta-bar" data-animate="fade">
          <span>Showing <strong>{{ filteredArticles.length }}</strong> articles</span>
          <button v-if="selectedCategory !== 'all' || searchQuery" @click="resetFilters" class="blog-reset-btn">
            Reset Filters <i class="ri-refresh-line"></i>
          </button>
        </div>

        <!-- Articles Grid -->
        <div class="blog-grid">
          <ArticleCard
            v-for="(article, idx) in filteredArticles"
            :key="article.id || idx"
            :article="article"
            data-animate="slide-up"
            :data-delay="String(((idx % 3) + 1) * 100)"
          />
        </div>

        <!-- Empty State -->
        <div v-if="filteredArticles.length === 0" class="blog-empty card" data-animate="fade">
          <i class="ri-article-line blog-empty__icon"></i>
          <h3>No Articles Found</h3>
          <p>We couldn't find any articles matching your search criteria <strong>"{{ searchQuery }}"</strong>.</p>
          <button @click="resetFilters" class="btn btn--outline btn--sm">
            Clear Search & Filters
          </button>
        </div>
      </div>
    </section>

    <!-- Fighter Dispatch Newsletter Box -->
    <section class="blog-newsletter section" data-animate="scale">
      <div class="container">
        <div class="newsletter-card">
          <div class="newsletter-card__content">
            <span class="eyebrow">FIGHTER DISPATCH</span>
            <h2>Subscribe to Master Rithy's Weekly Insights</h2>
            <p>Get exclusive breakdowns on ancient Bokator techniques, Kun Khmer fight strategies, and strength conditioning guides delivered straight to your inbox.</p>

            <form v-if="!subscribed" @submit.prevent="handleSubscribe" class="newsletter-form">
              <input
                v-model="newsletterEmail"
                type="email"
                required
                placeholder="Enter your email address..."
                class="newsletter-input"
              />
              <button type="submit" class="btn btn--primary newsletter-btn" :disabled="submitting">
                {{ submitting ? 'Subscribing...' : 'Subscribe Now' }}
              </button>
            </form>

            <div v-else class="newsletter-success">
              <i class="ri-checkbox-circle-fill"></i>
              <span>Thank you! You are now subscribed to Master Rithy's Fighter Dispatch.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import articlesData from '~/assets/json/articles.json'

const { t, locale } = useI18n()
const { tBy } = useTBy()
const animate = useAnimate()

// useSeo('blog')

onMounted(() => {
  animate.init()
})

const articles = ref(Array.isArray(articlesData) ? articlesData : [])
const selectedCategory = ref('all')
const searchQuery = ref('')
const newsletterEmail = ref('')
const submitting = ref(false)
const subscribed = ref(false)

const categories = [
  { id: 'all', label: 'All Articles' },
  { id: 'history', label: 'Bokator History' },
  { id: 'martial-arts', label: 'Kun Khmer & BJJ' },
  { id: 'fitness', label: 'Strength & Fitness' }
]

const featuredArticle = computed(() => {
  if (!Array.isArray(articles.value) || articles.value.length === 0) return null
  return articles.value[0]
})

const filteredArticles = computed(() => {
  if (!Array.isArray(articles.value)) return []

  return articles.value.filter((article) => {
    // Category match
    const matchCategory = selectedCategory.value === 'all' || article.category === selectedCategory.value

    // Search query match
    if (!matchCategory) return false
    if (!searchQuery.value.trim()) return true

    const query = searchQuery.value.toLowerCase()
    const title = getArticleTitle(article).toLowerCase()
    const excerpt = getArticleExcerpt(article).toLowerCase()
    const author = (article.author || '').toLowerCase()

    return title.includes(query) || excerpt.includes(query) || author.includes(query)
  })
})

function getArticleTitle(art) {
  if (!art) return ''
  if (typeof art.title === 'string') return art.title
  return tBy({ en: art.title, km: art.titleBy?.km, zh: art.titleBy?.zh })
}

function getArticleExcerpt(art) {
  if (!art) return ''
  if (typeof art.excerpt === 'string') return art.excerpt
  return tBy({ en: art.excerpt, km: art.excerptBy?.km, zh: art.excerptBy?.zh })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function resetFilters() {
  selectedCategory.value = 'all'
  searchQuery.value = ''
}

async function handleSubscribe() {
  if (!newsletterEmail.value) return
  submitting.value = true
  await new Promise((r) => setTimeout(r, 800))
  submitting.value = false
  subscribed.value = true
}
</script>

<style scoped>
/* Hero & Featured Banner */
.featured-banner {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4, 2rem);
  background: var(--c-surface, #18181c);
  border: 1px solid rgba(234, 179, 8, 0.25);
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  margin-top: var(--space-4, 2rem);
  box-shadow: var(--shadow-md);
}

@media (min-width: 900px) {
  .featured-banner {
    grid-template-columns: 1fr 1fr;
  }
}

.featured-banner__image-wrap {
  position: relative;
  height: 320px;
  overflow: hidden;
}

@media (min-width: 900px) {
  .featured-banner__image-wrap {
    height: 100%;
  }
}

.featured-banner__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.featured-banner:hover .featured-banner__image {
  transform: scale(1.05);
}

.featured-banner__badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: var(--c-primary, #eab308);
  color: #000;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
}

.featured-banner__body {
  padding: var(--space-4, 2rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.featured-banner__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--c-muted, #9ca3af);
  margin-bottom: 0.75rem;

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;

    i {
      color: var(--c-primary, #eab308);
    }
  }
}

.featured-banner__title {
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  line-height: 1.25;
  margin-bottom: 0.75rem;
  color: var(--c-text);
}

.featured-banner__excerpt {
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--c-muted, #9ca3af);
  margin-bottom: 1.5rem;
}

/* Controls Bar & Filters */
.blog-controls__bar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .blog-controls__bar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.blog-search {
  position: relative;
  flex: 1;
  max-width: 480px;
}

.blog-search__icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-muted, #9ca3af);
  font-size: 1.1rem;
}

.blog-search__input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.8rem;
  background: var(--c-surface, #18181c);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-full, 9999px);
  color: var(--c-text);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--c-primary, #eab308);
  }
}

.blog-search__clear {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--c-muted, #9ca3af);
  cursor: pointer;

  &:hover {
    color: var(--c-text);
  }
}

.blog-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.blog-category-pill {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  color: var(--c-muted, #9ca3af);
  padding: 0.5rem 1.1rem;
  border-radius: 20px;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover,
  &.is-active {
    background: var(--c-primary, #eab308);
    color: #000;
    border-color: var(--c-primary, #eab308);
  }
}

.blog-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  color: var(--c-muted, #9ca3af);
}

.blog-reset-btn {
  background: transparent;
  border: none;
  color: var(--c-primary, #eab308);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;

  &:hover {
    text-decoration: underline;
  }
}

/* Articles Grid */
.blog-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4, 2rem);
}

@media (min-width: 640px) {
  .blog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .blog-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Empty State */
.blog-empty {
  text-align: center;
  padding: var(--space-6, 4rem) var(--space-4, 2rem);
  background: var(--c-surface, #18181c);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg, 16px);

  h3 {
    font-size: 1.35rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--c-muted, #9ca3af);
    margin-bottom: 1.5rem;
  }
}

.blog-empty__icon {
  font-size: 3.5rem;
  color: var(--c-primary, #eab308);
  margin-bottom: 1rem;
}

/* Newsletter Box */
.blog-newsletter {
  padding-top: var(--space-6, 4rem);
}

.newsletter-card {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), var(--c-surface));
  border: 1px solid var(--c-primary, #eab308);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-5, 3rem) var(--space-4, 2rem);
  text-align: center;
  box-shadow: var(--shadow-md);
}

.newsletter-card__content {
  max-width: 680px;
  margin: 0 auto;

  h2 {
    font-size: clamp(1.6rem, 3.5vw, 2.5rem);
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 0.95rem;
    color: var(--c-muted, #9ca3af);
    line-height: 1.65;
    margin-bottom: 2rem;
  }
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 500px;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .newsletter-form {
    flex-direction: row;
  }
}

.newsletter-input {
  flex: 1;
  padding: 0.8rem 1.2rem;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-full, 9999px);
  color: var(--c-text);
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: var(--c-primary, #eab308);
  }
}

.newsletter-btn {
  white-space: nowrap;
}

.newsletter-success {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid #22c55e;
  color: #22c55e;
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
