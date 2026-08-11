<template>
  <section id="blog" class="blog">
    <div class="container blog__inner">
      <!-- Section Header -->
      <div class="blog__header">
        <div class="blog__heading-group">
          <span data-animate class="eyebrow">{{ $t('sections.blog_subtitle') }}</span>
          <h2 data-animate data-delay="1" class="blog__title">
            {{ $t('sections.blog_title') }}
          </h2>
        </div>
        <RLink data-animate data-delay="2" to="/blog" class="blog__view-all">
          {{ $t('nav.view_all_blogs') }}
          <i class="ri-arrow-right-line" aria-hidden="true" />
        </RLink>
      </div>

      <!-- Blogs List -->
      <div class="blog__grid">
        <article
          v-for="(post, idx) in latestPosts"
          :key="post.id"
          data-animate
          :data-delay="idx + 1"
          class="blog-card"
        >
          <div class="blog-card__image">
            <img :src="post.image" :alt="tBy(post.title)" loading="lazy" />
          </div>

          <div class="blog-card__body">
            <div class="blog-card__meta">
              <span><i class="ri-user-line" aria-hidden="true" />{{ post.author }}</span>
              <span><i class="ri-calendar-todo-line" aria-hidden="true" />{{ post.date }}</span>
            </div>

            <h3 class="blog-card__title">{{ tBy(post.title) }}</h3>
            <p class="blog-card__excerpt">{{ tBy(post.excerpt) }}</p>

            <RLink :to="`/blog/${post.id}`" class="blog-card__link">
              {{ $t('actions.read_more') }}
              <i class="ri-arrow-right-s-line" aria-hidden="true" />
            </RLink>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import gymData from '~/assets/json/gymData.json'

// Show latest 2 blog posts on home page
const latestPosts = computed(() => {
  return gymData.blogs.slice(0, 2)
})
</script>

<style lang="scss" scoped>
.blog {
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
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
    }
  }

  &__heading-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    max-width: 560px;
  }

  &__title {
    font-family: var(--font-heading, var(--font-sans));
    font-size: clamp(1.8rem, 4vw, 2.75rem);
    font-weight: 900;
    text-transform: uppercase;
    color: var(--c-text);
    line-height: 1.15;
  }

  &__view-all {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1.5rem;
    border: 1px solid var(--c-primary);
    border-radius: var(--radius-md);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--c-primary);
    transition: background var(--transition-fast), color var(--transition-fast);

    &:hover {
      background: var(--c-primary);
      color: var(--c-bg);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.blog-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-3);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--c-primary);

    .blog-card__image img {
      transform: scale(1.06);
    }
  }

  &__image {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: var(--radius-md);
    flex-shrink: 0;

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
    gap: var(--space-2);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--c-muted);

    span {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
  }

  &__title {
    font-family: var(--font-heading, var(--font-sans));
    font-size: 1.1rem;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--c-text);
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__excerpt {
    font-size: 0.8rem;
    color: var(--c-muted);
    line-height: 1.65;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    align-self: flex-start;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--c-primary);
    transition: color var(--transition-fast), gap var(--transition-fast);

    &:hover {
      color: var(--c-text);
      gap: 0.5rem;
    }
  }
}
</style>