import { defineStore } from 'pinia'

export interface Notification {
  id: string
  type: 'account' | 'article' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

interface NotificationState {
  items: Notification[]
  unreadCount: number
  wsConnected: boolean
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

export const useNotificationStore = defineStore('notifications', {
  state: (): NotificationState => ({
    items: [],
    unreadCount: 0,
    wsConnected: false,
  }),

  getters: {
    hasUnread: (state) => state.unreadCount > 0,
    sorted: (state) =>
      [...state.items].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
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

    remove(id: string) {
      const idx = this.items.findIndex((n) => n.id === id)
      if (idx !== -1) {
        if (!this.items[idx].read) this.unreadCount = Math.max(0, this.unreadCount - 1)
        this.items.splice(idx, 1)
      }
    },

    connectWebSocket() {
      if (typeof window === 'undefined' || this.wsConnected) return
      const config = useRuntimeConfig()
      const wsUrl = config.public.apiBase.replace('http', 'ws') + '/ws/notifications'

      try {
        const ws = new WebSocket(wsUrl)
        ws.onopen = () => {
          this.wsConnected = true
        }
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.add(data)
          } catch {
            // ignore malformed messages
          }
        }
        ws.onclose = () => {
          this.wsConnected = false
        }
      } catch {
        // fail silently on WS error
      }
    },

    fetchInitialNotifications() {
      // Mock initial notifications
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
