<template>
  <section class="schedule" id="schedule-section">
    <div class="container">
      <header class="schedule__header">
        <span class="eyebrow">{{ t('schedule.eyebrow') }}</span>
        <h2 class="section-title" data-animate="slide-up">{{ t('schedule.title') }}</h2>
        <p class="section-subtitle" data-animate="slide-up" data-delay="100">{{ t('schedule.subtitle') }}</p>
      </header>

      <div class="schedule__tabs" data-animate="fade">
        <button
          v-for="day in days"
          :key="day"
          class="schedule__tab"
          :class="{ 'is-active': activeDay === day }"
          @click="activeDay = day"
        >
          {{ t(`schedule.${day}`) }}
        </button>
      </div>

      <div class="schedule__grid" data-animate="fade">
        <Transition name="slide-right" mode="out-in">
          <div :key="activeDay" class="schedule__day">
            <div
              v-for="item in dayClasses"
              :key="item.id"
              class="schedule__card card"
            >
              <div class="schedule__time">{{ item.time }}</div>
              <div class="schedule__info">
                <h4 class="schedule__class">{{ t(item.classKey) }}</h4>
                <p class="schedule__instructor">{{ item.instructor }}</p>
                <span class="schedule__level">{{ item.level }}</span>
              </div>
              <div class="schedule__period">{{ t(`schedule.${item.period}`) }}</div>
            </div>
            <p v-if="dayClasses.length === 0" class="schedule__empty">No classes scheduled.</p>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import scheduleData from '~/assets/json/schedule.json'

const { t } = useI18n()

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const activeDay = ref<typeof days[number]>('monday')

const dayClasses = computed(() =>
  (scheduleData as any[]).filter((item) => item.day === activeDay.value)
)
</script>

<style scoped>
.schedule {
  padding-block: var(--space-7);
}

.schedule__header {
  text-align: center;
  margin-bottom: var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.schedule__tabs {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  padding-bottom: var(--space-1);
  margin-bottom: var(--space-3);
  scrollbar-width: thin;
}

.schedule__tab {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  color: var(--c-muted);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all var(--transition-fast);

  &:hover {
    color: var(--c-text);
  }

  &.is-active {
    background: var(--c-primary);
    color: var(--c-bg);
  }
}

.schedule__grid {
  min-height: 300px;
}

.schedule__day {
  display: grid;
  gap: var(--space-1);
}

@media (min-width: 768px) {
  .schedule__day {
    grid-template-columns: repeat(2, 1fr);
  }
}

.schedule__card {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
}

.schedule__time {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-primary);
  white-space: nowrap;
  min-width: 100px;
}

.schedule__info {
  flex: 1;
}

.schedule__class {
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
}

.schedule__instructor {
  font-size: 0.75rem;
  color: var(--c-muted);
  margin-top: 2px;
}

.schedule__level {
  display: inline-block;
  margin-top: 4px;
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-primary);
}

.schedule__period {
  font-size: 0.75rem;
  color: var(--c-muted);
  text-transform: capitalize;
}

.schedule__empty {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--c-muted);
  padding: var(--space-5);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all var(--transition-base);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
