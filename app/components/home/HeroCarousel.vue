<template>
  <section class="hero" ref="heroEl">
    <div class="hero__slides">
      <TransitionGroup name="hero-fade">
        <div
          v-for="(slide, i) in slides"
          v-show="currentSlide === i"
          :key="i"
          class="hero__slide"
          :style="{ '--slide-bg': `url(${slide.image})` }"
        >
          <div class="hero__slide-overlay"></div>
          <div class="hero__slide-content container">
            <span class="hero__slide-badge eyebrow" data-animate="slide-down">{{ t('hero.badge') }}</span>
            <h1 class="hero__slide-title" data-animate="slide-up">{{ t(slide.titleKey) }}</h1>
            <p class="hero__slide-desc" data-animate="slide-up" data-delay="100">{{ t(slide.descKey) }}</p>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <div class="hero__content container">
      <div class="hero__main">
        <h2 class="hero__title" data-animate="slide-up">{{ t('hero.title') }}</h2>
        <p class="hero__subtitle" data-animate="slide-up" data-delay="100">{{ t('hero.subtitle') }}</p>
        <div class="hero__cta" data-animate="slide-up" data-delay="200">
          <button class="btn btn--primary" @click="scrollTo('services')">{{ t('hero.ctaPrimary') }}</button>
          <button class="btn btn--secondary" @click="scrollTo('about')">{{ t('hero.ctaSecondary') }}</button>
        </div>
      </div>
    </div>

    <div class="hero__indicators">
      <button
        v-for="(slide, i) in slides"
        :key="i"
        class="hero__indicator"
        :class="{ 'is-active': currentSlide === i }"
        @click="currentSlide = i"
        :aria-label="`Slide ${i + 1}`"
      >
        <span class="hero__indicator-bar"></span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const slides = [
  {
    image: '/images/Home1.jpg',
    // image: 'https://images.pexels.com/photos/7045699/pexels-photo-7045699.jpeg',
    titleKey: 'hero.slide1Title',
    descKey: 'hero.slide1Desc',
  },
  {
    image: '/images/Home2.jpg',
    // image: 'https://images.pexels.com/photos/4753986/pexels-photo-4753986.jpeg',
    titleKey: 'hero.slide2Title',
    descKey: 'hero.slide2Desc',
  },
  {
    image: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg',
    titleKey: 'hero.slide3Title',
    descKey: 'hero.slide3Desc',
  },
]

const currentSlide = ref(0)
let interval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  interval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, 6000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.hero {
  position: relative;
  height: 100vh;
  min-height: 640px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero__slides {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero__slide {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.75)), var(--slide-bg);
  background-size: cover;
  background-position: center;
  animation: kenburns 8s ease-out both;
}

@keyframes kenburns {
  from { transform: scale(1.15); }
  to { transform: scale(1); }
}

.hero__slide-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, var(--c-overlay) 100%);
}

.hero__slide-content {
  position: absolute;
  bottom: 10%;
  left: 0;
  right: 0;
  z-index: 1;
}

.hero__slide-badge {
  display: inline-block;
  margin-bottom: var(--space-2);
}

.hero__slide-title {
  font-size: clamp(1.75rem, 4vw, 3rem);
  color: #f5f5f5;
  max-width: 30ch;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.hero__slide-desc {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.75);
  max-width: 50ch;
  margin-top: var(--space-1);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
}

.hero__content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
}

.hero__main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.hero__title {
  font-size: clamp(2.5rem, 6vw, 5rem);
  line-height: 1.1;
  color: #f5f5f5;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.6);
}

.hero__subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.75);
  max-width: 60ch;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

/* Hero always sits on a dark image, so force theme-independent buttons */
.hero .btn--secondary {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.5);
}

.hero .btn--secondary:hover {
  border-color: var(--c-primary);
  color: var(--c-primary);
}

.hero__cta {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--space-2);
}

.hero__indicators {
  position: absolute;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 3;
}

.hero__indicator {
  padding: 0.5rem 0;
  cursor: pointer;
  background: none;
  border: none;
}

.hero__indicator-bar {
  display: block;
  width: 32px;
  height: 3px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.3);
  transition: background var(--transition-base), width var(--transition-base);
}

.hero__indicator.is-active .hero__indicator-bar {
  background: var(--c-primary);
  width: 48px;
}

.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 1s var(--ease-out);
}

.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}
</style>
