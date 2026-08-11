<template>
  <div class="schedule-page">
    <section class="section">
      <div class="container">
        <SectionHeader
          :eyebrow="t('schedule.eyebrow') || 'CLASS TIMETABLE'"
          :title="t('schedule.title') || 'Weekly Training Schedule'"
          :subtitle="t('schedule.subtitle') || 'Explore morning and evening sessions for Bokator, Kun Khmer, BJJ, and strength conditioning.'"
          centered
          data-animate="fade"
        />

        <div data-animate="slide-up" data-delay="100">
          <ClassSchedule />
        </div>

        <!-- Schedule Booking Banner -->
        <div class="schedule-banner" data-animate="scale" data-delay="200">
          <div class="schedule-banner__content">
            <h3>Need a Custom Training Time?</h3>
            <p>Master Ny Rithy offers flexible private 1-on-1 coaching sessions outside normal class hours.</p>
          </div>
          <RLink to="/contact" class="btn btn--primary">
            Request Private Session
          </RLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const { t } = useI18n()
const animate = useAnimate()

onMounted(() => {
  animate.init()
})
</script>

<style scoped>
.schedule-banner {
  margin-top: var(--space-6, 4rem);
  background: var(--c-surface, #1e1e24);
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-4, 2rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .schedule-banner {
    flex-direction: row;
    text-align: left;
    justify-content: space-between;
  }
}

.schedule-banner__content h3 {
  font-size: 1.35rem;
  margin-bottom: 0.5rem;
  color: var(--c-primary, #eab308);
}

.schedule-banner__content p {
  font-size: 0.95rem;
  color: var(--c-muted, #9ca3af);
  margin: 0;
}
</style>
