<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="ui.notifPanelOpen"
      class="notif-backdrop"
      @click="closePanel"
    />
  </Transition>

  <!-- Panel -->
  <aside
    :class="['notif-panel', { open: ui.notifPanelOpen }]"
    aria-label="Notifications"
  >
    <!-- Header -->
    <div class="notif-header">
      <div>
        <h3 class="notif-title">{{ t('notifications.title') }}</h3>
        <p class="notif-subtitle">
          {{ notification.unreadCount === 1
            ? '1 ' + t('notifications.unread')
            : notification.unreadCount + ' ' + t('notifications.unread_notifications') }}
        </p>
      </div>

      <div class="notif-header-actions">
        <!-- WebSocket status indicator -->
        <span
          class="ws-indicator"
          :class="wsStatus"
          :title="`WebSocket: ${wsStatus}`"
        >
          <span class="ws-dot"></span>
          <small>{{ wsLabel }}</small>
        </span>

        <button
          v-if="notification.hasUnread && activeTab !== 'live'"
          class="btn btn-ghost btn-xs"
          @click="notification.markAllRead()"
        >
          {{ t('notifications.mark_all_read') }}
        </button>

        <button
          class="icon-close"
          @click="closePanel"
          aria-label="Close"
        >
          <i class="ri-close-line"></i>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="notif-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: isTabActive(tab.id) }"
        @click="selectTab(tab.id)"
      >
        <i :class="tab.icon"></i>
        <span>{{ t(`notifications.${tab.labelKey}`) }}</span>
        <span
          v-if="tab.countKey"
          class="count"
        >{{ notification.typeCounts[tab.countKey] }}</span>
      </button>
    </div>

    <!-- Live telemetry / WS stream -->

    <!-- List -->
    <div
      class="notif-list"
    >
      <button
        v-for="n in notification.filteredNotifications"
        :key="n.id"
        class="notif-item"
        :class="{ unread: !n.read }"
        @click="notification.openNotification(n)"
      >
        <!-- Avatar / Icon -->
        <div
          class="notif-icon"
          :class="`type-${typeClass(n.type)}`"
          :style="{ background: typeBg(n.type), color: typeColor(n.type) }"
        >
          <i :class="iconFor(n.type)"></i>
        </div>

        <!-- Content -->
        <div class="notif-body">
          <p class="notif-msg">{{ n.title }}</p>
          <p class="notif-detail">{{ n.message }}</p>
          <div class="notif-meta">
            <span class="notif-time">{{ notification.formatTime(n.createdAt) }}</span>
            <span
              v-if="n.link"
              class="notif-action"
            >
              <i class="ri-arrow-right-up-line"></i>
            </span>
          </div>
        </div>

        <!-- Unread dot -->
        <span
          v-if="!n.read"
          class="notif-dot"
        ></span>
      </button>

      <!-- Empty -->
      <div
        v-if="notification.filteredNotifications.length === 0"
        class="notif-empty"
      >
        <i class="ri-notification-off-line"></i>
        <p>{{ t('notifications.no_notifications') }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { t } = useI18n()
const ui = useUIStore()
const notification = useNotificationStore()

const { status: wsStatus } = useWebSocketNotifications()

const { lock, unlock } = useScrollLock()

const activeTab = ref<'all' | 'unread' | 'read' | 'live'>('all')

const tabs = [
  { id: 'all', labelKey: 'all', countKey: 'all', icon: 'ri-notification-3-line' },
  { id: 'unread', labelKey: 'unread', countKey: 'unread', icon: 'ri-mail-unread-line' },
  { id: 'read', labelKey: 'read', countKey: 'read', icon: 'ri-mail-check-line' },
] as const

type TabId = 'all' | 'unread' | 'read' 

const wsLabel = computed(() => {
  const map: Record<string, string> = {
    connected: t('notifications.live'),
    connecting: 'WS…',
    reconnecting: 'WS…',
    disconnected: 'WS—',
  }
  return map[wsStatus.value] || 'WS'
})

watch(
  () => ui.notifPanelOpen,
  (isOpen) => {
    if (isOpen) lock()
    else unlock()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  unlock()
})

function isTabActive(tab: TabId): boolean {
  if (tab === 'live') return activeTab.value === 'live'
  return activeTab.value !== 'live' && notification.filter === tab
}

function selectTab(tab: TabId) {
  activeTab.value = tab
  if (tab !== 'live') {
    notification.setFilter(tab)
  }
}

const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  like: { bg: 'rgba(244,63,94,.12)', color: '#f43f5e' },
  follow: { bg: 'rgba(34,197,94,.12)', color: '#22c55e' },
  comment: { bg: 'rgba(59,130,246,.12)', color: '#3b82f6' },
  save: { bg: 'rgba(168,85,247,.12)', color: '#a855f7' },
  system: { bg: 'rgba(245,158,11,.12)', color: '#f59e0b' },
  article: { bg: 'rgba(234,179,8,.12)', color: '#eab308' },
  news: { bg: 'rgba(234,179,8,.12)', color: '#eab308' },
  blog: { bg: 'rgba(234,179,8,.12)', color: '#eab308' },
  account: { bg: 'rgba(99,102,241,.12)', color: '#818cf8' },
  booking: { bg: 'rgba(16,185,129,.12)', color: '#10b981' },
  schedule: { bg: 'rgba(16,185,129,.12)', color: '#10b981' },
  class: { bg: 'rgba(16,185,129,.12)', color: '#10b981' },
  membership: { bg: 'rgba(255,159,28,.14)', color: '#ffb23e' },
  payment: { bg: 'rgba(255,159,28,.14)', color: '#ffb23e' },
  billing: { bg: 'rgba(255,159,28,.14)', color: '#ffb23e' },
  order: { bg: 'rgba(244,63,94,.12)', color: '#f43f5e' },
  purchase: { bg: 'rgba(244,63,94,.12)', color: '#f43f5e' },
  video: { bg: 'rgba(139,92,246,.12)', color: '#8b5cf6' },
  media: { bg: 'rgba(139,92,246,.12)', color: '#8b5cf6' },
  chat: { bg: 'rgba(14,165,233,.12)', color: '#0ea5e9' },
  message: { bg: 'rgba(14,165,233,.12)', color: '#0ea5e9' },
  reminder: { bg: 'rgba(245,158,11,.12)', color: '#f59e0b' },
  promo: { bg: 'rgba(255,159,28,.14)', color: '#ffb23e' },
  offer: { bg: 'rgba(255,159,28,.14)', color: '#ffb23e' },
  update: { bg: 'rgba(59,130,246,.12)', color: '#3b82f6' },
  release: { bg: 'rgba(59,130,246,.12)', color: '#3b82f6' },
  alert: { bg: 'rgba(239,68,68,.12)', color: '#ef4444' },
  warning: { bg: 'rgba(239,68,68,.12)', color: '#ef4444' },
  review: { bg: 'rgba(217,70,239,.12)', color: '#d946ef' },
  rating: { bg: 'rgba(217,70,239,.12)', color: '#d946ef' },
  inquiry: { bg: 'rgba(100,116,139,.12)', color: '#64748b' },
}

const DEFAULT_STYLE = { bg: 'rgba(100,116,139,.12)', color: '#64748b' }

function typeClass(type: string): string {
  const t = String(type || '').toLowerCase()
  return (TYPE_STYLES[t] ? t : 'system')
}

function styleFor(type: string) {
  return TYPE_STYLES[String(type || '').toLowerCase()] || DEFAULT_STYLE
}

function typeBg(type: string): string { return styleFor(type).bg }
function typeColor(type: string): string { return styleFor(type).color }

function iconFor(type: string): string {
  const t = String(type || '').toLowerCase()
  if (t === 'like') return 'ri-heart-3-fill'
  if (t === 'follow') return 'ri-user-follow-fill'
  if (t === 'comment') return 'ri-chat-3-fill'
  if (t === 'save') return 'ri-bookmark-fill'
  if (t === 'article' || t === 'blog' || t === 'news') return 'ri-article-line'
  if (t === 'account' || t === 'auth') return 'ri-user-3-line'
  if (t === 'membership' || t === 'payment' || t === 'billing') return 'ri-bank-card-line'
  if (t === 'order' || t === 'purchase' || t === 'cart') return 'ri-shopping-cart-line'
  if (t === 'booking' || t === 'class' || t === 'schedule') return 'ri-calendar-check-line'
  if (t === 'video' || t === 'media') return 'ri-video-line'
  if (t === 'chat' || t === 'message' || t === 'dm') return 'ri-chat-4-line'
  if (t === 'reminder') return 'ri-alarm-line'
  if (t === 'promo' || t === 'offer' || t === 'discount') return 'ri-price-tag-3-line'
  if (t === 'update' || t === 'release') return 'ri-refresh-line'
  if (t === 'alert' || t === 'warning') return 'ri-alert-line'
  if (t === 'review' || t === 'rating') return 'ri-star-fill'
  if (t === 'inquiry' || t === 'contact') return 'ri-question-line'
  return 'ri-notification-3-fill'
}

const closePanel = () => {
  ui.notifPanelOpen = false
}
</script>

<style scoped lang="scss">
.notif-backdrop{
  position:fixed;
  inset:0;
  z-index:9998 !important;
  background:rgba(15,23,42,.42);
  backdrop-filter:blur(2px);
}

.notif-panel{
  position:fixed;
  // top:var(--header-height, 10px);
  top: 0;
  right:0;
  width:390px;
  max-width:100vw;
  // height:calc(100vh - var(--header-height, 80px));
  height: 100vh;
  background:var(--c-bg,#fff);
  border-left:1px solid var(--c-border,#ececec);
  box-shadow:-12px 0 42px rgba(0,0,0,.14);
  transform:translateX(100%);
  transition:transform .35s cubic-bezier(.4,0,.2,1);
  z-index:9999;
  display:flex;
  flex-direction:column;

  &.open{
    transform:translateX(0);
  }

  @media (max-width:480px){
    width:100%;
  }
}

.notif-header{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:1rem;
  padding:1.1rem 1rem;
  border-bottom:1px solid var(--c-border,#ececec);
  background:var(--c-bg,#fff);
}

.notif-title{
  font-size:1rem;
  font-weight:800;
}

.notif-subtitle{
  font-size:.75rem;
  opacity:.6;
  margin-top:.2rem;
}

.notif-header-actions{
  display:flex;
  gap:.5rem;
  align-items:center;
}

.btn-xs{
  padding:.45rem .7rem;
  border-radius:10px;
  font-size:.75rem;
  border:1px solid var(--c-border,#ececec);
}

.icon-close{
  width:34px;
  height:34px;
  border-radius:50%;
  display:grid;
  place-items:center;
}

.ws-indicator{
  display:flex;
  align-items:center;
  gap:.3rem;
  font-size:.68rem;
  font-weight:700;
  color:var(--color-text-muted);

  .ws-dot{
    width:7px;
    height:7px;
    border-radius:50%;
    background:var(--color-text-muted);
  }

  &.connected{
    color:#22c55e;
    .ws-dot{
      background:#22c55e;
      box-shadow:0 0 8px rgba(34,197,94,.7);
    }
  }

  &.connecting, &.reconnecting{
    color:#f59e0b;
    .ws-dot{
      background:#f59e0b;
    }
  }
}

.notif-tabs{
  display:flex;
  gap:.55rem;
  padding:.8rem 1rem;
  border-bottom:1px solid var(--c-border,#ececec);
  overflow-x:auto;
}

.tab{
  position:relative;
  padding:.55rem .9rem;
  min-width:auto;
  border-radius:999px;
  font-size:.78rem;
  font-weight:700;
  white-space:nowrap;
  background:transparent;
  color:var(--color-text-primary);
  display:flex;
  align-items:center;
  gap:.35rem;
  transition:
    color .28s ease,
    background .28s ease;

  i{ font-size:.95rem; }

  .count{
    font-size:.68rem;
    font-weight:700;
    padding:.1rem .4rem;
    border-radius:999px;
    background:rgba(100,116,139,.18);
  }

  &:hover{
    transform:translateY(-1px);
  }

  &.active{
    color:var(--color-gold,#eab308);
    background:rgba(234,179,8,.12);
  }
}

.notif-live{
  overflow-y:auto;
  flex:1;
  padding:1rem;
  background:var(--color-bg-secondary, rgba(0,0,0,.03));
}

.notif-list{
  overflow:auto;
  flex:1;
}

.notif-item{
  width:100%;
  display:flex;
  gap:.9rem;
  align-items:flex-start;
  padding:1rem;
  text-align:left;
  border-bottom:1px solid rgba(0,0,0,.04);
  transition:.2s ease;
  position:relative;

  &:hover{
    background:rgba(0,0,0,.025);
  }

  &.unread{
    background:rgba(234,179,8,.06);
  }
}

.notif-icon{
  width:42px;
  height:42px;
  border-radius:50%;
  display:grid;
  place-items:center;
  font-size:1rem;
  flex-shrink:0;
}

.type-like{ background:rgba(244,63,94,.12); color:#f43f5e; }
.type-follow{ background:rgba(34,197,94,.12); color:#22c55e; }
.type-comment{ background:rgba(59,130,246,.12); color:#3b82f6; }
.type-save{ background:rgba(168,85,247,.12); color:#a855f7; }
.type-system{ background:rgba(245,158,11,.12); color:#f59e0b; }
.type-article,
.type-news,
.type-blog { background:rgba(234,179,8,.12); color:#eab308; }
.type-account{ background:rgba(99,102,241,.12); color:#818cf8; }
.type-booking,
.type-schedule,
.type-class { background:rgba(16,185,129,.12); color:#10b981; }
.type-membership,
.type-payment,
.type-billing { background:rgba(255,159,28,.14); color:#ffb23e; }
.type-order,
.type-purchase { background:rgba(244,63,94,.12); color:#f43f5e; }
.type-video,
.type-media { background:rgba(139,92,246,.12); color:#8b5cf6; }
.type-chat,
.type-message { background:rgba(14,165,233,.12); color:#0ea5e9; }
.type-reminder{ background:rgba(245,158,11,.12); color:#f59e0b; }
.type-promo,
.type-offer { background:rgba(255,159,28,.14); color:#ffb23e; }
.type-update,
.type-release { background:rgba(59,130,246,.12); color:#3b82f6; }
.type-alert,
.type-warning { background:rgba(239,68,68,.12); color:#ef4444; }
.type-review,
.type-rating { background:rgba(217,70,239,.12); color:#d946ef; }
.type-inquiry{ background:rgba(100,116,139,.12); color:#64748b; }

.notif-body{
  flex:1;
  min-width:0;
}

.notif-msg{
  font-size:.875rem;
  line-height:1.4;
  font-weight:700;
  color:var(--color-text-primary);
}

.notif-detail{
  font-size:.8rem;
  line-height:1.45;
  color:var(--color-text-secondary);
  margin-top:.2rem;
}

.notif-meta{
  display:flex;
  gap:.6rem;
  margin-top:.35rem;
  align-items:center;
  flex-wrap:wrap;
}

.notif-time{
  font-size:.74rem;
  opacity:.55;
}

.notif-action{
  font-size:.72rem;
  padding:.18rem .45rem;
  border-radius:999px;
  background:rgba(234,179,8,.08);
  color:#eab308;
}

.notif-dot{
  width:8px;
  height:8px;
  border-radius:50%;
  background:#eab308;
  margin-top:.5rem;
  flex-shrink:0;
}

.notif-empty{
  padding:4rem 1rem;
  text-align:center;
  opacity:.55;
  color:var(--color-text-muted);

  i{
    font-size:2rem;
    display:block;
    margin-bottom:.8rem;
  }
}

.fade-enter-active,
.fade-leave-active{
  transition:opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to{
  opacity:0;
}

// ── Scrollbar ─────────────────────────────
.notif-list::-webkit-scrollbar,
.notif-live::-webkit-scrollbar {
    width: 4px;
}

.notif-list::-webkit-scrollbar-track,
.notif-live::-webkit-scrollbar-track {
    background: transparent;
}

.notif-list::-webkit-scrollbar-thumb,
.notif-live::-webkit-scrollbar-thumb {
    background: var(--color-gold, #eab308);
    border-radius: 3px;
}
</style>