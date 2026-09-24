/**
 * Token refresh — single implementation, single in-flight lock.
 *
 * Returns the NEW access token string on success, or null on failure.
 * Callers must use the returned token directly: a cookie written in this
 * tick is not guaranteed to be readable back from document.cookie yet,
 * which is why the old retry kept sending the expired token.
 */

import axios from 'axios'
import {
  useAuthStore,
  normalizeSession,
  writeTokenCookies,
  cookieOptions,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
} from '~/stores/auth'

let inFlight: Promise<string | null> | null = null

function isJwtExpired(token: string): boolean {
  const parts = token.split('.')
  // Not a JWT (opaque token): we cannot tell, so assume it is still valid
  // and let the 401 handler drive the refresh.
  if (parts.length !== 3) return false
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json)
    if (!payload?.exp) return false
    // 30s of slack to avoid edge-case 401s
    return payload.exp * 1000 < Date.now() + 30_000
  } catch {
    return false
  }
}

async function doRefresh(refreshToken: string): Promise<string | null> {
  const nuxtApp = useNuxtApp()
  try {
    const authStore = useAuthStore()
    // Send every casing the backend might expect; extra keys are ignored.
    const response = await axios.post(getUrl('/api/v1/auth/refresh'), {
      refresh_token: refreshToken,
      refreshToken,
      RefreshToken: refreshToken,
      Remember: authStore.remember,
    })

    const session = normalizeSession(response)
    if (!session.token) {
      console.warn('[auth] refresh response had no access token', response?.data)
      return null
    }

    return nuxtApp.runWithContext(() => {
      writeTokenCookies(session.token, session.refreshToken, session.expiresIn, authStore.remember)

      authStore.token = session.token
      if (session.refreshToken) authStore.refreshToken = session.refreshToken
      if (session.user) authStore.user = session.user
      authStore.persistUser()

      return session.token
    })
  } catch (err: any) {
    // Only a rejected refresh token means the session is really dead.
    // A network error or a 500 must not wipe the user's cookies.
    const status = err?.response?.status
    const rejected = status === 400 || status === 401 || status === 403

    nuxtApp.runWithContext(() => {
      if (rejected) {
        useCookie(ACCESS_COOKIE, { ...cookieOptions(), maxAge: 0 }).value = null
        useCookie(REFRESH_COOKIE, { ...cookieOptions(), maxAge: 0 }).value = null
        useAuthStore().logout()
      }
    })

    if (rejected && import.meta.client) {
      const path = typeof localePath === 'function' ? localePath('/?auth=login') : '/?auth=login'
      await nuxtApp.runWithContext(() => navigateTo(path, { replace: true }))
    }
    return null
  }
}

export const useRefreshToken = async (force = false): Promise<string | null> => {
  // Join an in-flight refresh instead of starting a second one.
  if (inFlight) return inFlight

  const currentAccess = useCookie<string | null>(ACCESS_COOKIE).value
  const refreshToken = useCookie<string | null>(REFRESH_COOKIE).value

  if (!refreshToken) {
    useAuthStore().logout()
    if (import.meta.client) {
      const path = typeof localePath === 'function' ? localePath('/?auth=login') : '/?auth=login'
      await navigateTo(path, { replace: true })
    }
    return null
  }

  // Access token still good and no force: nothing to do.
  if (!force && currentAccess && !isJwtExpired(currentAccess)) {
    return currentAccess
  }

  inFlight = doRefresh(refreshToken).finally(() => {
    inFlight = null
  })

  return inFlight
}
