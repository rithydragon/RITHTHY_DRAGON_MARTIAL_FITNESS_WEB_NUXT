<template>
  <section class="hero" ref="heroEl">
    <div class="hero__slides">
      <TransitionGroup name="hero-fade">
        <div
          v-for="(slide, i) in slides"
          v-show="currentSlide === i"
          :key="i"
          class="hero__slide"
          :class="{ 'hero__slide--video': slide.video }"
          :style="slide.video ? undefined : { '--slide-bg': `url(${slide.image})` }"
        >
          <!-- ── Video background ──────────────────────────────── -->
          <video
            v-if="slide.video"
            :ref="el => setVideoRef(el as HTMLVideoElement | null, i)"
            class="hero__slide-video"
            :src="slide.video"
            :poster="slide.image"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            aria-hidden="true"
          />

          <div class="hero__slide-overlay" />

          <div class="hero__slide-content container">
            <span class="hero__slide-badge eyebrow" data-animate="slide-down">{{ t('hero.badge') }}</span>
            <p class="hero__slide-title" data-animate="slide-up">{{ t(slide.titleKey) }}</p>
            <p class="hero__slide-desc" data-animate="slide-up" data-delay="100">{{ t(slide.descKey) }}</p>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- ── Centre copy ────────────────────────────────────────── -->
    <div class="hero__content container">
      <div class="hero__main">
        <h4 class="hero__title" data-animate="slide-up">{{ t('hero.title') }}</h4>
        <p class="hero__subtitle" data-animate="slide-up" data-delay="100">{{ t('hero.subtitle') }}</p>
        <div class="hero__cta" data-animate="slide-up" data-delay="200">
          <button class="btn btn--primary"   @click="scrollTo('services')">{{ t('hero.ctaPrimary') }}</button>
          <button class="btn btn--secondary" @click="scrollTo('about')">{{ t('hero.ctaSecondary') }}</button>
        </div>
      </div>
    </div>

    <!-- ── Mute toggle — only visible on video slides ─────────── -->
    <Transition name="hero-fade">
      <button
        v-if="slides[currentSlide]?.video"
        class="hero__mute-btn"
        :aria-label="muted ? t('hero.unmute') : t('hero.mute')"
        @click="toggleMute"
      >
        <i :class="muted ? 'ri-volume-mute-line' : 'ri-volume-up-line'" aria-hidden="true" />
      </button>
    </Transition>

    <!-- ── Indicators ─────────────────────────────────────────── -->
    <div class="hero__indicators">
      <button
        v-for="(slide, i) in slides"
        :key="i"
        class="hero__indicator"
        :class="{ 'is-active': currentSlide === i }"
        :aria-label="`Slide ${i + 1}`"
        @click="goTo(i)"
      >
        <span class="hero__indicator-bar" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

// ── Slide data ────────────────────────────────────────────────────────────────
// video?: string  →  .mp4 / .webm path; triggers video background
// image?: string  →  CSS background (no video) OR poster while video loads
const slides = [
  {
    image:    '/images/Home1.jpg',
    titleKey: 'hero.slide1Title',
    descKey:  'hero.slide1Desc',
  },
  {
    video:    '/videos/stunt.mp4',   // ← add video field to get video background
    image:    '/images/Home2.jpg',   // ← becomes the poster
    titleKey: 'hero.slide2Title',
    descKey:  'hero.slide2Desc',
  },
  {
    image:    '/images/Home2.jpg',   // ← becomes the poster
    titleKey: 'hero.slide2Title',
    descKey:  'hero.slide2Desc',
  },
  {
    image:    'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg',
    titleKey: 'hero.slide3Title',
    descKey:  'hero.slide3Desc',
  },
]

// ── Video refs — one per slide index ─────────────────────────────────────────
// TransitionGroup keeps multiple slides mounted during transitions, so we
// track refs in an array rather than a single ref.
const videoRefs = ref<(HTMLVideoElement | null)[]>([])

function setVideoRef(el: HTMLVideoElement | null, idx: number) {
  videoRefs.value[idx] = el
}

// ── State ─────────────────────────────────────────────────────────────────────
const currentSlide = ref(0)
const muted        = ref(true)            // start muted (required for autoplay)
let   interval: ReturnType<typeof setInterval> | null = null

// ── Navigate to a slide ───────────────────────────────────────────────────────
function goTo(idx: number) {
  // Pause the outgoing video (saves CPU, avoids audio bleed if user unmuted)
  const outgoing = videoRefs.value[currentSlide.value]
  if (outgoing) outgoing.pause()

  currentSlide.value = idx

  // Resume / reset the incoming video after the DOM has updated
  nextTick(() => {
    const incoming = videoRefs.value[idx]
    if (incoming) {
      incoming.muted       = muted.value
      incoming.currentTime = 0
      incoming.play().catch(() => {
        // Autoplay blocked by browser — poster image stays visible
      })
    }
  })
}

// ── Mute toggle ───────────────────────────────────────────────────────────────
function toggleMute() {
  muted.value = !muted.value
  const vid = videoRefs.value[currentSlide.value]
  if (vid) vid.muted = muted.value
}

// ── Auto-advance ──────────────────────────────────────────────────────────────
onMounted(() => {
  interval = setInterval(() => {
    goTo((currentSlide.value + 1) % slides.length)
  }, 6000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

// ── Scroll helper ─────────────────────────────────────────────────────────────
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* ── Root ──────────────────────────────────────────────────────────────────── */
.hero {
  position: relative;
  height: 100vh;
  min-height: 640px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Slide layer ───────────────────────────────────────────────────────────── */
.hero__slides {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* ── Image slide ───────────────────────────────────────────────────────────── */
.hero__slide {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.75)), var(--slide-bg);
  background-size: cover;
  background-position: center;
  animation: kenburns 8s ease-out both;   /* subtle zoom for image slides */
}

/* ── Video slide — no bg-image, no ken-burns (video has its own motion) ────── */
.hero__slide--video {
  background-image: none;
  animation: none;
}

@keyframes kenburns {
  from { transform: scale(1.15); }
  to   { transform: scale(1); }
}

/* ── Video element ─────────────────────────────────────────────────────────── */
.hero__slide-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 0;
}

/* ── Shared overlay (image + video) ────────────────────────────────────────── */
.hero__slide-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.70)),
    radial-gradient(ellipse at center, transparent 0%, var(--c-overlay, rgba(0,0,0,.4)) 100%);
  z-index: 1;
}

/* ── Per-slide text (bottom-left) ──────────────────────────────────────────── */
.hero__slide-content {
  position: absolute;
  bottom: 10%;
  left: 0;
  right: 0;
  z-index: 2;
}

.hero__slide-badge {
  display: inline-block;
  margin-bottom: var(--space-2);
}

.hero__slide-title {
  font-size: clamp(1.75rem, 4vw, 3rem);
  color: #f5f5f5;
  max-width: 30ch;
  text-shadow: 0 2px 20px rgba(0,0,0,.5);
}

.hero__slide-desc {
  font-size: 1.125rem;
  color: rgba(255,255,255,.75);
  max-width: 50ch;
  margin-top: var(--space-1);
  text-shadow: 0 1px 10px rgba(0,0,0,.5);
}

/* ── Centre copy ───────────────────────────────────────────────────────────── */
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
  font-family: var(--font-400);
  font-size: clamp(2.5rem, 6vw, 5rem);
  line-height: 1.1;
  color: #f5f5f5;
  text-shadow: 0 4px 30px rgba(0,0,0,.6);
}

.hero__subtitle {
  font-size: 1.125rem;
  color: rgba(255,255,255,.75);
  max-width: 60ch;
  text-shadow: 0 2px 20px rgba(0,0,0,.5);
}

/* ── CTAs ──────────────────────────────────────────────────────────────────── */
.hero__cta {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--space-2);
}

/* Force theme-independent secondary btn on dark hero background */
.hero .btn--secondary         { color: #fff; border-color: rgba(255,255,255,.5); }
.hero .btn--secondary:hover   { border-color: var(--c-primary); color: var(--c-primary); }

/* ── Mute button ───────────────────────────────────────────────────────────── */
.hero__mute-btn {
  position: absolute;
  bottom: calc(var(--space-4, 2rem) + 2.5rem); /* above indicators */
  right: var(--space-4, 2rem);
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.3);
  background: rgba(0,0,0,.35);
  color: rgba(255,255,255,.85);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.hero__mute-btn i {
  font-size: 1rem;
  line-height: 1;
  pointer-events: none;
}

.hero__mute-btn:hover {
  background: rgba(0,0,0,.55);
  border-color: rgba(255,255,255,.6);
}

/* ── Indicators ────────────────────────────────────────────────────────────── */
.hero__indicators {
  position: absolute;
  bottom: var(--space-4, 2rem);
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
  border-radius: var(--radius-full, 999px);
  background: rgba(255,255,255,.3);
  transition: background var(--transition-base, .2s), width var(--transition-base, .2s);
}

.hero__indicator.is-active .hero__indicator-bar {
  background: var(--c-primary);
  width: 48px;
}

/* ── TransitionGroup fade ──────────────────────────────────────────────────── */
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 1s var(--ease-out, ease-out);
}

.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}
</style>