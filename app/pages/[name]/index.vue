<template>
  <div class="detail-page section">
    <div class="container">
      <NuxtLink :to="localePath('/')" class="detail-page__back btn btn--outline btn--sm">
        ← {{ t('common.close') || 'Back' }}
      </NuxtLink>

      <div v-if="item" class="detail-page__card" data-animate="fade">
        <div class="detail-page__hero">
          <img :src="item.image || item.cover" :alt="getTitle(item)" class="detail-page__image" />
          <div class="detail-page__overlay">
            <span class="detail-page__badge">{{ item.category || 'Program Detail' }}</span>
            <h1 class="detail-page__title">{{ getTitle(item) }}</h1>
          </div>
        </div>

        <div class="detail-page__content">
          <p class="detail-page__desc">{{ getDesc(item) }}</p>
          <div v-if="item.content" class="detail-page__body" v-html="item.content"></div>
          
          <div class="detail-page__cta">
            <NuxtLink :to="localePath('/contact')" class="btn btn--primary">Book a Free Trial</NuxtLink>
            <NuxtLink :to="localePath('/schedule')" class="btn btn--outline">View Timetable</NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="detail-page__empty">
        <h2>Item Not Found</h2>
        <p>The requested training program or detail could not be found.</p>
        <NuxtLink :to="localePath('/services')" class="btn btn--primary">View All Services</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import gymData from '~/assets/json/gymData.json'

const route = useRoute()
const { t, locale } = useI18n()

const paramDetail = computed(() => {
  const params = route.params
  if (Array.isArray(params.slug)) {
    return params.slug[params.slug.length - 1]
  }
  return params.slug || ''
})

const item = computed(() => {
  const target = (paramDetail.value || '').toLowerCase()
  const foundService = gymData.services.find((s) => s.id === target)
  if (foundService) return foundService

  const foundGallery = gymData.galleries.find((g) => g.title.toLowerCase().replace(/\s+/g, '-') === target)
  if (foundGallery) return foundGallery

  return {
    id: target,
    title: { en: `${paramDetail.value} Training Program`, km: `កម្មវិធីហ្វឹកហាត់ ${paramDetail.value}`, zh: `${paramDetail.value} 训练计划` },
    desc: { en: 'High-intensity martial arts and athletic conditioning program led by Master Ny Rithy.', km: 'កម្មវិធីហ្វឹកហាត់ក្បាច់គុន និងកាយសម្បទាកម្រិតខ្ពស់ ដឹកនាំដោយគ្រូនី រិទ្ធី។', zh: '由 Ny Rithy 大师领衔的高强度武术与体能训练计划。' },
    image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop',
    category: 'Combat & Fitness'
  }
})

function getTitle(obj) {
  if (!obj) return ''
  if (typeof obj.title === 'string') return obj.title
  return obj.title?.[locale.value] || obj.title?.en || ''
}

function getDesc(obj) {
  if (!obj) return ''
  if (typeof obj.desc === 'string') return obj.desc
  return obj.desc?.[locale.value] || obj.desc?.en || ''
}

watchEffect(() => {
  if (item.value) {
    useSeo('detail', {
      title: getTitle(item.value),
      description: getDesc(item.value),
      image: item.value.image || item.value.cover
    })
  }
})
</script>

<style scoped>
.detail-page {
  padding-top: var(--space-4);
}

.detail-page__back {
  display: inline-flex;
  align-items: center;
  margin-bottom: var(--space-3);
  text-decoration: none;
}

.detail-page__card {
  background: var(--c-surface, #1e1e24);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.detail-page__hero {
  position: relative;
  height: 380px;
  width: 100%;
  overflow: hidden;
}

.detail-page__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-page__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-4);
}

.detail-page__badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--c-primary, #eab308);
  color: #000;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  margin-bottom: var(--space-1);
}

.detail-page__title {
  font-size: clamp(1.8rem, 4vw, 3rem);
  color: #fff;
  margin: 0;
}

.detail-page__content {
  padding: var(--space-4);
}

.detail-page__desc {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--c-text-muted, #d1d5db);
  margin-bottom: var(--space-4);
}

.detail-page__cta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  padding-top: var(--space-3);
  border-top: 1px solid var(--c-border);
}

.detail-page__empty {
  text-align: center;
  padding: var(--space-6) var(--space-2);
}
</style>
