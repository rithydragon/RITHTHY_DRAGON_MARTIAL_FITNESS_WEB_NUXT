<template>
  <div class="testimonials-page">
    <section class="section">
      <div class="container">
        <SectionHeader
          :eyebrow="t('testimonials.eyebrow')"
          :title="t('testimonials.title')"
          :subtitle="t('testimonials.subtitle')"
          centered
        />

        <div class="testimonials-page__grid">
          <TestimonialCard
            v-for="item in testimonials"
            :key="item.id"
            :testimonial="item"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import testimonialsData from '~/assets/json/testimonials.json'

const { t } = useI18n()

const testimonials = testimonialsData as any[]
</script>

<style scoped>
.testimonials-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);
}

@media (min-width: 640px) {
  .testimonials-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .testimonials-page__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
