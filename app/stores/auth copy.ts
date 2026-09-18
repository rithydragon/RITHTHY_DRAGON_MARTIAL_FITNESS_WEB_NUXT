import axios from 'axios'
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

export const useAuthStore1 = defineStore('auth', {
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
        const res: any = await axios.post(getUrl('/api/v1/auth/login'), {
          Email: email, Password: password
        })

        console.log("response login ====> ", res)
        // useCookie('access_token', this.cookieOptions(60 * 60)).value = res.data.access_token
        // useCookie('refresh_token', this.cookieOptions(60 * 60 * 24 * 30)).value = res.data.refreshToken
        useCookie('access_token', this.cookieOptions()).value = res.data.Accesstoken
        useCookie('refresh_token', this.cookieOptions()).value = res.data.Refreshtoken
        // if (expiresIn) useCookie('expire_in', this.cookieOptions()).value = String(expiresIn)
        // if(isNotEmpty(res.data)){
        //   this.setSession(res.data)
        // }
        this.setSession(res.data)
        return res
      } catch (err: any) {
        err?.response?.data?.message ?? err?.message ?? 'Login failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(data: { Name: string; Email: string; Password: string; Phone?: string }) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.post(getUrl('/api/v1/auth/register'), {
          Name: data.Name,
          Email: data.Email,
          Password: data.Password,
          Phone: data.Phone
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
        const res: any = await axios.post(getUrl('/api/v1/auth/refresh'), {
          RefreshToken: this.refreshToken,
        })

        const d = res?.data ?? res
        const token = d?.token || d?.AccessToken || d?.access_token
        const refreshToken = d?.refreshToken || d?.RefreshToken || d?.refresh_token

        if (!token) return false

        this.token = token
        if (refreshToken) this.refreshToken = refreshToken
        this.persist()

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
        const res = await axios.post(getUrl(`/api/v1/auth/oauth/initiate`), {
          Provider: provider
        })
        if (res.data?.redirectUrl && typeof window !== 'undefined') {
          // Remember which provider initiated the flow so /oauth/callback
          // can verify the access token and fetch the right user profile.
          localStorage.setItem('rmf-oauth-pending', JSON.stringify({
            provider,
            redirect: '/',
            ts: Date.now(),
          }))
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
        const res: any = await axios.post(getUrl('/api/v1/memberships/join'), {
          headers,
          plan,
          ...(userData || {}),
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
        const res: any = await axios.post(getUrl(`/api/v1/memberships/payments/${paymentId}/complete`), {
          payment_method: paymentMethod,
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
        const { data: ref } = await useWeb('/api/v1/auth/me')
        const body = ref?.value
        const raw = body?.data ?? body
        if (raw) {
          this.user = {
            id: raw.id ?? raw.Id ?? 'member',
            name: raw.name ?? raw.Name ?? raw.email ?? raw.Email ?? 'Member',
            email: raw.email ?? raw.Email ?? '',
            avatar: raw.avatar ?? raw.Avatar ?? raw.image ?? raw.Image ?? undefined,
            role: raw.role ?? raw.Role ?? 'member',
            plan: raw.plan ?? raw.Plan ?? undefined,
          }
          this.persist()
        }
      } catch (err) {
        console.error('fetchProfile error ====> ', err)
        this.logout()
      }
    },

    setSession(data: any) {
      const d = data?.data ?? data
      console.log("setSession data ====> ", d)
      const token = d?.token || d?.AccessToken || d?.Accesstoken || d?.access_token || null
      const refreshToken = d?.refreshToken || d?.RefreshToken || d?.Refreshtoken || d?.refresh_token || null
      const expiresIn = d?.expires_in ?? d?.ExpiresIn ?? d?.Expiresin ?? d?.expire_in ?? null

      if (token) this.token = token
      if (refreshToken) this.refreshToken = refreshToken
      if (d?.user) this.user = d.user

      this.isAuthenticated = !!this.token

      // Persist tokens + user data to cookies (JS-readable, sameSite lax, secure in prod)
      useCookie('access_token', this.cookieOptions()).value = token
      useCookie('refresh_token', this.cookieOptions()).value = refreshToken
      if (expiresIn) useCookie('expire_in', this.cookieOptions()).value = String(expiresIn)

      // Store complete Pinia session
      this.persist()

      // If the session payload already contains the profile, use it directly.
      if (d?.user) return
      this.fetchProfile()

      // Only fetch profile when backend didn't return user
      if (!this.user && this.token) {
        console.log("fetchProfile ============================================")
        this.fetchProfile()
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isAuthenticated = false
      this.clearAuthCookies()
    },

    cookieOptions(maxAge = 60 * 60 * 24 * 30) {
      return {
        maxAge,
        sameSite: 'lax' as const,
        secure: import.meta.env.PROD,
        path: '/',
      }
    },

    clearAuthCookies() {
      for (const name of ['access_token', 'refresh_token', 'expire_in', 'rmf-auth', 'rama_access_token', 'user_data']) {
        useCookie(name, { ...this.cookieOptions(), maxAge: 0 }).value = null
        if (typeof document !== 'undefined') {
          document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
        }
      }
    },

    persist() {
      try {
        useCookie('rmf-auth', this.cookieOptions()).value = JSON.stringify({
          token: this.token,
          refreshToken: this.refreshToken,
          user: this.user,
        })
      } catch { /* ignore */ }
    },

    restore() {
      const raw = useCookie('rmf-auth').value
      if (!raw) return
      try {
        const data = JSON.parse(raw)
        this.token = data.token || null
        this.refreshToken = data.refreshToken || null
        this.user = data.user || null
        this.isAuthenticated = !!data.token
      } catch {
        this.clearPersisted()
      }
    },

    clearPersisted() {
      useCookie('rmf-auth', { ...this.cookieOptions(), maxAge: 0 }).value = null
      if (typeof document !== 'undefined') {
        document.cookie = `rmf-auth=; Max-Age=0; Path=/; SameSite=Lax`
      }
    },
  },
})
