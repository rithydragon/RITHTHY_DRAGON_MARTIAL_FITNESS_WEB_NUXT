
<template>
  <div class="hero-slide slide-kunkhmer">
    <!-- Visual background with gradients -->
    <div class="hero-slide__overlay" />
    <div class="hero-slide__video-placeholder">
      <!-- Simulated or real background video loop -->
      <div class="video-overlay" />
    </div>

    <div class="container hero-slide__container">
      <div class="hero-slide__content">
        <span class="eyebrow fade-in-up" data-delay="1">KUN KHMER CHAMPS</span>
        <h1 class="fade-in-up title-text" data-delay="2">
          {{ t('hero.title') }}
        </h1>
        <p class="text-muted hero-slide__desc fade-in-up" data-delay="3">
          {{ t('hero.desc') }}
        </p>
        <div class="hero-slide__actions fade-in-up" data-delay="4">
          <BaseButton to="/schedule" size="lg">{{ t('hero.cta_book') }}</BaseButton>
          <BaseButton to="/about" variant="outline" size="lg" style="color: #fff; border-color: #fff;">
            {{ t('hero.cta_about') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.hero-slide {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background-color: #0c0b0a;
  color: #ffffff;
  padding-block: var(--space-6);

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(12, 11, 10, 0.95) 30%, rgba(12, 11, 10, 0.4) 100%);
    z-index: 2;
  }

  &__video-placeholder {
    position: absolute;
    inset: 0;
    background: url('/images/riththy_1.jpg') center/cover no-repeat;
    opacity: 0.45;
    z-index: 1;
    transition: transform 8s ease-out;

    .video-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, transparent 20%, #0c0b0a 90%);
    }
  }

  &__container {
    position: relative;
    z-index: 3;
  }

  &__content {
    max-width: 650px;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .eyebrow {
    color: var(--c-accent);
    font-weight: 700;
    letter-spacing: 2px;
    font-size: 0.9rem;
  }

  .title-text {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 5vw, 3.8rem);
    line-height: 1.1;
    font-weight: 900;
    text-transform: uppercase;
    color: #ffffff;
  }

  &__desc {
    color: var(--c-muted);
    font-size: 1.15rem;
    max-width: 48ch;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-3);
    flex-wrap: wrap;
  }

  &:hover {
    .hero-slide__video-placeholder {
      transform: scale(1.05);
    }
  }
}

// Micro-animations for the first load
.fade-in-up {
  opacity: 0;
  transform: translateY(24px);
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;

  &[data-delay='1'] { animation-delay: 0.1s; }
  &[data-delay='2'] { animation-delay: 0.3s; }
  &[data-delay='3'] { animation-delay: 0.5s; }
  &[data-delay='4'] { animation-delay: 0.7s; }
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// .hero-slide:hover .hero-slide__video-placeholder {
//   transform: scale(1.05);
// }
</style>
