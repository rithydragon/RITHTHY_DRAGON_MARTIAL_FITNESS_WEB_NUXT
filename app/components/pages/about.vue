<template>
  <div class="about">
    <section class="about__hero section">
      <div class="container">
        <div class="about__hero-grid">
          <div class="about__hero-text" data-animate="slide-right">
            <span class="eyebrow">{{ t('about.eyebrow') }}</span>
            <h1 class="section-title">{{ t('about.title') }}</h1>
            <p class="about__subtitle">{{ t('about.subtitle') }}</p>
            <p class="about__bio">{{ t('about.bio') }}</p>
          </div>
          <div class="about__hero-image" data-animate="slide-left">
            <img src="https://images.pexels.com/photos/7045699/pexels-photo-7045699.jpeg" alt="Mr. Ny Rithy" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    <section class="section about__philosophy">
      <div class="container">
        <div class="about__philosophy-inner" data-animate="fade">
          <span class="eyebrow">{{ t('about.philosophyTitle') }}</span>
          <blockquote class="about__philosophy-text">{{ t('about.philosophy') }}</blockquote>
        </div>
      </div>
    </section>

    <section class="section about__certs">
      <div class="container">
        <h2 class="section-title" data-animate="slide-up">{{ t('about.certificationsTitle') }}</h2>
        <div class="about__certs-grid">
          <div v-for="(cert, i) in certifications" :key="i" class="card about__cert" data-animate="slide-up" :data-delay="String((i + 1) * 100)">
            <div class="about__cert-icon">{{ String(i + 1).padStart(2, '0') }}</div>
            <h3>{{ tBy(cert.title) }}</h3>
            <p>{{ tBy(cert.org) }}</p>
            <span>{{ cert.year }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section about__heritage">
      <div class="container">
        <div class="about__heritage-grid">
          <div data-animate="slide-right">
            <span class="eyebrow">{{ t('about.heritageTitle') }}</span>
            <h2 class="section-title">{{ t('about.heritageTitle') }}</h2>
            <p class="about__heritage-text">{{ t('about.heritageText') }}</p>
          </div>
          <div class="about__heritage-image" data-animate="slide-left">
            <img src="https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg" alt="Cambodian martial arts heritage" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const { t } = useI18n()
const { tBy } = useTBy()
const animate = useAnimate()

onMounted(() => {
  animate.init()
})

const certifications = [
  {
    title: { en: 'Bokator Master Certification', km: 'សញ្ញាប័ត្រគ្រូបុកាទ័រ', zh: '斗狮拳大师认证' },
    org: { en: 'Cambodian Bokator Federation', km: 'សហព័ន្ធបុកាទ័រកម្ពុជា', zh: '柬埔寨斗狮拳联合会' },
    year: '2010',
  },
  {
    title: { en: 'Kun Khmer Referee License', km: 'អាជ្ញាប័ណ្ណជំនាញប្រាដាល់គុនខ្មែរ', zh: '高棉拳裁判执照' },
    org: { en: 'Kun Khmer Federation', km: 'សហព័ន្ធគុនខ្មែរ', zh: '高棉拳联合会' },
    year: '2013',
  },
  {
    title: { en: 'Strength & Conditioning Specialist', km: 'ឯកទេសការពង្រឹងនិងសម្បទាន', zh: '力量与体能专家' },
    org: { en: 'International Sports Science Association', km: 'សមាគមវិទ្យាសាស្ត្រកីឡាអន្តរជាតិ', zh: '国际运动科学协会' },
    year: '2015',
  },
  {
    title: { en: 'Yuthakram Khom Instructor', km: 'គ្រូយុទ្ធក្រមខ្មែរ', zh: '高棉武技教练' },
    org: { en: 'Khmer Martial Arts Academy', km: 'បណ្ឌិត្យសភាកីឡាចំបុយប្រយុទ្ធខ្មែរ', zh: '高棉武术学院' },
    year: '2017',
  },
  {
    title: { en: 'Sports Nutrition Certification', km: 'សញ្ញាប័ត្រអាហារូបត្បម្ពកីឡា', zh: '运动营养认证' },
    org: { en: 'Precision Nutrition', km: 'Precision Nutrition', zh: 'Precision Nutrition' },
    year: '2019',
  },
]
</script>

<style scoped>
.about__hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  align-items: center;
}

@media (min-width: 768px) {
  .about__hero-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.about__subtitle {
  color: var(--c-primary);
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: var(--space-2);
}

.about__bio {
  color: var(--c-muted);
  line-height: 1.7;
}

.about__hero-image {
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 4 / 3;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.about__philosophy {
  background: var(--c-surface);
}

.about__philosophy-inner {
  max-width: 800px;
  margin-inline: auto;
  text-align: center;
}

.about__philosophy-text {
  font-family: var(--font-serif);
  font-size: clamp(1.25rem, 3vw, 2rem);
  line-height: 1.5;
  color: var(--c-text);
  margin-top: var(--space-2);
}

.about__certs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

@media (min-width: 640px) {
  .about__certs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .about__certs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.about__cert {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.about__cert-icon {
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 700;
  color: var(--c-primary);
  margin-bottom: var(--space-1);
}

.about__cert h3 {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
}

.about__cert p {
  font-size: 0.8125rem;
  color: var(--c-muted);
}

.about__cert span {
  font-size: 0.75rem;
  color: var(--c-primary);
  font-weight: 600;
}

.about__heritage-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  align-items: center;
}

@media (min-width: 768px) {
  .about__heritage-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.about__heritage-text {
  color: var(--c-muted);
  line-height: 1.7;
}

.about__heritage-image {
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 4 / 3;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
