<template>
  <TransitionGroup name="toast" tag="div" class="toast-stack">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="`toast--${toast.notification.type}`"
    >
      <div class="toast__icon">
        <i :class="iconFor(toast.notification.type)"></i>
      </div>
      <div class="toast__body">
        <p class="toast__title">{{ toast.notification.title }}</p>
        <p class="toast__msg">{{ toast.notification.message }}</p>
      </div>
      <button class="toast__close" @click="dismiss(toast.id)" aria-label="Close">x</button>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import type { Notification } from '~/app/stores/notifications'

interface StackToast {
  id: string
  notification: Notification
}

const notifications = useNotificationStore()

const toasts = ref<StackToast[]>([])
const seen = new Set<string>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()

const MAX_TOASTS = 4
const TOAST_DURATION = 5000

onMounted(() => {
  // Pre-existing items (seeded mocks / REST fetch) are not toasted — only
  // real-time arrivals from the WebSocket should pop a toast.
  for (const n of notifications.items) seen.add(n.id)
})

watch(
  () => notifications.items.length,
  () => drain()
)

function drain() {
  const fresh = notifications.sorted
    .filter((n) => !seen.has(n.id) && n.id)
    .map((n) => n.id)

  for (const id of fresh) {
    const notification = notifications.sorted.find((n) => n.id === id)
    if (!notification) continue

    seen.add(id)
    if (toasts.value.length >= MAX_TOASTS) {
      const oldest = toasts.value[toasts.value.length - 1]
      clearTimer(oldest.id)
      toasts.value.pop()
    }

    // Newest toast lands on top of the stack.
    toasts.value.unshift({ id: `${id}-${Date.now()}-${Math.random()}`, notification })
    scheduleAutoDismiss(toasts.value[0].id)
  }
}

function scheduleAutoDismiss(id: string) {
  clearTimer(id)
  timers.set(
    id,
    setTimeout(() => dismiss(id), TOAST_DURATION)
  )
}

function clearTimer(id: string) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

function dismiss(id: string) {
  clearTimer(id)
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function iconFor(type: string): string {
  const t = String(type || '').toLowerCase()
  if (t === 'like') return 'ri-heart-3-fill'
  if (t === 'follow') return 'ri-user-follow-fill'
  if (t === 'comment') return 'ri-chat-3-fill'
  if (t === 'save') return 'ri-bookmark-fill'
  if (t === 'article' || t === 'blog' || t === 'news') return 'ri-article-line'
  if (t === 'account' || t === 'auth') return 'ri-user-3-line'
  if (t === 'membership' || t === 'payment' || t === 'billing') return 'ri-bank-card-line'
  if (t === 'booking' || t === 'class' || t === 'schedule') return 'ri-calendar-check-line'
  return 'ri-notification-3-line'
}

onBeforeUnmount(() => {
  for (const id of timers.keys()) clearTimer(id)
})
</script>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: var(--space-3);
  right: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  z-index: var(--z-toast);
  width: min(380px, calc(100vw - var(--space-6)));
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: var(--space-2) var(--space-3);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 380px;
}

.toast__icon {
  color: var(--c-primary);
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 1.125rem;
  line-height: 1;
}

.toast--account .toast__icon,
.toast--auth .toast__icon { color: var(--c-primary); }
.toast--article .toast__icon,
.toast--blog .toast__icon,
.toast--news .toast__icon { color: var(--c-success); }
.toast--system .toast__icon { color: var(--c-warning); }
.toast--booking .toast__icon,
.toast--class .toast__icon,
.toast--schedule .toast__icon { color: #10b981; }
.toast--membership .toast__icon,
.toast--payment .toast__icon,
.toast--billing .toast__icon { color: #ffb23e; }

.toast__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
}

.toast__msg {
  font-size: 0.75rem;
  color: var(--c-muted);
  margin-top: 2px;
  line-height: 1.45;
}

.toast__close {
  color: var(--c-muted);
  font-size: 0.875rem;
  flex-shrink: 0;
  transition: color var(--transition-fast);

  &:hover { color: var(--c-text); }
}

.toast-enter-active {
  transition: all var(--transition-base) ease;
}

.toast-leave-active {
  transition: all var(--transition-base) ease;
}

.toast-move {
  transition: transform var(--transition-base) ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>