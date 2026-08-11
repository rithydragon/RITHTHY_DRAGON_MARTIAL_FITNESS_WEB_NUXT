/**
 * useSession — manages session lifecycle: restore on init, fetch profile, heartbeat.
 */
export function useSession() {
  const authStore = useAuthStore()

  async function init() {
    authStore.restore()
    if (authStore.isAuthenticated) {
      await authStore.fetchProfile()
    }
  }

  async function heartbeat() {
    if (!authStore.isAuthenticated) return
    try {
      const { $http } = useNuxtApp()
      await $http.get('/auth/heartbeat')
    } catch {
      // silent fail — heartbeat is non-critical
    }
  }

  function startHeartbeat(intervalMs = 60000) {
    if (typeof window === 'undefined') return
    heartbeat()
    return window.setInterval(heartbeat, intervalMs)
  }

  function stopHeartbeat(handle) {
    if (typeof window === 'undefined') return
    window.clearInterval(handle)
  }

  return {
    init,
    heartbeat,
    startHeartbeat,
    stopHeartbeat,
  }
}
