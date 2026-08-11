<template>
  <div class="home">
    <!-- Hero Section -->
    <section id="hero">
      <HeroCarousel />
    </section>

    <!-- About Section -->
    <section id="about" class="section home__intro">
      <div class="container">
        <div class="home__intro-grid">
          <div class="home__intro-text" data-animate="slide-right">
            <span class="eyebrow">{{ t('about.eyebrow') }}</span>
            <h2 class="section-title">{{ t('about.title') }}</h2>
            <p class="home__intro-bio">{{ t('about.bio') }}</p>
            <RLink to="/about" class="btn btn--secondary">{{ t('common.learnMore') }}</RLink>
          </div>
          <div class="home__intro-image" data-animate="slide-left" data-delay="200">
            <RImage src="/images/Home3.jpg" alt="Mr. Ny Rithy"/>
          </div>
        </div>
      </div>
    </section>
    <HomeAbout data-animate="fade" />

    <!-- Services Section -->
    <section id="services">
      <ServicesGrid />
    </section>

    <!-- Programs Section -->
    <section id="programs" class="section">
      <HomeServices />
    </section>

    <!-- Schedule Section -->
    <section id="schedule" class="section">
      <ClassSchedule />
    </section>

    <!-- Trainers Section -->
    <section id="trainers" class="section">
      <HomeTrainers />
    </section>

    <!-- Portfolio Section -->
    <section id="portfolio" class="section">
      <PortfolioGrid />
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="section home__testimonials">
      <div class="container">
        <SectionHeader
          :eyebrow="t('testimonials.eyebrow')"
          :title="t('testimonials.title')"
          :subtitle="t('testimonials.subtitle')"
          centered
        />
        <div class="home__testimonials-grid">
          <TestimonialCard
            v-for="(item, idx) in featuredTestimonials"
            :key="item.id"
            :testimonial="item"
            data-animate="scale"
            :data-delay="String((idx + 1) * 100)"
          />
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" class="section home__faq">
      <FaqPage />
    </section>

    <!-- Blog Section -->
    <section id="blog" class="section home__blog">
      <div class="container">
        <SectionHeader
          :eyebrow="t('blog.eyebrow')"
          :title="t('blog.title')"
          :subtitle="t('blog.subtitle')"
          centered
        />
        <div class="home__blog-grid">
          <ArticleCard
            v-for="(article, idx) in featuredArticles"
            :key="article.id"
            :article="article"
            data-animate="slide-up"
            :data-delay="String((idx + 1) * 100)"
          />
        </div>
        <div class="home__blog-cta" data-animate="fade" data-delay="300">
          <RLink to="/blog" class="btn btn--primary">{{ t('common.viewAll') }}</RLink>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="section home__contact">
      <div class="container home__contact-inner">
        <h2 class="section-title" data-animate="slide-up">{{ t('contact.title') }}</h2>
        <p class="section-subtitle" data-animate="slide-up" data-delay="100">{{ t('contact.subtitle') }}</p>
        <div class="home__contact-cta" data-animate="slide-up" data-delay="200">
          <RLink to="/contact" class="btn btn--primary">{{ t('common.getStarted') }}</RLink>
          <RLink to="/schedule" class="btn btn--secondary">{{ t('common.bookClass') }}</RLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FaqPage from '~/components/pages/faq.vue'
import testimonialsData from '../assets/json/testimonials.json'
import articlesData from '../assets/json/articles.json'

const { t } = useI18n()

useSeo({
  title: 'Rithy Martial & Fitness — Premier Cambodian Martial Arts & Fitness Training',
  description: 'Professional martial arts and fitness training in Cambodia led by Mr. Ny Rithy. Bokator, Yuthakram Khom, Pradal Serey, strength & conditioning.',
  url: '/',
})

const featuredTestimonials = computed(() => {
  return Array.isArray(testimonialsData) ? testimonialsData.slice(0, 3) : []
})

const featuredArticles = computed(() => {
  return Array.isArray(articlesData) ? articlesData.slice(0, 3) : []
})
</script>

<style scoped>
.home__intro-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  align-items: center;
}

@media (min-width: 768px) {
  .home__intro-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.home__intro-bio {
  color: var(--c-muted);
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: var(--space-3);
}

.home__intro-image {
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 4 / 3;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.home__testimonials {
  background: var(--c-surface);
}

.home__testimonials-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);
}

@media (min-width: 768px) {
  .home__testimonials-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.home__faq {
  background: var(--c-bg);
}

.home__blog-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);
}

@media (min-width: 768px) {
  .home__blog-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.home__blog-cta {
  text-align: center;
  margin-top: var(--space-4);
}

.home__contact {
  background: var(--c-surface);
}

.home__contact-inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.home__contact-cta {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
  justify-content: center;
}
</style>
