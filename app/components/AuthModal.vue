<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="auth-modal__overlay">
        <div class="auth-modal">
          <button class="auth-modal__close" @click="close" :aria-label="t('common.close')">
            <i class="ri-close-line"></i>
          </button>

          <header class="auth-modal__header">
            <h2 class="auth-modal__title">{{ titleText }}</h2>
            <p class="auth-modal__subtitle">{{ subtitleText }}</p>
          </header>

          <!-- OAuth Social Login Tiers -->
          <div class="auth-modal__oauth-section">
            <p class="auth-modal__oauth-heading">{{ mode === 'login' ? t('auth.socialLogin') : t('auth.socialSignUp') }}</p>
            <div class="auth-modal__oauth">
              <button
                v-for="provider in providers"
                :key="provider.id"
                :class="['auth-modal__oauth-btn', `auth-modal__oauth-btn--${provider.id}`]"
                @click="handleOAuth(provider.id)"
                :disabled="auth.loading || oauthLoading !== null"
                :aria-label="provider.Name"
              >
                <i v-if="oauthLoading === provider.id" class="ri-loader-4-line animate-spin"></i>
                <i v-else :class="provider.icon"></i>
                <span>{{ provider.name }}</span>
              </button>
            </div>
            <p v-if="oauthError" class="auth-modal__oauth-error">
              <i class="ri-error-warning-line"></i> {{ oauthError }}
            </p>
          </div>

          <div class="auth-modal__divider">
            <span>{{ t('common.or') || 'OR WITH EMAIL' }}</span>
          </div>

          <form class="auth-modal__form" @submit.prevent="handleSubmit">
            <div v-if="mode === 'register' || mode === 'join'" class="auth-modal__field">
              <label>{{ t('auth.fullName') }}</label>
              <input v-model="form.Name" type="text" required :placeholder="t('auth.fullName')" :disabled="auth.loading"/>
            </div>

            <div class="auth-modal__field">
              <label>{{ t('auth.email') }}</label>
              <input v-model="form.Email" type="email" required :placeholder="t('auth.email')" :disabled="auth.loading"/>
            </div>

            <div v-if="mode === 'register' || mode === 'join'" class="auth-modal__field">
              <label>{{ t('auth.phone') }}</label>
              <input v-model="form.Phone" type="tel" :placeholder="t('auth.phone')" :disabled="auth.loading"/>
            </div>

            <div class="auth-modal__field">
              <label>{{ t('auth.password') }}</label>
              <input v-model="form.Password" type="password" required :placeholder="t('auth.password')" :disabled="auth.loading"/>
            </div>

            <div v-if="mode === 'login'" class="auth-modal__remember">
              <label class="auth-modal__remember-label">
                <input v-model="remember" type="checkbox" @change="onRememberChange" />
                <span><i class="ri-device-line"></i> {{ t('auth.rememberMe') }}</span>
              </label>
            </div>

            <div v-if="mode === 'register'" class="auth-modal__field">
              <label>{{ t('auth.confirmPassword') }}</label>
              <input v-model="form.ConfirmPassword" type="password" required :placeholder="t('auth.confirmPassword')" :disabled="auth.loading"/>
            </div>

            <div v-if="mode === 'join'" class="auth-modal__plans">
              <label
                v-for="plan in plans"
                :key="plan.id"
                class="auth-modal__plan"
                :class="{ 'is-selected': selectedPlan === plan.id }"
              >
                <input type="radio" v-model="selectedPlan" :value="plan.id" name="plan" />
                <span class="auth-modal__plan-name">{{ t(`auth.plan${plan.label}`) }}</span>
                <span class="auth-modal__plan-price">${{ plan.price }}{{ t('auth.planMonthly') }}</span>
              </label>
            </div>

            <button type="submit" class="btn btn--primary auth-modal__submit" :disabled="auth.loading">
              <div v-if="auth.loading">
                <i class="ri-loader-4-line animate-spin"></i>
              </div>
              {{ submitText }}
            </button>
          </form>

          <p class="auth-modal__switch">
            <span v-if="mode === 'login'">{{ t('auth.noAccount') }} </span>
            <span v-else>{{ t('auth.haveAccount') }} </span>
            <button @click="switchMode">{{ switchText }}</button>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Telegram Login Widget popup panel -->
  <Teleport to="body">
    <Transition name="tp">
      <div v-if="telegramOpen" class="tp-card__overlay" @click.self="closeTelegram">
        <div class="tp-card" role="dialog" aria-modal="true" :aria-label="t('auth.telegramWidgetTitle')">
          <button class="tp-card__x" @click="closeTelegram" :aria-label="t('common.close')">
            <i class="ri-close-line"></i>
          </button>
          <div class="tp-card__brand">
            <i class="ri-telegram-fill"></i>
          </div>
          <h3 class="tp-card__title">{{ t('auth.telegramWidgetTitle') }}</h3>
          <p class="tp-card__sub">{{ t('auth.telegramWidgetSubtitle') }}</p>

          <div class="tp-card__body">
            <p v-if="twSigning" class="tp-card__signing">
              <i class="ri-loader-4-line animate-spin"></i> {{ t('auth.telegramWidgetSigningIn') }}
            </p>
            <div v-else class="tp-card__widget">
              <button class="tg-auth-button" type="button">Sign In with Telegram</button>
            </div>
            <p v-if="twError" class="tp-card__error">
              <i class="ri-error-warning-line"></i> {{ twError }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useEventListener } from '@vueuse/core'

type AuthMode = 'login' | 'register' | 'join'
type PlanCode =
  | 'FREE'
  | 'BASIC'
  | 'PROFESSIONAL'
  | 'ELITE'
  
const props = defineProps<{
  isOpen: boolean
  mode: AuthMode
}>()

const emit = defineEmits<{
  close: []
  switchMode: [mode: AuthMode]
}>()

const { t, locale } = useI18n()
const auth = useAuthStore()

const form = reactive({
  Name: '',
  Email: '',
  Phone: '',
  Password: '',
  ConfirmPassword: '',
})

const remember = ref(auth.remember)

function onRememberChange() {
  auth.setRemember(remember.value)
}

const plans = [
  { id: 'free', code: 'FREE', label: 'Free', price: 0 },
  { id: 'basic', code: 'BASIC', label: 'Basic', price: 49 },
  { id: 'pro', code: 'PRO', label: 'Pro', price: 99 },
  { id: 'elite', code: 'ELITE', label: 'Elite', price: 199 },
] as const

// const selectedPlan = ref<'free' | 'basic' | 'pro' | 'elite'>('pro')
const selectedPlan = ref<PlanCode>('FREE')

const providers = [
  { id: 'google', name: 'Google', icon: 'ri-google-fill' },
  { id: 'telegram', name: 'Telegram', icon: 'ri-telegram-fill' },
  { id: 'tiktok', name: 'TikTok', icon: 'ri-tiktok-fill' },
  { id: 'facebook', name: 'Facebook', icon: 'ri-facebook-circle-fill' },
] as const

const router = useRouter()

const titleText = computed(() => {
  const map: Record<AuthMode, string> = {
    login: t('auth.loginTitle') || 'Welcome Back',
    register: t('auth.registerTitle') || 'Create Account',
    join: t('auth.joinTitle') || 'Join Rithy Martial & Fitness',
  }
  return map[props.mode]
})

const subtitleText = computed(() => {
  const map: Record<AuthMode, string> = {
    login: t('auth.loginSubtitle') || 'Sign in to access your training timetable & membership.',
    register: t('auth.registerSubtitle') || 'Start your Cambodian martial arts transformation today.',
    join: t('auth.joinSubtitle') || 'Select a membership pass and get instant access.',
  }
  return map[props.mode]
})

const submitText = computed(() => {
  const map: Record<AuthMode, string> = {
    login: t('common.login') || 'Sign In',
    register: t('common.register') || 'Create Account',
    join: t('auth.selectPlan') || 'Confirm Membership',
  }
  return map[props.mode]
})

const switchText = computed(() => {
  return props.mode === 'login' ? (t('common.register') || 'Sign Up') : (t('common.login') || 'Sign In')
})

function close() {
  emit('close')
}

useEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (props.isOpen) close()
    if (telegramOpen.value) closeTelegram()
  }
})

watch(() => auth.isLoggedIn, (loggedIn) => {
  if (loggedIn && props.isOpen) close()
})

function switchMode() {
  emit('switchMode', props.mode === 'login' ? 'register' : 'login')
}

async function handleSubmit() {
  try {
    if (props.mode === 'login') {
      await auth.login(form.Email, form.Password, remember.value)
      close()
    } else if (props.mode === 'register') {
      await auth.register({
        Name: form.Name,
        Email: form.Email,
        Password: form.Password,
        Phone: form.Phone,
      })
      close()
    } else if (props.mode === 'join') {
      const res: any = await auth.joinPlan(selectedPlan.value, {
        Name: form.Name,
        Email: form.Email,
        Password: form.Password,
        Phone: form.Phone,
      })

      if (res?.RequiresPayment) {
        // PAID PLAN: Close modal & take user directly to payment/checkout page
        close()
        const checkoutUrl = res.checkoutUrl || `/checkout?subscriptionId=${res.subscriptionId}&paymentId=${res.paymentId}`
        router.push(checkoutUrl)
      } else {
        // FREE PLAN: Immediately authenticate & close modal
        close()
      }
    }
  } catch {
    // error is stored in auth.error
  }
}


const oauthLoading = ref<string | null>(null)
const oauthError = ref('')

const telegramOpen = ref(false)
const twSigning = ref(false)
const twError = ref('')
const telegramClientId = ref(0)
const telegramNonce = ref('')
let telegramSdkPromise: Promise<boolean> | null = null

type TelegramOAuthResult = {
  id_token?: string
  error?: string
  error_description?: string
}

const TELEGRAM_LOGIN_SCRIPT = 'https://oauth.telegram.org/js/telegram-login.js?6'

function closeTelegram() {
  const sdk = (window as any).Telegram?.Login
  sdk?.close?.()
  telegramOpen.value = false
  twSigning.value = false
  twError.value = ''
  telegramClientId.value = 0
  telegramNonce.value = ''
  if ((window as any).onTelegramOauth === handleTelegramOauth) {
    delete (window as any).onTelegramOauth
  }
}

async function handleTelegramOauth(data: TelegramOAuthResult) {
  if (twSigning.value) return
  if (data?.error) {
    twError.value = data.error_description || data.error
    return
  }
  if (!data?.id_token) {
    twError.value = t('auth.telegramUnavailable') || 'Telegram login is not available right now.'
    return
  }

  const isDev = import.meta.client && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  if (isDev && data.id_token === 'dev-mock-id-token') {
    // Development bypass: mock successful login without backend call
    twSigning.value = true
    try {
      // Create a mock user session for development
      const mockUser = {
        id: 'dev-user-1',
        name: 'Dev User',
        email: 'dev@localhost',
        avatar: undefined,
        role: 'member' as const,
      }
      const nuxtApp = useNuxtApp()
      nuxtApp.runWithContext(() => {
        auth.applySession({
          data: {
            access_token: 'dev-mock-access-token',
            refresh_token: 'dev-mock-refresh-token',
            expires_in: 86400,
            user: mockUser,
          }
        }, true)
      })
      await auth.fetchProfile()
      closeTelegram()
      close()
    } finally {
      twSigning.value = false
    }
    return
  }

  twSigning.value = true
  twError.value = ''
  try {
    await auth.completeTelegramLogin(data.id_token, telegramNonce.value)
    closeTelegram()
    close()
  } catch (err: any) {
    closeTelegram()
    oauthError.value = err?.response?.data?.error || err?.message || (t('auth.telegramUnavailable') || 'Telegram login is not available right now.')
  } finally {
    twSigning.value = false
  }
}

function initializeTelegramSdk(): boolean {
  if (!import.meta.client || !telegramClientId.value || !telegramNonce.value) return false
  const sdk = (window as any).Telegram?.Login
  if (!sdk || typeof sdk.init !== 'function') return false
  try {
    sdk.init(
      {
        client_id: telegramClientId.value,
        scope: ['openid', 'profile', 'write'],
        lang: locale.value === 'km' || locale.value === 'zh' ? locale.value : 'en',
        nonce: telegramNonce.value,
      },
      handleTelegramOauth,
    )
    return true
  } catch {
    return false
  }
}

async function waitForTelegramSdk(): Promise<boolean> {
  if (initializeTelegramSdk()) return true
  if (telegramSdkPromise) return telegramSdkPromise

  telegramSdkPromise = new Promise<boolean>((resolve) => {
    let script = document.querySelector<HTMLScriptElement>(`script[data-telegram-login][src="${TELEGRAM_LOGIN_SCRIPT}"]`)
    if (!script) {
      script = document.createElement('script')
      script.async = true
      script.src = TELEGRAM_LOGIN_SCRIPT
      script.setAttribute('data-client-id', String(telegramClientId.value))
      script.setAttribute('data-request-access', 'write')
      script.setAttribute('data-onauth', 'window.onTelegramOauth(data)')
      script.dataset.telegramLogin = 'true'
      document.head.appendChild(script)
    }

    const finish = () => {
      const ready = initializeTelegramSdk()
      if (ready) resolve(true)
    }
    const fail = () => resolve(false)
    script.addEventListener('load', finish, { once: true })
    script.addEventListener('error', fail, { once: true })
    window.setTimeout(() => {
      if (!initializeTelegramSdk()) resolve(false)
    }, 10000)
  })

  try {
    return await telegramSdkPromise
  } finally {
    telegramSdkPromise = null
  }
}

async function handleTelegram() {
  if (oauthLoading.value !== null) return
  oauthError.value = ''
  closeTelegram()
  oauthLoading.value = 'telegram'
  try {
    auth.setRemember(remember.value)
    
    // Development bypass: simulate Telegram login on localhost
    const isDev = import.meta.client && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    if (isDev) {
      // Mock a successful Telegram login for local development
      telegramOpen.value = true
      await nextTick()
      // Simulate user clicking the widget
      setTimeout(() => {
        handleTelegramOauth({
          id_token: 'dev-mock-id-token',
          error: undefined,
          error_description: undefined,
        })
      }, 500)
      return
    }

    const cfg = await auth.telegramPreflight()
    const clientId = Number(cfg?.client_id)
    telegramClientId.value = clientId
    telegramNonce.value = String(cfg?.nonce || '')
    if (!Number.isSafeInteger(clientId) || clientId <= 0 || !telegramNonce.value) {
      throw new Error('Telegram login is not configured')
    }
    ;(window as any).onTelegramOauth = handleTelegramOauth
    telegramOpen.value = true
    await nextTick()
    if (!(await waitForTelegramSdk())) {
      throw new Error('Telegram Login SDK could not be loaded')
    }
  } catch (err: any) {
    oauthError.value = err?.domain
      ? (t('auth.telegramDomainHint') || 'Telegram widget requires a public HTTPS domain.')
      : (err?.response?.data?.error || err?.message || t('auth.telegramUnavailable') || 'Telegram login is not available right now.')
    closeTelegram()
  } finally {
    oauthLoading.value = null
  }
}

async function handleOAuth(providerId: 'google' | 'telegram' | 'facebook' | 'tiktok') {
  if (providerId === 'telegram') {
    await handleTelegram()
    return
  }
  if (oauthLoading.value !== null) return
  oauthError.value = ''
  oauthLoading.value = providerId
  try {
    auth.setRemember(remember.value)
    
    // Development bypass: simulate OAuth login on localhost
    const isDev = import.meta.client && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    if (isDev) {
      // Mock a successful OAuth login for local development
      const mockUser = {
        id: `dev-${providerId}-user-1`,
        name: `Dev ${providerId.charAt(0).toUpperCase() + providerId.slice(1)} User`,
        email: `dev-${providerId}@localhost`,
        avatar: undefined,
        role: 'member' as const,
      }
      const nuxtApp = useNuxtApp()
      nuxtApp.runWithContext(() => {
        auth.applySession({
          data: {
            access_token: `dev-mock-${providerId}-access-token`,
            refresh_token: `dev-mock-${providerId}-refresh-token`,
            expires_in: 86400,
            user: mockUser,
          }
        }, true)
      })
      await auth.fetchProfile()
      close()
      return
    }

    await auth.loginWithProvider(providerId)
    close()
  } catch (err: any) {
    // oauth/initiate + telegram/config verify on the backend that the provider
    // is configured and that the origin can host the Telegram widget. Surface
    // a friendly message instead of swallowing the failure.
    oauthError.value =
      providerId === 'telegram' && err?.domain
        ? (t('auth.telegramDomainHint') || 'Telegram widget requires a public HTTPS domain.')
        : providerId === 'telegram'
          ? (t('auth.telegramUnavailable') || 'Telegram login is not available right now.')
          : (err?.response?.data?.message ||
              err?.message ||
              t('auth.oauthFailed') ||
              'The social login could not be started. Please try again.')
  } finally {
    oauthLoading.value = null
  }
}
</script>

<style lang="scss" scoped>
.auth-modal__overlay {
  position: fixed;
  inset: 0;
  background: var(--c-overlay, rgba(0, 0, 0, 0.75));
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: var(--space-2, 1rem);
}

.auth-modal {
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--c-surface, #18181c);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-4, 2rem);
  position: relative;
  box-shadow: var(--shadow-lg);
}

.auth-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--c-border);
  color: var(--c-muted, #9ca3af);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--c-primary);
    background: var(--c-primary-soft);
    border-color: var(--c-primary);
  }
}

.auth-modal__header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.auth-modal__title {
  font-size: 1.5rem;
  margin-bottom: 0.35rem;
}

.auth-modal__subtitle {
  font-size: 0.875rem;
  color: var(--c-muted, #9ca3af);
}

.auth-modal__oauth-section {
  margin-bottom: 1.25rem;
}

.auth-modal__oauth-heading {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--c-muted, #9ca3af);
  margin-bottom: 0.75rem;
  text-align: center;
}

.auth-modal__oauth {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

.auth-modal__oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md, 10px);
  background: transparent;
  color: var(--c-text);
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  i {
    font-size: 1.1rem;
  }
}

.auth-modal__oauth-btn--google:hover {
  background: rgba(234, 67, 53, 0.15);
  border-color: #ea4335;
  color: #ea4335;
}

.auth-modal__oauth-btn--telegram:hover {
  background: rgba(36, 161, 222, 0.15);
  border-color: #24A1DE;
  color: #24A1DE;
}

.auth-modal__oauth-btn--tiktok:hover {
  background: rgba(0, 242, 254, 0.15);
  border-color: #00F2FE;
  color: #00F2FE;
}

.auth-modal__oauth-btn--facebook:hover {
  background: rgba(24, 119, 242, 0.15);
  border-color: #1877F2;
  color: #1877F2;
}

.auth-modal__oauth-error {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.925rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(244, 63, 94, 0.35);
  background: rgba(244, 63, 94, 0.1);
  color: #fb7185;
  border-radius: var(--radius-md, 10px);
  font-size: 0.8rem;
  line-height: 1.45;

  i {
    margin-top: 2px;
    flex-shrink: 0;
  }
}

.tp-card__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  padding: 1rem;
}

.tp-card {
  position: relative;
  width: 100%;
  max-width: 360px;
  padding: 2rem 1.75rem 1.75rem;
  background: var(--c-surface, #161616);
  border: 1px solid var(--c-border, #2a2a2a);
  border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  text-align: center;

  &__x {
    position: absolute;
    top: 0.9rem;
    right: 0.9rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: transparent;
    border: 1px solid var(--c-border);
    color: var(--c-muted, #9ca3af);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: var(--c-text);
      border-color: var(--c-primary);
      background: var(--c-primary-soft);
    }
  }

  &__brand {
    width: 52px;
    height: 52px;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(36, 161, 222, 0.15);
    color: #24a1de;
    font-size: 1.6rem;
  }

  &__title {
    margin: 0 0 0.4rem;
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--c-text, #f5f5f4);
  }

  &__sub {
    margin: 0 0 1.5rem;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--c-muted, #9ca3af);
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
  }

  &__widget {
    min-height: 48px;
    display: flex;
    justify-content: center;
  }

  &__signing {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    padding: 0.6rem 0.9rem;
    border: 1px solid rgba(231, 201, 95, 0.3);
    background: rgba(231, 201, 95, 0.08);
    color: #e7c95f;
    border-radius: 12px;
    font-size: 0.8rem;
  }

  &__error {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    width: 100%;
    margin: 0;
    padding: 0.65rem 0.85rem;
    border: 1px solid rgba(244, 63, 94, 0.35);
    background: rgba(244, 63, 94, 0.1);
    color: #fb7185;
    border-radius: 12px;
    font-size: 0.8rem;
    line-height: 1.45;
    text-align: left;

    i {
      margin-top: 2px;
      flex-shrink: 0;
    }
  }
}

.tp-enter-active,
.tp-leave-active {
  transition: opacity 0.22s ease;
}

.tp-enter-active .tp-card,
.tp-leave-active .tp-card {
  transition: transform 0.22s ease;
}

.tp-enter-from,
.tp-leave-to {
  opacity: 0;
}

.tp-enter-from .tp-card {
  transform: translateY(14px) scale(0.96);
}

.tp-leave-to .tp-card {
  transform: translateY(14px) scale(0.96);
}

.auth-modal__divider {
  text-align: center;
  margin: 1.25rem 0;
  position: relative;

  span {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--c-muted, #9ca3af);
    background: var(--c-surface, #18181c);
    padding: 0 0.75rem;
    position: relative;
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--c-border);
  }
}

.auth-modal__field {
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--c-muted, #9ca3af);
    margin-bottom: 0.35rem;
  }

  input {
    width: 100%;
    padding: 0.65rem 0.85rem;
    background: var(--c-bg);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-md, 8px);
    color: var(--c-text);
    font-size: 0.875rem;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--c-primary, #eab308);
    }
  }
}

.auth-modal__remember {
  margin: -0.25rem 0 1rem;
  display: flex;
  justify-content: flex-start;

  &-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--c-muted, #9ca3af);
    user-select: none;
    transition: color 0.2s ease;

    &:hover { color: var(--c-text); }

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      accent-color: var(--c-primary, #eab308);
      cursor: pointer;
    }

    i {
      font-size: 0.95rem;
      color: var(--c-primary, #eab308);
    }
  }
}

.auth-modal__plans {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.auth-modal__plan {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  transition: all 0.2s ease;

  input { display: none; }

  &.is-selected {
    border-color: var(--c-primary, #eab308);
    background: var(--c-primary-soft);
  }
}

.auth-modal__plan-name {
  font-size: 0.75rem;
  font-weight: 600;
}

.auth-modal__plan-price {
  font-size: 0.65rem;
  color: var(--c-muted, #9ca3af);
}

.auth-modal__submit {
  width: 100%;
  margin-top: 0.5rem;
  justify-content: center;
}

.auth-modal__switch {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.8125rem;
  color: var(--c-muted, #9ca3af);

  button {
    background: transparent;
    border: none;
    color: var(--c-primary, #eab308);
    font-weight: 600;
    cursor: pointer;
    margin-left: 0.3rem;

    &:hover {
      text-decoration: underline;
    }
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .auth-modal,
.modal-leave-active .auth-modal {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .auth-modal {
  transform: translateY(30px) scale(0.95);
}

.modal-leave-to .auth-modal {
  transform: translateY(30px) scale(0.95);
}
</style>
