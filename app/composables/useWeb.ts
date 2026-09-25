/**
 * useWeb
 *   GET  -> query params
 *   POST -> JSON body
 *
 * Auto-refreshes the access token on 401 and retries ONCE with the
 * freshly returned token (not with a re-read of the cookie, which can
 * still be stale in the same tick).
 */

import { ref, readonly } from 'vue'
import axios from 'axios'
interface UseWebOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: Record<string, any>
  body?: Record<string, any> // legacy alias
  auth?: boolean
  headers?: Record<string, string>
}

export async function useWeb<T = any>(url: string, options: UseWebOptions = {}) {
  const nuxtApp = useNuxtApp()
  let accessToken = useCookie('access_token').value

  const { method = 'GET', data: _data, body, headers = {} } = options
  const auth = options.auth  ?? (accessToken ? true : false)
  const payload = body ?? _data ?? {}

  const data = ref<T | null>(null)
  const error = ref<string | null>(null)
  const status = ref<number | null>(null)

  // read once, synchronously, while the Nuxt context is guaranteed alive
  // let accessToken = useCookie('access_token').value
  // let accessToken = auth ? useCookie<string | null>(ACCESS_COOKIE).value ?? null : null

  
  const request = async (retry = true): Promise<void> => {
    try {
      const requestHeaders: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      }
      if (accessToken) {
        requestHeaders.Authorization = `Bearer ${accessToken}`
      }

      const response = await axios({
        url: getUrl(url),
        method,
        headers: requestHeaders,
        ...(method === 'GET' ? { params: payload } : { data: payload }),
      })

      status.value = response.status
      data.value = response.data
      error.value = null
    } catch (err: any) {
      status.value = err?.response?.status ?? null

      if (err?.response?.status === 401 && retry && auth) {
        const newToken = await nuxtApp.runWithContext(() => useRefreshToken(true))
        if (newToken) {
          accessToken = newToken // use it directly, do not re-read the cookie
          return await request(false)
        }
        error.value = 'Session expired'
        return
      }

      error.value =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Request failed'
    }
  }

  await request()

  return {
    data: readonly(data),
    error: readonly(error),
    status: readonly(status),
  }
}