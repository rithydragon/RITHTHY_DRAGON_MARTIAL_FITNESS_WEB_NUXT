/**
 * useWeb
 * Rules:
 * GET  = delete
 * POST = list / create / update
 *
 * Auto refresh token when 401
 */

import { ref, readonly } from 'vue'
import axios from 'axios'

interface UseWebOptions {
  method?: 'GET' | 'POST'
  data?: Record<string, any>   // ✅ renamed from body → data
  body?: Record<string, any>   // legacy alias — maps onto data
  auth?: boolean
  headers?: Record<string, string>
}

export async function useWeb<T = any>(
  url: string,
  options: UseWebOptions = {}
) {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  console.log("URL _--------------------. ", url)

  const {
    method = 'GET',
    data: _data,
    body,
    auth = true,
    headers = {},
  } = options
  const payload = body ?? _data ?? {}

  const data = ref<T | null>(null)
  const error = ref<string | null>(null)

  const request = async (retry = true) => {
    try {
      const accessToken = useCookie('access_token')

      const requestHeaders: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      }

      if (auth && accessToken.value) {
        requestHeaders.Authorization = `Bearer ${accessToken.value}`
      }

      const response = await axios({
        // baseURL: String(config.public.apiBase || '').replace(/\/+$/, ''),
        // baseURL: getUrl(url),
        url:getUrl(url),
        method,
        headers: requestHeaders,
        ...(method === 'GET'
          ? { params: payload }
          : { data: payload }),
      })

      data.value = response.data
    } catch (err: any) {
      /* AUTO REFRESH TOKEN */
      if (err?.response?.status === 401 && retry && auth) {
        try {
          await useRefreshToken(true)
          return await request(false)
        } catch (refreshErr) {
          error.value = 'Session expired'
          return
        }
      }

      error.value =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err.message ||
        'Request failed'
    }
  }

  // Await the request before returning
  await request()

  return {
    data: readonly(data),
    error: readonly(error),
  }
}