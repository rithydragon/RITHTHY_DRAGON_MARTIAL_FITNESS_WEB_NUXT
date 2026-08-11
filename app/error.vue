<template>
  <NuxtLayout>
    <div class="error-page section">
      <div class="container">
        <div class="error-page__card" data-animate="scale">
          <div class="error-page__code">{{ error?.statusCode || 404 }}</div>
          <h1 class="error-page__title">
            {{ error?.statusCode === 404 ? 'Page Not Found' : 'An Error Occurred' }}
          </h1>
          <p class="error-page__message">
            {{ error?.message || 'The page you are looking for does not exist or has been moved.' }}
          </p>

          <div class="error-page__actions">
            <button @click="handleClearError" class="btn btn--primary">
              <i class="ri-home-4-line"></i> Back to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    default: () => ({ statusCode: 404, message: 'Page Not Found' })
  }
})

function handleClearError() {
  clearError({ redirect: '/' })
}

useSeo({
  title: `${props.error?.statusCode || 404} — Page Not Found`,
  description: 'The requested page could not be found.',
  noindex: true
})
</script>

<style scoped>
.error-page {
  min-height: calc(80vh - var(--header-height, 80px));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6, 4rem) 0;
}

.error-page__card {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  background: var(--c-surface, #1e1e24);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-5, 3rem) var(--space-4, 2rem);
  box-shadow: var(--shadow-md);
}

.error-page__code {
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  color: var(--c-primary, #eab308);
  margin-bottom: var(--space-2, 1rem);
}

.error-page__title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  margin-bottom: var(--space-2, 1rem);
}

.error-page__message {
  font-size: 1rem;
  color: var(--c-muted, #9ca3af);
  line-height: 1.6;
  margin-bottom: var(--space-4, 2rem);
}

.error-page__actions {
  display: flex;
  justify-content: center;
}
</style>
