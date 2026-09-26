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

export interface TelegramOIDCConfig {
  configured: boolean
  client_id: number | string
  nonce: string
  scope?: string
  request_access?: string
  origin?: string
  domain_ok?: boolean
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  remember: boolean
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
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30       // 30 days (default)
export const REMEMBER_MAX_AGE = 60 * 60 * 24 * 365     // 1 year (remembered device)

export const DEVICE_ID_KEY = 'rmf-device-id'
export const REMEMBER_KEY = 'rmf-remember'

/* ------------------------------------------------------------------
   Device detection — a stable per-browser identifier that survives
   logout. A "remembered" device stays alive across future sessions.
------------------------------------------------------------------ */
export function getDeviceId(): string {
  if (!import.meta.client) return ''
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(DEVICE_ID_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

export function getRemembered(): boolean {
  if (!import.meta.client) return false
  try {
    return localStorage.getItem(REMEMBER_KEY) === '1'
  } catch {
    return false
  }
}

export function setRemembered(value: boolean) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(REMEMBER_KEY, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

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

export function normalizeUser(raw: any): AuthUser | null {
  if (!raw || typeof raw !== 'object') return null
  const id = pickKey(raw, 'id', 'userId', 'ID', 'Id')
  if (!id) return null
  const email = pickKey(raw, 'email', 'EMAIL', 'Email') || ''
  const firstName = pickKey(raw, 'firstName', 'FirstName', 'first_name', 'given_name') || ''
  const lastName = pickKey(raw, 'lastName', 'LastName', 'last_name', 'family_name') || ''
  const username = pickKey(raw, 'username', 'Username', 'USERNAME', 'preferred_username') || ''
  const name = pickKey(raw, 'name', 'Name') || [firstName, lastName].filter(Boolean).join(' ') || username || 'Member'
  const avatar = pickKey(raw, 'avatar', 'Avatar', 'avatarUrl', 'AvatarUrl', 'picture', 'image') || undefined
  const isSuperuser = raw.IsSuperuser === true || raw.isSuperuser === true
  const roleValue = pickKey(raw, 'role', 'Role')?.toLowerCase()
  return {
    id,
    name,
    email,
    avatar,
    role: roleValue === 'admin' || isSuperuser ? 'admin' : 'member',
  }
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
  remember = false,
) {
  if (token) {
    const age = expiresIn && expiresIn > 60 ? expiresIn : ACCESS_MAX_AGE
    useCookie(ACCESS_COOKIE, cookieOptions(age)).value = token
  }
  if (refreshToken) {
    const age = remember ? REMEMBER_MAX_AGE : REFRESH_MAX_AGE
    useCookie(REFRESH_COOKIE, cookieOptions(age)).value = refreshToken
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: useCookie<string | null>(ACCESS_COOKIE).value,
    refreshToken: useCookie<string | null>(REFRESH_COOKIE).value,
    remember: getRemembered(),
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
    async login(email: string, password: string, remember?: boolean) {
      console.log( "Registert ---------------  > ", email,password, remember)
      const nuxtApp = useNuxtApp()
      const rememberFlag = remember ?? this.remember
      this.loading = true
      this.error = null
      try {
        const res: any = await axios.post(getUrl('/api/v1/rty/dragon/site/auth/login'), {
          email: email,
          password: password,
          remember: rememberFlag,
        })

        const applied = nuxtApp.runWithContext(() => this.applySession(res, rememberFlag))
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

    async register(data: { name: string;username:string, email: string; password: string; phone?: string }, remember?: boolean) {
      console.log( "Registert ---------------  > ", data, remember)
      const nuxtApp = useNuxtApp()
      this.loading = true
      this.error = null
      const rememberFlag = remember ?? this.remember
      try {
        const res: any = await axios.post(getUrl('/api/v1/rty/dragon/site/auth/register'), {
          name: data.name,
          username: data.username,
          email: data.email,
          password: data.password,
          phone: data.phone,
          remember: rememberFlag
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
    applySession(payload: any, remember?: boolean): boolean {
      const { token, refreshToken, expiresIn, user } = normalizeSession(payload)
      console.log("ApplySession user ===========> ",user)

      if (!token) {
        // Do NOT wipe an existing session just because one response was odd.
        console.warn('[auth] applySession: no token found in payload', payload?.data ?? payload)
        return false
      }

      const rem = remember ?? this.remember
      this.token = token
      if (refreshToken) this.refreshToken = refreshToken
      if (user) {
        this.user = {
          ...user,
          id: user.id ? decryptAES(user.id) : '',
          username: user.username ? decryptAES(user.username) : '',
          email: user.email ? decryptAES(user.email) : '',
          phone: user.phone ? decryptAES(user.phone) : null
        };
      }
      writeTokenCookies(token, refreshToken ?? this.refreshToken, expiresIn, rem)
      this.persistUser()
      useUserData({
        ...(this.user || {}),
        device_id: getDeviceId(),
        access_token: token,
        refresh_token: refreshToken ?? this.refreshToken,
        expires_in: expiresIn,
      })
      return true
    },

    /* --------------------------------------------------------------
       REMEMBER
       Marks this device as "alive" — future logins skip re-auth by
       storing a long-lived (1 year) refresh token for this browser.
    -------------------------------------------------------------- */
    setRemember(value: boolean) {
      this.remember = value
      setRemembered(value)
    },

    /* --------------------------------------------------------------
       PROLONG
       Rotate to a remember-aware refresh token (called after OAuth /
       join flows where the backend can only issue the default expiry).
    -------------------------------------------------------------- */
    async prolongSession(): Promise<boolean> {
      if (!this.refreshToken) return false
      const nuxtApp = useNuxtApp()
      try {
        const res: any = await axios.post(getUrl('/api/v1/auth/refresh'), {
          refresh_token: this.refreshToken,
          Remember: this.remember,
        })
        return nuxtApp.runWithContext(() => this.applySession(res, this.remember))
      } catch {
        return false
      }
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
      if (provider === 'telegram') {
        return this.telegramPreflight()
      }
      this.loading = true
      this.error = null
      try {
        const res: any = await axios.post(getUrl('/api/v1/auth/oauth/initiate'), {
          Provider: provider,
        })
        const redirectUrl = res?.data?.data?.redirectUrl ?? res?.data?.RedirectUrl
        if (redirectUrl && import.meta.client) {
          localStorage.setItem(
            'oauth-pending',
            JSON.stringify({ provider, redirect: '/', ts: Date.now() }),
          )
          const locale = ((useNuxtApp().$i18n as any)?.locale?.value ?? 'en') as string
          const lang = locale === 'km' || locale === 'zh' ? locale : 'en'
          const widgetUrl = new URL(redirectUrl, window.location.origin)
          widgetUrl.searchParams.set('lang', lang)
          window.location.href = widgetUrl.toString()
        }
        return res
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'OAuth initiation failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async telegramPreflight(): Promise<TelegramOIDCConfig | null> {
      if (!import.meta.client) return null
      const res: any = await axios.get(getUrl('/api/v1/auth/oauth/telegram/config'))
      const data = res?.data?.data as TelegramOIDCConfig | undefined
      if (!data?.configured || !data.client_id || !data.nonce) {
        throw new Error('Telegram login is not configured')
      }
      if (data.domain_ok === false) {
        const err: any = new Error('Telegram login domain is not valid for this origin')
        err.domain = true
        throw err
      }
      return data
    },

    async completeTelegramLogin(idToken: string, nonce: string): Promise<boolean> {
      if (!idToken || !nonce) {
        throw new Error('Telegram did not return a valid ID token')
      }
      const nuxtApp = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const res: any = await axios.post(
          getUrl('/api/v1/auth/oauth/telegram/oidc'),
          { id_token: idToken, nonce, remember: this.remember },
          { headers: { Accept: 'application/json' }, withCredentials: true },
        )
        const body: any = res?.data
        if (!body?.success || !body?.data?.access_token) {
          throw new Error(body?.error || 'Telegram login failed')
        }
        const applied = nuxtApp.runWithContext(() =>
          this.applySession({ data: body.data }, this.remember),
        )
        if (!applied) throw new Error('Telegram login failed')
        await this.fetchProfile()
        return true
      } catch (err: any) {
        this.error = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Telegram login failed'
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
          { plan, ...(userData || {}), Remember: this.remember },
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
        headers: { Authorization: `Bearer ${this.token}` },
      })

      const body: any = data
      const raw = body?.data ?? body
      const user = normalizeUser(raw)
      if (!user) {
        this.user = null
        this.token = null
        this.refreshToken = null
        this.error = null
        this.clearAuthCookies()
        return
      }
      this.user = user
      nuxtApp.runWithContext(() => {
        this.persistUser()
        useUserData({
          ...(this.user || {}),
          access_token: this.token,
          refresh_token: this.refreshToken,
        })
      })
    },

    /**
     * async so callers can `await auth.logout()` before navigating.
     * useCookie writes through a watcher that flushes after the current
     * synchronous block, so navigating immediately can outrun the deletion.
     */
    async logout() {
      const token = this.token
      this.user = null
      this.token = null
      this.refreshToken = null
      this.error = null
      this.clearAuthCookies()
      useUserData(null)
      if (token && import.meta.client) {
        try {
          await axios.post(
            getUrl('/api/v1/auth/logout'),
            null,
            { headers: { Authorization: `Bearer ${token}` } },
          )
        } catch {
          // best-effort server-side revoke; local cookies are already gone
        }
      }
      await nextTick()
    },

    clearAuthCookies() {
      const names = [ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE, 'rty_user_data', ...LEGACY_COOKIES]
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
      this.remember = getRemembered()

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