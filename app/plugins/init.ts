/**
 * Plugin: initializes theme, screen, locale, session, and animations on app start.
 */
import { useThemeStore } from '../stores/theme'
import { useScreenStore } from '../stores/screen'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { useWebSocketNotifications } from '../composables/useWebSocketNotifications'
import { useHttp } from '../composables/useHttp'
import { useI18n } from '#imports'
import { useSession } from '../composables/useSession'
import { useAnimate } from '../composables/useAnimate'

export default defineNuxtPlugin(async (nuxtApp) => {
  const theme = useThemeStore()
  const screen = useScreenStore()
  const auth = useAuthStore()
  const notifications = useNotificationStore()
  // const { initLocale } = useI18n()
  // const session = useSession()
  const animate = useAnimate()

  // auth.restore()
 
  // Have a token but no profile yet (e.g. first SSR render after a reload)
  // if (auth.token && !auth.user) {
  //   await auth.fetchProfile()
  // }
  // Init locale
  // initLocale()

  // Init theme
  theme.init()

  // Init screen tracking
  screen.init()

  // Restore session
  // session.init()

  // Try to load real notifications from the backend
  if (import.meta.client) {
    notifications.fetchFromApi()
  }

  // Provide $http globally
  const http = useHttp()
  nuxtApp.provide('http', http)

  // Init animations after mount
  nuxtApp.hook('app:mounted', () => {
    animate.init()

    // Start the WebSocket notification stream (client only)
    if (import.meta.client) {
      useWebSocketNotifications().connect()
    }
  })

  // Re-observe [data-animate] elements on every route change
  nuxtApp.hook('page:finish', () => {
    animate.refresh()
  })

  // Cleanup on app teardown
  nuxtApp.hook('app:beforeUnmount', () => {
    screen.cleanup()
    animate.cleanup()
  })
})
