import { defineStore } from 'pinia'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

type NotificationFilter = 'all' | 'unread' | 'read'

interface NotificationState {
  items: Notification[]
  unreadCount: number
  wsConnected: boolean
  filter: NotificationFilter
  wsEventCount: number
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch {
      // Fallback if crypto.randomUUID throws in non-secure contexts
    }
  }
  return 'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9)
}

function toStr(value: any): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function toBool(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'boolean') return value
  return String(value).toLowerCase() === 'true' || Number(value) === 1
}

function firstValue(...values: any[]): any {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
}

function humanizeLabel(value: any): string {
  const s = toStr(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}

/**
 * Normalize a notification payload coming from the backend REST API or
 * the WebSocket stream.
 *
 * RAMAGALLERY_FASTAPI shapes:
 *   - REST GET /api/v1/notifications -> NotificationRead (PascalCase):
 *       Id, UserId, TypeId, SubjectType, SubjectId, Message, Data,
 *       IsRead (0/1), ReadAt, CreatedAt
 *   - WS   /ws/notifications/{user_id} -> WSNotificationPayload (snake_case):
 *       type: "notification", notification_id, title, message,
 *       reference_type, reference_id
 */
function normalizeServerItem(raw: any): Notification | null {
  if (!raw || typeof raw !== 'object') return null

  const dataBucket = firstValue(raw.Data, raw.data)
  const dataObj = dataBucket && typeof dataBucket === 'object' ? dataBucket : null

  const createdAt = toStr(
    firstValue(
      raw.createdAt,
      raw.created_at,
      raw.CreatedAt,
      dataObj?.createdAt,
      dataObj?.created_at,
      dataObj?.CreatedAt
    ) ?? new Date().toISOString()
  )

  const message = toStr(
    firstValue(
      raw.message,
      raw.Message,
      raw.content,
      raw.Content,
      raw.body,
      raw.Body,
      dataObj?.message,
      dataObj?.Message,
      dataObj?.body,
      dataObj?.Body
    )
  )

  // WS payloads always send type:"notification"; prefer the concrete
  // classification carried in reference_type / SubjectType.
  const type = toStr(
    firstValue(
      raw.reference_type,
      raw.referenceType,
      raw.subjectType,
      raw.SubjectType,
      raw.typeCode,
      raw.TypeCode,
      raw.type_code,
      raw.type,
      raw.Type
    )
  )
    .toLowerCase()
    .replace(/^notification$/, '')
    .trim()

  const title = toStr(
    firstValue(
      raw.title,
      raw.Title,
      raw.title_english,
      raw.titleEnglish,
      raw.TITLE_ENGLISH,
      raw.TITLE,
      dataObj?.title,
      dataObj?.Title
    )
  )

  const link = toStr(
    firstValue(
      raw.link,
      raw.Link,
      raw.Href,
      raw.url,
      raw.Url,
      dataObj?.link,
      dataObj?.Link,
      dataObj?.url,
      dataObj?.Url
    )
  )

  const hasId = firstValue(raw.id, raw.Id, raw.notification_id, raw.notificationId, raw.uuid)
  if (!title && !message && !link && hasId === undefined) return null

  const id = toStr(hasId)
  const subject = toStr(firstValue(raw.SubjectType, raw.subjectType, raw.reference_type, raw.referenceType))

  return {
    id: id || generateUUID(),
    type: type || 'system',
    title: title || (subject ? humanizeLabel(subject) : type ? humanizeLabel(type) : 'Notification'),
    message,
    read: toBool(firstValue(raw.read, raw.IsRead, raw.is_read, raw.IS_READ)),
    createdAt: createdAt || new Date().toISOString(),
    link: link || undefined,
  }
}

export const useNotificationStore = defineStore('notifications', {
  state: (): NotificationState => ({
    items: [],
    unreadCount: 0,
    wsConnected: false,
    filter: 'all',
    wsEventCount: 0,
  }),

  getters: {
    hasUnread: (state) => state.unreadCount > 0,
    sorted: (state) =>
      [...state.items].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    filteredNotifications: (state): Notification[] => {
      let list = [...state.items]
      if (state.filter === 'unread') list = list.filter((n) => !n.read)
      if (state.filter === 'read') list = list.filter((n) => n.read)
      return list.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    },
    typeCounts: (state) => {
      const unread = state.items.filter((n) => !n.read).length
      return {
        all: state.items.length,
        unread,
        read: state.items.length - unread,
        system: state.items.filter((n) => n.type === 'system').length,
      }
    },
  },

  actions: {
    add(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
      const item: Notification = {
        ...notification,
        id: generateUUID(),
        read: false,
        createdAt: new Date().toISOString(),
      }
      this.items.unshift(item)
      this.unreadCount++
      return item
    },

    /**
     * Add a notification received from the WebSocket stream.
     * Deduped by id; bumps the WS event counter used to trigger toasts.
     */
    addFromServer(raw: any): Notification | null {
      const item = normalizeServerItem(raw)
      if (!item) return null
      if (this.items.some((n) => n.id === item.id)) return null
      this.items.unshift(item)
      if (!item.read) this.unreadCount++
      this.wsEventCount++
      return item
    },

    /**
     * Replace the list with notifications returned by the REST API.
     */
    bulkFromServer(list: any[]): boolean {
      if (!Array.isArray(list)) return false
      const mapped = list
        .map(normalizeServerItem)
        .filter((n): n is Notification => Boolean(n))
      this.items = mapped
      this.unreadCount = mapped.filter((n) => !n.read).length
      return true
    },

    /**
     * Try to load real notifications from the backend. Falls back silently.
     */
    async fetchFromApi(): Promise<boolean> {
      if (typeof window === 'undefined') return false
      const authStore = useAuthStore()
      if (!authStore.token) return false
      try {
        // useWeb returns { data: Ref<T>, status, error } — unwrap the value.
        const res: any = await useWeb(getUrl('/api/v1/notifications'))
        const value = res?.data?.value ?? res?.data ?? res
        const list = Array.isArray(value)
          ? value
          : Array.isArray(value?.results)
            ? value.results
            : Array.isArray(value?.data)
              ? value.data
              : null
        if (list === null) return false
        console.log('NOTIFICATION STORE RES===================> ', list)
        return this.bulkFromServer(list)
      } catch {
        return false
      }
    },

    markAsRead(id: string) {
      const item = this.items.find((n) => n.id === id)
      if (item && !item.read) {
        item.read = true
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
    },

    markAllRead() {
      this.items.forEach((n) => (n.read = true))
      this.unreadCount = 0
    },

    setFilter(filter: NotificationFilter) {
      this.filter = filter
    },

    remove(id: string) {
      const idx = this.items.findIndex((n) => n.id === id)
      if (idx === -1) return
      const item = this.items[idx]!
      if (!item.read) this.unreadCount = Math.max(0, this.unreadCount - 1)
      this.items.splice(idx, 1)
    },

    openNotification(item: Notification) {
      if (!item) return
      this.markAsRead(item.id)
      if (item.link && typeof window !== 'undefined') {
        navigateTo(item.link)
      }
    },

    formatTime(ts: string): string {
      if (!ts) return ''
      const d = new Date(ts)
      if (Number.isNaN(d.getTime())) return ''
      const now = new Date()
      const sameDay = d.toDateString() === now.toDateString()
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      if (sameDay) return time
      return (
        d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
        ' ' +
        time
      )
    },

    fetchInitialNotifications() {
      // Mock initial notifications — replaced as soon as REST/WS deliver real data.
      this.items = [
        {
          id: generateUUID(),
          type: 'system',
          title: 'Welcome to Rithy Martial & Fitness',
          message: 'Explore traditional Bokator, Kun Khmer, BJJ, and athletic conditioning.',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/services',
        },
        {
          id: generateUUID(),
          type: 'article',
          title: 'New Article Published',
          message: 'Check out: The Ancient History of Bokator by Kru Ny Rithy.',
          read: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          link: '/blog/history-of-bokator',
        },
      ]
      this.unreadCount = 2
    },
  },
})