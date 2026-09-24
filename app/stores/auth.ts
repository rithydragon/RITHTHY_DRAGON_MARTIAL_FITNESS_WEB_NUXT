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
  loading: boolean
  error: string | null
  isUserLogged: boolean | null
}

/* ------------------------------------------------------------------
   Cookie names — ONE place, imported by every other file.
------------------------------------------------------------------ */
export const ACCESS_COOKIE = 'access_token'
export const REFRESH_COOKIE = 'refresh_token'
export const USER_COOKIE = 'auth_user'

const LEGACY_COOKIES = ['expire_in', 'rmf-auth', 'rama_access_token', 'user_data']

export const ACCESS_MAX_AGE = 60 * 60 * 24       // 1 day
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/* ------------------------------------------------------------------
   secure flag must reflect the ACTUAL protocol, not the build mode.
   A `secure` cookie on http:// is silently dropped by the browser —
   one of the most common "the cookie is never stored" causes.
------------------------------------------------------------------ */
function isSecureContext(): boolean {
  if (import.meta.client) return window.location.protocol === 'https:'
  try {
    return useRequestURL().protocol === 'https:'
  } catch {
    return false
  }
}

export function cookieOptions(maxAge: number = REFRESH_MAX_AGE) {
  return {
    maxAge,
    sameSite: 'lax' as const,
    secure: isSecureContext(),
    path: '/',
    /**
     * MUST stay false.
     * Per RFC 6265 §5.3, a browser REJECTS any cookie carrying the HttpOnly
     * attribute when it arrives from a non-HTTP API — i.e. from a client-side
     * document.cookie write, which is exactly what useCookie does in the
     * browser. With httpOnly: true the client-side write silently does
     * nothing and the app also can no longer read the token back for the
     * Authorization header.
     * If you want real HttpOnly cookies, they have to come from the backend's
     * Set-Cookie header — see the notes at the bottom of this file.
     */
    httpOnly: false,
  }
}

/**
 * Options for deleting a cookie.
 * Deletion only matches on name + path + domain, so these must mirror the
 * options the cookie was written with. Assigning null to the ref is what
 * actually removes it — Nuxt serializes an already-expired cookie for us.
 */
export function expireCookieOptions() {
  return {
    sameSite: 'lax' as const,
    secure: isSecureContext(),
    path: '/',
    maxAge: 0,
  }
}

/* ------------------------------------------------------------------
   Case-insensitive key lookup.
   Backend sends Accesstoken / AccessToken / access_token depending on
   the endpoint; the old code hard-coded one spelling per call site,
   so half of them resolved to `undefined`.
------------------------------------------------------------------ */
function pickKey(src: any, ...names: string[]): string | null {
  if (!src || typeof src !== 'object') return null
  const lower = new Map(Object.keys(src).map((k) => [k.toLowerCase(), k]))
  for (const n of names) {
    const real = lower.get(n.toLowerCase())
    const v = real ? src[real] : undefined
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number') return String(v)
  }
  return null
}

export interface NormalizedSession {
  token: string | null
  refreshToken: string | null
  expiresIn: number | null
  user: AuthUser | null
}

/** Accepts res, res.data, or res.data.data and returns one flat shape. */
export function normalizeSession(payload: any): NormalizedSession {
  const d = payload?.data ?? payload ?? {}
  const inner = d?.data && typeof d.data === 'object' ? d.data : d
  const src = { ...inner, ...d }
  return {
    token: pickKey(src, 'accessToken', 'access_token', 'token', 'jwt'),
    refreshToken: pickKey(src, 'refreshToken', 'refresh_token'),
    expiresIn: Number(pickKey(src, 'expiresIn', 'expires_in', 'expire_in')) || null,
    user: (src.user ?? src.User ?? src.profile ?? null) as AuthUser | null,
  }
}

/* ------------------------------------------------------------------
   Token cookie writer. Never assigns null/undefined unless clearing —
   assigning a falsy value to a useCookie ref DELETES the cookie.
------------------------------------------------------------------ */
export function writeTokenCookies(
  token: string | null,
  refreshToken: string | null,
  expiresIn: number | null = null,
) {
  if (token) {
    const age = expiresIn && expiresIn > 60 ? expiresIn : ACCESS_MAX_AGE
    useCookie(ACCESS_COOKIE, cookieOptions(age)).value = token
  }
  if (refreshToken) {
    useCookie(REFRESH_COOKIE, cookieOptions(REFRESH_MAX_AGE)).value = refreshToken
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: useCookie<string | null>(ACCESS_COOKIE).value,
    refreshToken: useCookie<string | null>(REFRESH_COOKIE).value,
    loading: false,
    error: null,
    isUserLogged: null,
  }),

  getters: {
    // derived, so it can never drift out of sync with the token
    isAuthenticated: (state) => !!state.token,
    isLoggedIn: (state) => !!state.token && !!state.user,
    useRole: (state) => state.user?.role || '',
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
    /* --------------------------------------------------------------
       LOGIN
       Note: useNuxtApp() is captured BEFORE the await. Every composable
       used after the await runs inside runWithContext, otherwise on SSR
       you get "nuxt instance unavailable" and no cookie is ever written.
    -------------------------------------------------------------- */
    async login(email: string, password: string) {
      const nuxtApp = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const res: any = await axios.post(getUrl('/api/v1/auth/login'), {
          Email: email,
          Password: password,
        })

        const applied = nuxtApp.runWithContext(() => this.applySession(res))
        if (!applied) {
          throw new Error('Login succeeded but no access token was returned')
        }

        if (!this.user) await this.fetchProfile()
        return res
      } catch (err: any) {
        this.error =
          err?.response?.data?.message ??
          err?.response?.data?.detail ??
          err?.message ??
          'Login failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(data: { Name: string; Email: string; Password: string; Phone?: string }) {
      const nuxtApp = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const res: any = await axios.post(getUrl('/api/v1/auth/register'), {
          Name: data.Name,
          Email: data.Email,
          Password: data.Password,
          Phone: data.Phone,
        })
        nuxtApp.runWithContext(() => this.applySession(res))
        return res
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Registration failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    /* --------------------------------------------------------------
       THE ONLY PLACE THAT WRITES AUTH COOKIES
       Synchronous on purpose: no awaits, so the Nuxt context is alive.
    -------------------------------------------------------------- */
    applySession(payload: any): boolean {
      const { token, refreshToken, expiresIn, user } = normalizeSession(payload)

      if (!token) {
        // Do NOT wipe an existing session just because one response was odd.
        console.warn('[auth] applySession: no token found in payload', payload?.data ?? payload)
        return false
      }

      this.token = token
      if (refreshToken) this.refreshToken = refreshToken
      if (user) this.user = user

      writeTokenCookies(token, refreshToken ?? this.refreshToken, expiresIn)
      this.persistUser()
      return true
    },

    /* --------------------------------------------------------------
       REFRESH (store-level). Delegates to the shared composable so
       there is a single refresh implementation and a single in-flight
       lock across the whole app.
    -------------------------------------------------------------- */
    async refreshAccessToken(): Promise<boolean> {
      const newToken = await useRefreshToken(true)
      return !!newToken
    },

    async loginWithProvider(provider: 'google' | 'telegram' | 'facebook' | 'tiktok') {
      this.loading = true
      this.error = null
      try {
        const res: any = await axios.post(getUrl('/api/v1/auth/oauth/initiate'), {
          Provider: provider,
        })
        console.log("Response ==================> ", res)
        const redirectUrl = res?.data?.data?.redirectUrl ?? res?.data?.RedirectUrl
        console.log("Redirect URL ==================> ", redirectUrl)
        if (redirectUrl && import.meta.client) {
          localStorage.setItem(
            'oauth-pending',
            JSON.stringify({ provider, redirect: '/', ts: Date.now() }),
          )
          window.location.href = redirectUrl
        }
        return res
      } catch (err: any) {
        // Previously this fabricated a fake session on failure, which put a
        // bogus token in the store and cookies. Fail loudly instead.
        this.error = err?.response?.data?.message || err?.message || 'OAuth initiation failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async joinPlan(
      plan: 'free' | 'basic' | 'pro' | 'elite',
      userData?: { Name?: string; Email?: string; Password?: string; Phone?: string },
    ) {
      const nuxtApp = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        // headers belong in the CONFIG argument, not in the body
        const res: any = await axios.post(
          getUrl('/api/v1/memberships/join'),
          { plan, ...(userData || {}) },
          { headers: this.token ? { Authorization: `Bearer ${this.token}` } : {} },
        )
        if (normalizeSession(res).token) {
          nuxtApp.runWithContext(() => this.applySession(res))
        }
        return res
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Failed to join plan'
        throw err
      } finally {
        this.loading = false
      }
    },

    async completePayment(paymentId: number, paymentMethod = 'aba_khqr') {
      this.loading = true
      this.error = null
      try {
        return await axios.post(
          getUrl(`/api/v1/memberships/payments/${paymentId}/complete`),
          { payment_method: paymentMethod },
          { headers: this.token ? { Authorization: `Bearer ${this.token}` } : {} },
        )
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Failed to complete payment'
        throw err
      } finally {
        this.loading = false
      }
    },

    /* --------------------------------------------------------------
       PROFILE
       A failed profile fetch must NOT log the user out. useWeb already
       handles 401 + refresh; if it still fails it is a network/server
       problem, not an invalid session.
    -------------------------------------------------------------- */
    async fetchProfile() {
      if (!this.token) return
      const nuxtApp = useNuxtApp()
      const { data } = await axios.get(getUrl('/api/v1/auth/me'), {
        withCredentials: true,
      })

      // if (error.value) {
      //   console.warn('[auth] fetchProfile failed:', error.value)
      //   return
      // }

      const body: any = data
      const raw = body?.data ?? body
      if (!raw) {
        console.warn('[auth] fetchProfile failed:', data)
        this.user = null
        this.token = null
        this.refreshToken = null
        this.error = null
        this.clearAuthCookies()
        return
      }
      this.user = raw

      // this.user = {
      //   id: raw.id ?? raw.Id ?? 'member',
      //   name: raw.name ?? raw.Name ?? raw.email ?? raw.Email ?? 'Member',
      //   email: raw.email ?? raw.Email ?? '',
      //   avatar: raw.avatar ?? raw.Avatar ?? raw.image ?? raw.Image ?? undefined,
      //   role: raw.role ?? raw.Role ?? 'member',
      //   plan: raw.plan ?? raw.Plan ?? undefined,
      // }
      nuxtApp.runWithContext(() => this.persistUser())
    },

    /**
     * async so callers can `await auth.logout()` before navigating.
     * useCookie writes through a watcher that flushes after the current
     * synchronous block, so navigating immediately can outrun the deletion.
     */
    async logout() {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.error = null
      this.clearAuthCookies()
      await nextTick()
    },

    clearAuthCookies() {
      const names = [ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE, ...LEGACY_COOKIES]
      for (const name of names) {
        useCookie(name, expireCookieOptions()).value = null
      }
    },

    /* --------------------------------------------------------------
       Only the user profile goes in this cookie — never the tokens.
       Duplicating tokens across three cookies was both a size risk
       (>4 KB cookies are dropped silently) and a source of drift.
    -------------------------------------------------------------- */
    persistUser() {
      if (!this.user) return
      try {
        const json = JSON.stringify(this.user)
        if (json.length > 3000) {
          console.warn('[auth] user payload too large for a cookie, skipping persist')
          return
        }
        useCookie(USER_COOKIE, cookieOptions(REFRESH_MAX_AGE)).value = json
      } catch {
        /* ignore */
      }
    },

    /** Rehydrate the store from cookies. Call this from a plugin on every load. */
    restore() {
      this.token = useCookie<string | null>(ACCESS_COOKIE).value || null
      this.refreshToken = useCookie<string | null>(REFRESH_COOKIE).value || null

      const rawUser = useCookie<any>(USER_COOKIE).value
      if (rawUser) {
        try {
          this.user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser
        } catch {
          this.user = null
        }
      }
    },
  },
})
/* ------------------------------------------------------------------
   NOTE — if you do want HttpOnly cookies

   A cookie can only get the HttpOnly attribute from a Set-Cookie response
   header. The browser rejects it from document.cookie, and in the browser
   useCookie writes via document.cookie. The usual split is:

   1. Backend sets ONLY the refresh token:
        Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Lax; Path=/
   2. Backend returns the access token in the JSON body.
   3. Frontend keeps the access token in the Pinia store (memory only) and
      sends it as Authorization: Bearer.
   4. /auth/refresh is called with axios { withCredentials: true } and no
      body — the browser attaches the HttpOnly refresh cookie itself.

   That removes writeTokenCookies() and restore()'s ACCESS_COOKIE read.
   The cost is that a page reload always needs one refresh round-trip before
   the app is authenticated again.
------------------------------------------------------------------ */