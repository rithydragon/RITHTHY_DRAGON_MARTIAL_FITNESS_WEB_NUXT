/**
 * useRefreshToken — attempts to refresh the auth token using the stored refresh token.
 * Returns true on success, false on failure.
 */
export async function useRefreshToken() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  if (!authStore.refreshToken) return false

  try {
    const res = await $fetch(`${config.public.apiBase}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: authStore.refreshToken }),
    })

    authStore.token = res.token
    authStore.refreshToken = res.refreshToken
    authStore.persist()
    return true
  } catch {
    return false
  }
}
