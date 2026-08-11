<template>
  <div class="trainers-page section">
    <div class="container">
      <SectionHeader
        eyebrow="WORLD-CLASS COACHES"
        title="Our Master Instructors"
        subtitle="Train directly under champion fighters, certified strength specialists, and martial arts masters."
        centered
      />

      <div class="trainers-page__grid">
        <div
          v-for="(trainer, idx) in trainerList"
          :key="trainer.name || idx"
          class="card trainer-card"
          data-animate="scale"
          :data-delay="String(((idx % 3) + 1) * 100)"
        >
          <div class="trainer-card__image-wrap">
            <img :src="trainer.image || fallbackTrainerImage" :alt="trainer.name || 'Trainer'" class="trainer-card__image" />
          </div>
          <div class="trainer-card__body">
            <h3 class="trainer-card__name">{{ trainer.name || 'Master Coach' }}</h3>
            <span class="trainer-card__role">{{ getRole(trainer) }}</span>
            <p class="trainer-card__bio">{{ getBio(trainer) }}</p>

            <div class="trainer-card__actions">
              <RLink :to="`/detail/${getTrainerSlug(trainer)}`" class="btn btn--outline btn--sm">
                Full Profile
              </RLink>
              <RLink to="/contact" class="btn btn--primary btn--sm">
                Book Lesson
              </RLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import gymData from '~/assets/json/gymData.json'

const { locale } = useI18n()
const animate = useAnimate()

const fallbackTrainerImage = 'https://images.pexels.com/photos/7045699/pexels-photo-7045699.jpeg'

onMounted(() => {
  animate.init()
})

const trainerList = computed(() => {
  return Array.isArray(gymData?.trainers) ? gymData.trainers : []
})

function getRole(trainer) {
  if (!trainer) return 'Instructor'
  if (typeof trainer.role === 'string') return trainer.role
  return trainer.role?.[locale.value] || trainer.role?.en || 'Instructor'
}

function getBio(trainer) {
  if (!trainer) return ''
  if (typeof trainer.bio === 'string') return trainer.bio
  return trainer.bio?.[locale.value] || trainer.bio?.en || ''
}

function getTrainerSlug(trainer) {
  if (!trainer?.name) return 'trainer'
  return trainer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}
</script>

<style scoped>
.trainers-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4, 2rem);
  margin-top: var(--space-4, 2rem);
}

@media (min-width: 768px) {
  .trainers-page__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.trainer-card {
  background: var(--c-surface, #1e1e24);
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  border: 1px solid var(--c-border);
  text-align: center;
  display: flex;
  flex-direction: column;
}

.trainer-card__image-wrap {
  height: 280px;
  overflow: hidden;
}

.trainer-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trainer-card__body {
  padding: var(--space-3, 1.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.trainer-card__name {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.trainer-card__role {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--c-primary, #eab308);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.trainer-card__bio {
  font-size: 0.875rem;
  color: var(--c-muted, #9ca3af);
  line-height: 1.6;
  margin-bottom: 1.25rem;
  flex: 1;
}

.trainer-card__actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
}
</style>
