<template>
  <section class="portfolio">
    <div class="container">
      <header class="portfolio__header">
        <span class="eyebrow">{{ t('portfolio.eyebrow') }}</span>
        <h2 class="section-title" data-animate="slide-up">{{ t('portfolio.title') }}</h2>
        <p class="section-subtitle" data-animate="slide-up" data-delay="100">{{ t('portfolio.subtitle') }}</p>
      </header>

      <div class="portfolio__filters" data-animate="fade">
        <button
          v-for="cat in categories"
          :key="cat"
          class="portfolio__filter"
          :class="{ 'is-active': activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ t(`portfolio.${cat}`) }}
        </button>
      </div>

      <div class="portfolio__grid">
        <TransitionGroup name="portfolio-item">
          <figure
            v-for="item in filteredItems"
            :key="item.id"
            class="portfolio__item"
            data-animate="scale"
          >
            <img :src="item.image" :alt="item.alt" loading="lazy" />
            <figcaption class="portfolio__caption">
              <h4>{{ item.title }}</h4>
              <span>{{ t(`portfolio.${item.category}`) }}</span>
            </figcaption>
          </figure>
        </TransitionGroup>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import portfolioData from '~/assets/json/portfolio.json'

const { t } = useI18n()

const categories = ['all', 'training', 'competition', 'transformation', 'events'] as const
const activeCategory = ref<typeof categories[number]>('all')

const filteredItems = computed(() => {
  if (activeCategory.value === 'all') return portfolioData
  return (portfolioData as any[]).filter((item) => item.category === activeCategory.value)
})
</script>

<style scoped>
.portfolio {
  padding-block: var(--space-7);
}

.portfolio__header {
  text-align: center;
  margin-bottom: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.portfolio__filters {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}

.portfolio__filter {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  color: var(--c-muted);
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all var(--transition-fast);

  &:hover {
    color: var(--c-text);
  }

  &.is-active {
    background: var(--c-primary);
    color: var(--c-bg);
  }
}

.portfolio__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-1);
}

@media (min-width: 640px) {
  .portfolio__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .portfolio__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.portfolio__item {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--radius-lg);
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-slow);
  }

  &:hover img {
    transform: scale(1.1);
  }
}

.portfolio__caption {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-2);
  background: linear-gradient(transparent 40%, var(--c-overlay));
  opacity: 0;
  transition: opacity var(--transition-base);

  h4 {
    font-family: var(--font-sans);
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--c-text);
  }

  span {
    font-size: 0.625rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--c-primary);
  }
}

.portfolio__item:hover .portfolio__caption {
  opacity: 1;
}

.portfolio-item-enter-active,
.portfolio-item-leave-active {
  transition: all var(--transition-base);
}

.portfolio-item-enter-from,
.portfolio-item-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
