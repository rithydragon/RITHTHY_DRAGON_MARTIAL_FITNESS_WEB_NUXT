<template>
  <section class="services-grid">
    <div class="container">
      <header class="services-grid__header">
        <span class="eyebrow">{{ t('services.eyebrow') }}</span>
        <h2 class="section-title" data-animate="slide-up">{{ t('services.title') }}</h2>
        <p class="section-subtitle" data-animate="slide-up" data-delay="100">{{ t('services.subtitle') }}</p>
      </header>

      <div class="services-grid__grid">
        <article
          v-for="(service, i) in services"
          :key="service.id"
          class="card services-grid__card"
          :data-animate="i % 2 === 0 ? 'slide-right' : 'slide-left'"
          :data-delay="String((i + 1) * 100)"
        >
          <div class="services-grid__icon">
            <span>{{ service.icon }}</span>
          </div>
          <h3 class="services-grid__title">{{ t(service.titleKey) }}</h3>
          <p class="services-grid__desc">{{ t(service.descKey) }}</p>
          <RLink to="/services" class="services-grid__link">{{ t('common.learnMore') }} →</RLink>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const services = [
  { id: 'private', icon: '01', titleKey: 'services.private.title', descKey: 'services.private.desc' },
  { id: 'group', icon: '02', titleKey: 'services.group.title', descKey: 'services.group.desc' },
  { id: 'conditioning', icon: '03', titleKey: 'services.conditioning.title', descKey: 'services.conditioning.desc' },
  { id: 'bokator', icon: '04', titleKey: 'services.bokator.title', descKey: 'services.bokator.desc' },
  { id: 'pradal', icon: '05', titleKey: 'services.pradal.title', descKey: 'services.pradal.desc' },
  { id: 'yuthakram', icon: '06', titleKey: 'services.yuthakram.title', descKey: 'services.yuthakram.desc' },
]
</script>

<style scoped>
.services-grid {
  padding-block: var(--space-7);
}

.services-grid__header {
  text-align: center;
  margin-bottom: var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.services-grid__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);
}

@media (min-width: 640px) {
  .services-grid__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .services-grid__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.services-grid__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.services-grid__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: var(--c-primary-soft);
  color: var(--c-primary);
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.services-grid__title {
  font-family: var(--font-sans);
  font-size: 1.25rem;
  font-weight: 600;
}

.services-grid__desc {
  font-size: 0.875rem;
  color: var(--c-muted);
  line-height: 1.6;
  flex: 1;
}

.services-grid__link {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--c-primary);
  margin-top: var(--space-1);
  transition: gap var(--transition-fast);
}
</style>
