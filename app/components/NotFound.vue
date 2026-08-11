<template>
  <div class="not-found">
    <div class="not-found__inner">
      <div class="not-found__art-wrap" data-animate="scale">
        <svg class="not-found__art" viewBox="0 0 320 320" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="notfound-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="var(--c-primary)" />
              <stop offset="100%" stop-color="#e8cf6e" />
            </linearGradient>
            <radialGradient id="notfound-glow">
              <stop offset="0%" stop-color="var(--c-primary-soft)" />
              <stop offset="70%" stop-color="var(--c-primary-soft)" stop-opacity="0.4" />
              <stop offset="100%" stop-color="var(--c-primary-soft)" stop-opacity="0" />
            </radialGradient>
          </defs>

          <circle cx="160" cy="160" r="152" fill="url(#notfound-glow)" />

          <g class="not-found__ring-wrap">
            <circle
              class="not-found__ring not-found__ring--outer"
              cx="160" cy="160" r="140"
              fill="none" stroke="var(--c-primary)" stroke-opacity="0.4" stroke-width="2"
              stroke-dasharray="6 14"
            />
            <circle class="not-found__dot" cx="160" cy="16" r="4" fill="var(--c-primary)" />
            <circle
              class="not-found__ring not-found__ring--mid"
              cx="160" cy="160" r="120"
              fill="none" stroke="var(--c-border)" stroke-width="1"
            />
          </g>

          <circle cx="160" cy="160" r="104" fill="var(--c-surface)" stroke="var(--c-border)" stroke-width="1" />

          <g
            class="not-found__figure"
            stroke="var(--c-text)" stroke-width="10"
            stroke-linecap="round" stroke-linejoin="round" fill="none"
          >
            <circle cx="160" cy="96" r="15" />
            <path d="M160 111 L160 170" />
            <path d="M160 128 L126 114 L104 104" />
            <path d="M160 128 L200 140 L216 164" />
            <path d="M160 170 L160 214 L182 244" />
            <path d="M160 170 L214 160 L256 136" />
            <path d="M256 136 L278 130" />
          </g>

          <path
            class="not-found__arc"
            d="M118 38 A150 150 0 0 1 202 34"
            fill="none" stroke="url(#notfound-gold)" stroke-width="3"
            stroke-linecap="round" stroke-dasharray="28 52"
          />

          <g stroke="url(#notfound-gold)" stroke-width="4" stroke-linecap="round">
            <path d="M262 118 L276 110" />
            <path d="M280 146 L298 142" />
            <path d="M248 98 L250 82" />
          </g>
        </svg>
      </div>

      <div class="not-found__content">
        <span class="not-found__badge" data-animate="fade">
          <i class="ri-error-warning-line"></i> ERROR 404
        </span>

        <h1 class="not-found__title" data-animate="fade" data-delay="1">
          Looks like you've wandered off the mat.
        </h1>

        <p class="not-found__desc" data-animate="fade" data-delay="2">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back in training.
        </p>

        <code class="not-found__code" data-animate="fade" data-delay="3">{{ currentPath }}</code>

        <div class="not-found__actions" data-animate="fade" data-delay="4">
          <RLink to="/" class="btn btn--primary">
            <i class="ri-home-4-line"></i> Return to Home
          </RLink>
          <RLink to="/contact" class="btn btn--outline">
            <i class="ri-customer-service-2-line"></i> Contact Support
          </RLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const route = useRoute()
const currentPath = computed(() => route.path)

useSeo({
  title: '404 Page Not Found — Rithy Martial & Fitness',
  description: 'The requested page could not be found.',
  noindex: true
})
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - var(--header-height, 80px));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6, 4rem) var(--space-4, 1.5rem);
  position: relative;
  overflow: hidden;
}

.not-found__inner {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}

/* ---- Illustration ---- */
.not-found__art-wrap {
  width: min(280px, 72vw);
  margin: 0 auto var(--space-5, 3rem);
}

.not-found__art {
  display: block;
  width: 100%;
  height: auto;
  animation: not-found-float 7s ease-in-out infinite;
}

.not-found__ring--outer {
  transform-origin: 50% 50%;
  animation: not-found-spin 36s linear infinite;
}

.not-found__ring--mid {
  stroke-dasharray: 2 6;
  stroke-linecap: round;
}

.not-found__dot {
  transform-origin: 160px 160px;
  animation: not-found-spin 36s linear infinite;
}

.not-found__figure {
  transition: stroke 0.3s ease;
}

.not-found__arc {
  animation: not-found-pulse 3s ease-in-out infinite;
}

@keyframes not-found-spin {
  to { transform: rotate(360deg); }
}

@keyframes not-found-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes not-found-pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}

/* ---- Content ---- */
.not-found__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-primary);
  border: 1px solid var(--c-primary-soft);
  background: var(--c-primary-soft);
  padding: 0.35rem 0.9rem;
  border-radius: 100px;
  margin-bottom: var(--space-3, 1.5rem);
}

.not-found__title {
  font-size: clamp(1.75rem, 4.5vw, 2.6rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0 0 var(--space-2, 1rem);
}

.not-found__desc {
  font-size: 1.05rem;
  color: var(--c-muted);
  line-height: 1.7;
  max-width: 44ch;
  margin: 0 auto var(--space-3, 1.5rem);
}

.not-found__code {
  display: inline-block;
  font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  font-size: 0.82rem;
  color: var(--c-text-muted);
  background: var(--c-surface);
  border: 1px dashed var(--c-border);
  border-radius: 8px;
  padding: 0.35rem 0.75rem;
  margin-bottom: var(--space-4, 2rem);
}

.not-found__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2, 0.75rem);
}
</style>
