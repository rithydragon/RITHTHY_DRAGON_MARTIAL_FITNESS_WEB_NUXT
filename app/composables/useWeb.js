/**
 * useWeb
 * Rules:
 * GET  = delete
 * POST = list / create / update
 * Auto refresh token when 401
 */

import { ref, readonly } from 'vue'
import axios from 'axios'

export async function useWeb(url, options = {}) {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const {
    method = 'POST',
    data: payload = {},
    auth = true,
    headers = {},
  } = options

  const data = ref(null)
  const error = ref(null)

  const request = async (retry = true) => {
    try {
      const accessToken = useCookie('access_token')

      const requestHeaders = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      }

      if (auth && accessToken.value) {
        requestHeaders.Authorization = `Bearer ${accessToken.value}`
      }

      const response = await axios({
        baseURL: config.public.apiBase,
        url,
        method,
        headers: requestHeaders,
        ...(method === 'GET'
          ? { params: payload }
          : { data: payload }),
      })

      data.value = response.data
    } catch (err) {
      if (err?.response?.status === 401 && retry && auth) {
        try {
          await authStore.refreshAccessToken()
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

  await request()

  return {
    data: readonly(data),
    error: readonly(error),
  }
}
