<template>
  <article class="testimonial card" data-animate="slide-up">
    <div class="testimonial__rating">
      <span v-for="i in 5" :key="i" class="testimonial__star" :class="{ 'is-filled': i <= testimonial.rating }">
        ★
      </span>
    </div>
    <blockquote class="testimonial__text">
      "{{ tBy({ en: testimonial.text, km: testimonial.textBy?.km, zh: testimonial.textBy?.zh }) }}"
    </blockquote>
    <footer class="testimonial__author">
      <div class="testimonial__avatar">
        <img :src="testimonial.image" :alt="testimonial.name" loading="lazy" />
      </div>
      <div class="testimonial__info">
        <p class="testimonial__name">{{ testimonial.name }}</p>
        <p class="testimonial__role">{{ testimonial.role }}</p>
        <span class="testimonial__achievement">{{ testimonial.achievement }}</span>
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
interface Testimonial {
  id: number
  name: string
  role: string
  text: string
  textBy?: { en?: string; km?: string; zh?: string }
  image: string
  rating: number
  achievement: string
}

defineProps<{ testimonial: Testimonial }>()
const { tBy } = useTBy()
</script>

<style scoped>
.testimonial {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.testimonial__rating {
  display: flex;
  gap: 2px;
}

.testimonial__star {
  color: var(--c-border);
  font-size: 1rem;

  &.is-filled {
    color: var(--c-primary);
  }
}

.testimonial__text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--c-text);
  flex: 1;
}

.testimonial__author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: var(--space-2);
  border-top: 1px solid var(--c-border);
}

.testimonial__avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.testimonial__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
}

.testimonial__role {
  font-size: 0.75rem;
  color: var(--c-muted);
}

.testimonial__achievement {
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-primary);
  font-weight: 600;
}
</style>
