/**
 * useHttp — centralized API connectivity wrapper around $fetch.
 * Handles auth token injection, refresh-token retry, and error normalization.
 */

interface HttpOptions {
  headers?: Record<string, string>
  [key: string]: any
}

export function useHttp() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const baseURL = config.public.apiBase

  function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    return headers
  }

  async function request<T = any>(
    method: string,
    url: string,
    body?: any,
    options?: HttpOptions
  ): Promise<T> {
    const headers = {
      ...getAuthHeaders(),
      ...(options?.headers || {}),
    }

    try {
      const res = await $fetch.raw<T>(`${baseURL}${url}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      })

      return res._data as T
    } catch (err: any) {
      // Handle 401 — attempt token refresh then retry once
      if (err?.response?.status === 401 && authStore.refreshToken) {
        const refreshed = await useRefreshToken()
        if (refreshed) {
          const retryHeaders = {
            ...getAuthHeaders(),
            ...(options?.headers || {}),
          }
          const retryRes = await $fetch.raw<T>(`${baseURL}${url}`, {
            method,
            headers: retryHeaders,
            body: body ? JSON.stringify(body) : undefined,
            ...options,
          })
          return retryRes._data as T
        }
        authStore.logout()
        throw new Error('Session expired')
      }

      const message =
        err?.response?._data?.message ||
        err?.message ||
        'An unexpected error occurred'
      throw new Error(message)
    }
  }

  return {
    get: <T = any>(url: string, options?: HttpOptions) => request<T>('GET', url, undefined, options),
    post: <T = any>(url: string, body?: any, options?: HttpOptions) => request<T>('POST', url, body, options),
    put: <T = any>(url: string, body?: any, options?: HttpOptions) => request<T>('PUT', url, body, options),
    patch: <T = any>(url: string, body?: any, options?: HttpOptions) => request<T>('PATCH', url, body, options),
    delete: <T = any>(url: string, options?: HttpOptions) => request<T>('DELETE', url, undefined, options),
  }
}
