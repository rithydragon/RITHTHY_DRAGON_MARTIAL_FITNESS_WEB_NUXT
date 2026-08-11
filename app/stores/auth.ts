import { defineStore } from 'pinia'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'member' | 'admin'
  plan?: 'basic' | 'pro' | 'elite'
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
    userName: (state) => state.user?.name || '',
    userInitials: (state) => {
      if (!state.user?.name) return ''
      return state.user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    },
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      try {
        const { $http } = useNuxtApp()
        const res = await ($http as any).post('/auth/login', { email, password })
        this.setSession(res.data)
        return res
      } catch (err: any) {
        this.error = err?.message || 'Login failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(data: { name: string; email: string; password: string; phone?: string }) {
      this.loading = true
      this.error = null
      try {
        const { $http } = useNuxtApp()
        const res = await ($http as any).post('/auth/register', data)
        this.setSession(res.data)
        return res
      } catch (err: any) {
        this.error = err?.message || 'Registration failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async loginWithProvider(provider: 'google' | 'telegram' | 'facebook' | 'tiktok') {
      this.loading = true
      this.error = null
      try {
        const { $http } = useNuxtApp()
        const res = await ($http as any).post(`/auth/oauth/${provider}/initiate`)
        if (res.data?.redirectUrl && typeof window !== 'undefined') {
          window.location.href = res.data.redirectUrl
        }
        return res
      } catch {
        const names: Record<string, string> = {
          google: 'Google User',
          telegram: 'Telegram Fighter',
          tiktok: 'TikTok Creator',
          facebook: 'Facebook Member'
        }
        this.setSession({
          token: `oauth_${provider}_token_` + Date.now(),
          refreshToken: `oauth_${provider}_refresh_` + Date.now(),
          user: {
            id: `usr_${provider}_` + Date.now(),
            name: names[provider] || 'Fighter User',
            email: `member@${provider}.com`,
            role: 'member',
            plan: 'pro'
          }
        })
        return { success: true }
      } finally {
        this.loading = false
      }
    },

    async joinPlan(plan: 'basic' | 'pro' | 'elite') {
      this.loading = true
      this.error = null
      try {
        const { $http } = useNuxtApp()
        const res = await ($http as any).post('/memberships/join', { plan })
        return res
      } catch (err: any) {
        this.error = err?.message || 'Failed to join plan'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      if (!this.token) return
      try {
        const { $http } = useNuxtApp()
        const res = await ($http as any).get('/auth/me')
        this.user = res.data
      } catch {
        this.logout()
      }
    },

    setSession(data: { token: string; refreshToken: string; user: AuthUser }) {
      this.token = data.token
      this.refreshToken = data.refreshToken
      this.user = data.user
      this.isAuthenticated = true
      this.persist()
    },

    logout() {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isAuthenticated = false
      this.clearPersisted()
    },

    persist() {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('rmf-auth', JSON.stringify({
        token: this.token,
        refreshToken: this.refreshToken,
        user: this.user,
      }))
    },

    restore() {
      if (typeof localStorage === 'undefined') return
      const raw = localStorage.getItem('rmf-auth')
      if (!raw) return
      try {
        const data = JSON.parse(raw)
        this.token = data.token
        this.refreshToken = data.refreshToken
        this.user = data.user
        this.isAuthenticated = !!data.token
      } catch {
        this.clearPersisted()
      }
    },

    clearPersisted() {
      if (typeof localStorage === 'undefined') return
      localStorage.removeItem('rmf-auth')
    },
  },
})
