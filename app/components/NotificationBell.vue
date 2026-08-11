<template>
  <div ref="targetRef" class="notif-bell">
    <button class="notif-bell__btn" @click.stop="togglePanel" :aria-label="t('notifications.title')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span v-if="notifications.hasUnread" class="notif-bell__badge">{{ notifications.unreadCount }}</span>
    </button>

    <Transition name="slide-down">
      <div v-if="isOpen" class="notif-bell__panel">
        <header class="notif-bell__header">
          <h4>{{ t('notifications.title') }}</h4>
          <button v-if="notifications.hasUnread" class="notif-bell__mark" @click.stop="notifications.markAllRead()">
            {{ t('notifications.markAllRead') }}
          </button>
        </header>
        <ul class="notif-bell__list">
          <li v-if="notifications.items.length === 0" class="notif-bell__empty">
            {{ t('notifications.empty') }}
          </li>
          <li
            v-for="item in notifications.sorted"
            :key="item.id"
            class="notif-bell__item"
            :class="{ 'is-unread': !item.read }"
            @click="handleClick(item)"
          >
            <div class="notif-bell__item-dot" v-if="!item.read"></div>
            <div class="notif-bell__item-body">
              <p class="notif-bell__item-title">{{ item.title }}</p>
              <p class="notif-bell__item-msg">{{ item.message }}</p>
            </div>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { Notification } from '~/app/stores/notifications'

const { t } = useI18n()
const notifications = useNotificationStore()
const isOpen = ref(false)
const targetRef = ref<HTMLElement | null>(null)

onClickOutside(targetRef, () => {
  isOpen.value = false
})

function togglePanel() {
  isOpen.value = !isOpen.value
}

function handleClick(item: Notification) {
  notifications.markAsRead(item.id)
  if (item.link) {
    navigateTo(localePath(item.link))
    isOpen.value = false
  }
}
</script>

<style scoped>
.notif-bell {
  position: relative;
}

.notif-bell__btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
  color: var(--c-muted);
  transition: all var(--transition-base);

  &:hover {
    color: var(--c-primary);
    border-color: var(--c-primary);
  }
}

.notif-bell__badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--radius-full);
  background: var(--c-secondary);
  color: #fff;
  font-size: 0.625rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-bell__panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 340px;
  max-height: 420px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-header);
  overflow: hidden;
}

.notif-bell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--c-border);

  h4 {
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 600;
  }
}

.notif-bell__mark {
  font-size: 0.75rem;
  color: var(--c-primary);
  transition: color var(--transition-fast);

  &:hover {
    color: var(--c-text);
  }
}

.notif-bell__list {
  max-height: 340px;
  overflow-y: auto;
}

.notif-bell__empty {
  padding: var(--space-4);
  text-align: center;
  color: var(--c-muted);
  font-size: 0.875rem;
}

.notif-bell__item {
  display: flex;
  gap: 0.75rem;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--c-border);
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--c-primary-soft);
  }

  &.is-unread {
    background: var(--c-secondary-soft);
  }
}

.notif-bell__item-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--c-primary);
  margin-top: 6px;
  flex-shrink: 0;
}

.notif-bell__item-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--c-text);
}

.notif-bell__item-msg {
  font-size: 0.75rem;
  color: var(--c-muted);
  margin-top: 2px;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--transition-fast);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
