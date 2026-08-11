<template>
  <section id="services" class="services">
    <div class="container services__inner">
      <!-- Section Header -->
      <div class="services__header">
        <span data-animate class="eyebrow">{{ $t('sections.services_subtitle') }}</span>
        <h2 data-animate data-delay="1" class="services__title">
          {{ $t('sections.services_title') }}
        </h2>
        <p data-animate data-delay="2" class="services__lede">
          {{ tBy({
            en: 'We offer specialized classes designed for all fitness levels. Learn discipline, combat techniques, and explosive conditioning.',
            km: 'យើងផ្តល់ជូននូវថ្នាក់បង្វឹកឯកទេសដែលរចនាឡើងសម្រាប់គ្រប់កម្រិត។ រៀនពីវិន័យ បច្ចេកទេសប្រយុទ្ធ និងកាយសម្បទា។',
            cn: '我们提供适合所有健身水平的专业课程。学习格斗技巧、意志纪律和爆发性体能训练。'
          }) }}
        </p>
      </div>

      <!-- Services Grid -->
      <div class="services__grid">
        <article
          v-for="(service, idx) in services"
          :key="service.id"
          data-animate
          :data-delay="idx + 1"
          class="service-card"
        >
          <div class="service-card__image">
            <img :src="service.image" :alt="tBy(service.title)" loading="lazy" />
          </div>

          <div class="service-card__body">
            <div class="service-card__head">
              <i :class="service.icon" class="service-card__icon" aria-hidden="true" />
              <h3 class="service-card__title">{{ tBy(service.title) }}</h3>
            </div>

            <p class="service-card__desc">{{ tBy(service.desc) }}</p>

            <button class="service-card__link" type="button" @click="showDetails(service)">
              {{ $t('actions.explore') }}
              <i class="ri-arrow-right-line" aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import gymData from '~/assets/json/gymData.json'

const services = ref(gymData.services)

const showDetails = (service) => {
  alert(`Discovering details for: ${tBy(service.title)}!\nContact our reception at Preah Sihanouk Blvd to register!`)
}
</script>

<style lang="scss" scoped>
.services {
  padding-block: var(--space-7);
  background: var(--c-surface);

  @media (min-width: 768px) {
    padding-block: var(--space-8);
  }

  &__inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  &__header {
    max-width: 640px;
    margin-inline: auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  &__title {
    font-family: var(--font-heading, var(--font-sans));
    font-size: clamp(1.8rem, 4vw, 2.75rem);
    font-weight: 900;
    text-transform: uppercase;
    color: var(--c-text);
    line-height: 1.15;
  }

  &__lede {
    color: var(--c-muted);
    font-size: 0.95rem;
    line-height: 1.7;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.service-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);

  @media (min-width: 640px) {
    flex-direction: row;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--c-primary);

    .service-card__image img {
      transform: scale(1.06);
    }
  }

  &__image {
    width: 100%;
    height: 180px;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: var(--radius-md);

    @media (min-width: 640px) {
      width: 180px;
      height: 180px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--space-2);
    min-width: 0;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  &__icon {
    color: var(--c-primary);
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  &__title {
    font-family: var(--font-heading, var(--font-sans));
    font-size: 1.1rem;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--c-text);
  }

  &__desc {
    color: var(--c-muted);
    font-size: 0.85rem;
    line-height: 1.65;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    align-self: flex-start;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--c-primary);
    transition: color var(--transition-fast), gap var(--transition-fast);

    &:hover {
      color: var(--c-text);
      gap: 0.65rem;
    }
  }
}
</style>