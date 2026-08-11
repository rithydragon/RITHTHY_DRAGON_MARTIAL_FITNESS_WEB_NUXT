/**
 * Plugin: initializes theme, screen, locale, session, and animations on app start.
 */
import { useThemeStore } from '../stores/theme'
import { useScreenStore } from '../stores/screen'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { useHttp } from '../composables/useHttp'
import { useI18n } from '../composables/useI18n'
import { useSession } from '../composables/useSession'
import { useAnimate } from '../composables/useAnimate'

export default defineNuxtPlugin((nuxtApp) => {
  const theme = useThemeStore()
  const screen = useScreenStore()
  const auth = useAuthStore()
  const notifications = useNotificationStore()
  const { initLocale } = useI18n()
  const session = useSession()
  const animate = useAnimate()

  // Init locale
  initLocale()

  // Init theme
  theme.init()

  // Init screen tracking
  screen.init()

  // Restore session
  session.init()

  // Seed demo notifications
  notifications.fetchInitialNotifications()

  // Provide $http globally
  const http = useHttp()
  nuxtApp.provide('http', http)

  // Init animations after mount
  nuxtApp.hook('app:mounted', () => {
    animate.init()
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
