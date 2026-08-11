<template>
  <section id="trainers" class="trainers">
    <div class="container trainers__inner">
      <!-- Section Header -->
      <div class="trainers__header">
        <span data-animate class="eyebrow">{{ $t('sections.trainers_subtitle') }}</span>
        <h2 data-animate data-delay="1" class="trainers__title">
          {{ $t('sections.trainers_title') }}
        </h2>
        <p data-animate data-delay="2" class="trainers__lede">
          {{ tBy({
            en: 'Train with the best. Our instructors are decorated champions and certified athletic professionals dedicated to your success.',
            km: 'ហ្វឹកហាត់ជាមួយគ្រូបង្វឹកដ៏ឆ្នើម។ គ្រូរបស់យើងជាអតីតជើងឯក និងជាអ្នកជំនាញកាយសម្បទាដែលមានការទទួលស្គាល់ត្រឹមត្រូវ។',
            cn: '与最优秀的人一起训练。我们的教练是屡获殊荣的冠军和获得认证的运动专业人士，致力于帮助您取得成功。'
          }) }}
        </p>
      </div>

      <!-- Trainers Grid -->
      <div class="trainers__grid">
        <article
          v-for="(trainer, idx) in trainers"
          :key="trainer.name"
          data-animate
          :data-delay="idx + 1"
          class="trainer-card"
        >
          <div class="trainer-card__avatar">
            <img :src="trainer.image" :alt="trainer.name" loading="lazy" />
          </div>

          <div class="trainer-card__body">
            <h3 class="trainer-card__name">{{ trainer.name }}</h3>
            <div class="trainer-card__role">{{ tBy(trainer.role) }}</div>
            <p class="trainer-card__bio">{{ tBy(trainer.bio) }}</p>
          </div>

          <div class="trainer-card__social">
            <a href="#" aria-label="Instagram"><i class="ri-instagram-line" aria-hidden="true" /></a>
            <a href="#" aria-label="Twitter"><i class="ri-twitter-fill" aria-hidden="true" /></a>
            <a href="#" aria-label="Facebook"><i class="ri-facebook-fill" aria-hidden="true" /></a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import gymData from '~/assets/json/gymData.json'
const trainers = ref(gymData.trainers)
</script>

<style lang="scss" scoped>
.trainers {
  padding-block: var(--space-7);
  background: var(--c-bg);

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

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

.trainer-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-3);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--c-primary);

    .trainer-card__avatar {
      border-color: var(--c-primary);

      img {
        transform: scale(1.08);
      }
    }
  }

  &__avatar {
    width: 140px;
    height: 140px;
    border-radius: var(--radius-full);
    overflow: hidden;
    border: 4px solid var(--c-primary-soft);
    transition: border-color var(--transition-base);
    margin-bottom: var(--space-2);

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
    gap: 0.5rem;
  }

  &__name {
    font-family: var(--font-heading, var(--font-sans));
    font-size: 1.1rem;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--c-text);
  }

  &__role {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--c-primary);
  }

  &__bio {
    font-size: 0.8rem;
    color: var(--c-muted);
    line-height: 1.65;
    max-width: 28ch;
  }

  &__social {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-2);

    a {
      color: var(--c-muted);
      font-size: 1rem;
      transition: color var(--transition-fast);

      &:hover {
        color: var(--c-primary);
      }
    }
  }
}
</style>