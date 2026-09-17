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
    isLoggedIn: (state) => state.isAuthenticated || !!state.user,
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
        this.setSession(res)
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

    /* ------------------------------------------
     REFRESH TOKEN
    ------------------------------------------ */
    async refreshAccessToken() {
      if (!this.refreshToken) return false

      try {
        const config = useRuntimeConfig()

        const { data } = await axios.post(
          `${config.public.apiBase}/api/auth/refresh`,
          {
            RefreshToken: this.refreshToken,
          }
        )

        this.token = data.AccessToken
        useCookie('rama_access_token').value =
          data.AccessToken

        return true
      } catch (error) {
        await this.logout(false)
        return false
      }
    },

    async loginWithProvider(provider: 'google' | 'telegram' | 'facebook' | 'tiktok') {
      this.loading = true
      this.error = null
      try {
        const res = await $fetch(getUrl(`/api/v1/auth/oauth/initiate`), {
          method: 'POST',
          body: {
            Provider: provider
          }
        })
        if (res.data?.redirectUrl && typeof window !== 'undefined') {
          // Remember which provider initiated the flow so /oauth/callback
          // can verify the access token and fetch the right user profile.
          if (typeof localStorage !== 'undefined') {
            useCookie('rmf-oauth-pending', JSON.stringify({
              provider,
              redirect: '/',
              ts: Date.now(),
            }))
          }
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
        const { data } = await useWeb('/api/v1/auth/me')
        console.log("fetchProfile ====> ", data)
        this.user = data
      } catch (err) {
        console.log("fetchProfile error ====> ", err)
        this.logout()
      }
    },

    setSession(data: any) {
      console.log("setSession ====> ", data)
      useCookie('access_token').value = data.Accesstoken
      useCookie('refresh_token').value = data.Refreshtoken
      this.token = data.Accesstoken
      this.refreshToken = data.Refreshtoken
      // this.user = data.user
      this.fetchProfile();
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
      useCookie('rmf-auth').value = JSON.stringify({
        token: this.token,
        refreshToken: this.refreshToken,
        user: this.user,
      })
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
