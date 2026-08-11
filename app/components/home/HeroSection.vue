<script setup lang="ts">
import HeroSlide1 from './HeroSlide1.vue'
import HeroSlide2 from './HeroSlide2.vue'
import HeroSlide3 from './HeroSlide3.vue'

const activeSlide = ref(0)
const totalSlides = 3
let slideInterval: any = null

function setSlide(index: number) {
  activeSlide.value = index
  resetTimer()
}

function nextSlide() {
  activeSlide.value = (activeSlide.value + 1) % totalSlides
}

function startTimer() {
  if (import.meta.server) return
  slideInterval = setInterval(nextSlide, 8000)
}

function resetTimer() {
  if (slideInterval) {
    clearInterval(slideInterval)
    startTimer()
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})
</script>

<template>
  <section class="hero-section">
    <div class="hero-section__wrapper">
      <Transition name="slide-fade" mode="out-in">
        <component :is="activeSlide === 0 ? HeroSlide1 : activeSlide === 1 ? HeroSlide2 : HeroSlide3" />
      </Transition>
    </div>

    <!-- Navigation dots -->
    <div class="hero-section__dots">
      <button
        v-for="i in totalSlides"
        :key="i - 1"
        class="dot-btn"
        :class="{ 'is-active': activeSlide === i - 1 }"
        :aria-label="`Slide ${i}`"
        @click="setSlide(i - 1)"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero-section {
  position: relative;
  width: 100%;
  background: #0c0b0a;

  &__wrapper {
    position: relative;
    width: 100%;
  }

  &__dots {
    position: absolute;
    bottom: var(--space-4);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: var(--space-2);
    z-index: 10;
  }

  .dot-btn {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    border: none;
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);

    &:hover {
      background: rgba(255, 255, 255, 0.8);
      transform: scale(1.2);
    }

    &.is-active {
      background: var(--c-primary);
      width: 24px;
      border-radius: var(--radius-pill);
      transform: none;
    }
  }
}

// Fade transition animation between slides
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
