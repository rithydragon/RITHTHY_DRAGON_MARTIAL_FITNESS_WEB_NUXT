<template>
  <Transition name="toast-slide">
    <div v-if="current" class="toast" :class="`toast--${current.type}`">
      <div class="toast__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div class="toast__body">
        <p class="toast__title">{{ current.title }}</p>
        <p class="toast__msg">{{ current.message }}</p>
      </div>
      <button class="toast__close" @click="dismiss">x</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Notification } from '~/app/stores/notifications'

const notifications = useNotificationStore()
const current = ref<Notification | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

watch(
  () => notifications.items.length,
  (newLen, oldLen) => {
    if (newLen > (oldLen || 0)) {
      const latest = notifications.sorted[0]
      current.value = latest
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        current.value = null
      }, 5000)
    }
  }
)

function dismiss() {
  current.value = null
  if (timer) clearTimeout(timer)
}
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: var(--space-3);
  right: var(--space-3);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: var(--space-2) var(--space-3);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-toast);
  max-width: 380px;
}

.toast__icon {
  color: var(--c-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.toast--account .toast__icon { color: var(--c-primary); }
.toast--article .toast__icon { color: var(--c-success); }
.toast--system .toast__icon { color: var(--c-warning); }

.toast__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
}

.toast__msg {
  font-size: 0.75rem;
  color: var(--c-muted);
  margin-top: 2px;
}

.toast__close {
  color: var(--c-muted);
  font-size: 0.875rem;
  flex-shrink: 0;
  transition: color var(--transition-fast);

  &:hover { color: var(--c-text); }
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all var(--transition-base);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
