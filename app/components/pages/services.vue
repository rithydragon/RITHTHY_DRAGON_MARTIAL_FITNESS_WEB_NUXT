<template>
  <div class="services">
    <section class="section services__hero" data-animate="fade">
      <div class="container">
        <SectionHeader
          :eyebrow="t('services.eyebrow') || 'TRAINING & ATHLETICS'"
          :title="t('services.title') || 'Martial Arts & Fitness Services'"
          :subtitle="t('services.subtitle') || 'Private coaching, group classes, Bokator, Pradal Serey, and functional conditioning.'"
          centered
        />
      </div>
    </section>

    <ServicesGrid />

    <section class="section services__detail">
      <div class="container">
        <div class="services__detail-grid">
          <article
            v-for="(service, i) in servicesList"
            :key="service.id || i"
            class="services__detail-card"
            :data-animate="i % 2 === 0 ? 'slide-right' : 'slide-left'"
            :data-delay="String(((i % 3) + 1) * 100)"
          >
            <div class="services__detail-num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="services__detail-body">
              <h3>{{ getTitle(service) }}</h3>
              <p>{{ getDesc(service) }}</p>
              <ul v-if="service.features && service.features.length > 0" class="services__detail-list">
                <li v-for="(feat, j) in service.features" :key="j">{{ feat }}</li>
              </ul>
              <div class="services__detail-action">
                <RLink :to="`/detail/${service.id}`" class="btn btn--outline btn--sm">
                  View Detail →
                </RLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section services__cta">
      <div class="container services__cta-inner">
        <h2 data-animate="slide-up">{{ t('common.getStarted') || 'Start Training Today' }}</h2>
        <p data-animate="slide-up" data-delay="100">{{ t('contact.subtitle') || 'Book your trial pass or talk to Master Ny Rithy.' }}</p>
        <div data-animate="slide-up" data-delay="200">
          <RLink to="/contact" class="btn btn--primary">{{ t('common.bookClass') || 'Book Free Trial' }}</RLink>
          <RLink to="/schedule" class="btn btn--secondary">{{ t('nav.schedule') || 'View Schedule' }}</RLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const { t, locale } = useI18n()
const animate = useAnimate()

onMounted(() => {
  animate.init()
})

const servicesList = [
  {
    id: 'private',
    titleKey: 'services.private.title',
    descKey: 'services.private.desc',
    features: ['1-on-1 coaching', 'Custom training plan', 'Flexible scheduling', 'Progress tracking'],
  },
  {
    id: 'group',
    titleKey: 'services.group.title',
    descKey: 'services.group.desc',
    features: ['Up to 15 students', 'All skill levels', 'Community atmosphere', 'Weekly sessions'],
  },
  {
    id: 'conditioning',
    titleKey: 'services.conditioning.title',
    descKey: 'services.conditioning.desc',
    features: ['Strength training', 'Agility drills', 'Endurance building', 'Injury prevention'],
  },
  {
    id: 'bokator',
    titleKey: 'services.bokator.title',
    descKey: 'services.bokator.desc',
    features: ['Animal forms', 'Weapon techniques', 'Traditional philosophy', 'Cultural heritage'],
  },
  {
    id: 'pradal',
    titleKey: 'services.pradal.title',
    descKey: 'services.pradal.desc',
    features: ['Elbow strikes', 'Knee techniques', 'Clinch work', 'Ring strategy'],
  },
  {
    id: 'yuthakram',
    titleKey: 'services.yuthakram.title',
    descKey: 'services.yuthakram.desc',
    features: ['Striking system', 'Grappling arts', 'Weapon forms', 'Combat strategy'],
  },
]

function getTitle(item: any): string {
  if (!item) return ''
  if (item.titleKey) {
    const translated = t(item.titleKey)
    if (translated !== item.titleKey) return translated
  }
  return item.title?.[locale.value] || item.title?.en || item.id || ''
}

function getDesc(item: any): string {
  if (!item) return ''
  if (item.descKey) {
    const translated = t(item.descKey)
    if (translated !== item.descKey) return translated
  }
  return item.desc?.[locale.value] || item.desc?.en || ''
}
</script>

<style scoped>
.services__detail-grid {
  display: grid;
  gap: var(--space-3);
}

.services__detail-card {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  border-bottom: 1px solid var(--c-border);
  background: var(--c-surface);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
}

.services__detail-num {
  font-family: var(--font-serif);
  font-size: 3rem;
  font-weight: 700;
  color: var(--c-primary);
  opacity: 0.4;
  flex-shrink: 0;
}

.services__detail-body h3 {
  font-family: var(--font-sans);
  font-size: 1.5rem;
  margin-bottom: var(--space-1);
}

.services__detail-body p {
  color: var(--c-muted);
  margin-bottom: var(--space-2);
}

.services__detail-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.services__detail-list li {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  background: var(--c-primary-soft);
  color: var(--c-primary);
  font-size: 0.75rem;
  font-weight: 500;
}

.services__detail-action {
  margin-top: 0.5rem;
}

.services__cta {
  background: var(--c-surface);
}

.services__cta-inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);

  h2 {
    font-size: clamp(2rem, 5vw, 3rem);
  }

  p {
    color: var(--c-muted);
    max-width: 50ch;
  }

  div {
    display: flex;
    gap: var(--space-1);
    flex-wrap: wrap;
    justify-content: center;
    margin-top: var(--space-2);
  }
}
</style>
