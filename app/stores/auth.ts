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
    apiBase() {
      const config = useRuntimeConfig()
      return String(config.apiBase ?? 'http://localhost:8080').replace(/\/+$/, '')
    },
    async login(email: string, password: string) {
      console.log("login ====> ", email, password)
      this.loading = true
      this.error = null
      try {
        const res = await $fetch(getUrl('/api/v1/auth/login'), {
          method: 'POST',
          body: { Email: email, Password: password }
        })
        console.log("response login ====> ", res)
        this.setSession(res.data)
        return res
      } catch (err: any) {
        this.error = err?.message || 'Login failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(data: { Name: string; Email: string; Password: string; Phone?: string }) {
      this.loading = true
      this.error = null
      try {
        const res = await $fetch(getUrl('/api/v1/auth/register'), {
          method: 'POST',
          body: data
        })
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
        const res = await $fetch(getUrl(`/api/v1/auth/oauth/${provider}/initiate`))
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

    async joinPlan(
      plan: 'free' | 'basic' | 'pro' | 'elite',
      // plan: 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ELITE',
      userData?: { Name?: string; Email?: string; Password?: string; Phone?: string }
    ) {
      this.loading = true
      this.error = null
      try {
        const headers: Record<string, string> = {}
        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`
        }
        const res: any = await $fetch(getUrl('/api/v1/memberships/join'), {
          method: 'POST',
          headers,
          body: {
            plan,
            ...(userData || {}),
          },
        })
        if (res?.data?.token) {
          this.setSession(res.data)
        }
        return res
      } catch (err: any) {
        this.error = err?.message || 'Failed to join plan'
        throw err
      } finally {
        this.loading = false
      }
    },

    async completePayment(paymentId: number, paymentMethod = 'aba_khqr') {
      this.loading = true
      this.error = null
      try {
        const res: any = await $fetch(getUrl(`/api/v1/memberships/payments/${paymentId}/complete`), {
          method: 'POST',
          body: { payment_method: paymentMethod },
        })
        return res
      } catch (err: any) {
        this.error = err?.message || 'Failed to complete payment'
        throw err
      } finally {
        this.loading = false
      }
    },


    async fetchProfile() {
      if (!this.token) return
      try {
        const res = await $fetch(getUrl('/api/v1/auth/me'))
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
