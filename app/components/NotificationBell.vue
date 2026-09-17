<template>
  <div class="notif-bell">
    <button
      class="notif-bell__btn"
      :class="{ 'is-active': ui.notifPanelOpen }"
      @click="ui.toggleNotifPanel()"
      :aria-label="t('notifications.title')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span v-if="notifications.hasUnread" class="notif-bell__badge">
        {{ notifications.unreadCount > 99 ? '99+' : notifications.unreadCount }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const ui = useUIStore()
const notifications = useNotificationStore()
</script>

<style lang="scss" scoped>
.notif-bell {
  position: relative;
  display: flex;
}

.notif-bell__btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
  color: var(--c-muted);
  transition: all var(--transition-base);

  &:hover,
  &.is-active {
    color: var(--c-primary);
    border-color: var(--c-primary);
  }
}

.notif-bell__badge {
  position: absolute;
  top: -4px;
  right: -5px;
  height: 17px !important;
  min-width: 17px !important;
  padding: 0 3px;
  border-radius: var(--radius-full);
  background: var(--c-secondary);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>