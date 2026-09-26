<script setup lang="ts">
/**
 * OAuth 2.0 Callback
 *
 * The backend completes the whole authorization-code exchange server-side
 * (state + PKCE are validated there), upserts the user, issues JWTs and
 * redirects the browser back to us:
 *
 *   /oauth/callback?access_token=...&refresh_token=...&expires_in=...
 *   /oauth/callback?error=<code>
 *
 * This page only has to: apply the returned session, hydrate the profile and
 * redirect to the destination the sign-in flow remembered.
 */
import type { AuthUser } from '~/stores/auth'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()

type FlowStatus = 'loading' | 'success' | 'error'

const PENDING_KEYS = ['oauth-pending', 'rmf-oauth-pending']

const status = ref<FlowStatus>('loading')
const errorMsg = ref('')
const pendingProvider = ref('')
const destination = ref('/')
const processed = ref(false)

let guard: ReturnType<typeof setTimeout> | null = null

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

function param(name: string): string | null {
  const v = route.query[name]
  if (Array.isArray(v)) return v[0] ?? null
  return v ? String(v) : null
}

function readJson(key: string): any {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function resolvePending(): any {
  for (const key of PENDING_KEYS) {
    const p = readJson(key)
    if (p) return p
  }
  try {
    const back = sessionStorage.getItem('oauth_return')
    if (back) {
      const parsed = JSON.parse(back)
      return parsed?.path ? { redirect: parsed.path } : null
    }
  } catch { /* ignore */ }
  return null
}

function clearPending() {
  for (const key of PENDING_KEYS) {
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  }
  try { sessionStorage.removeItem('oauth_return') } catch { /* ignore */ }
}

function pick(src: any, ...names: string[]): string | undefined {
  for (const n of names) {
    const v = src?.[n]
    if (v !== undefined && v !== null && v !== '') return String(v)
  }
  return undefined
}

/** Map the backend's CurrentUser payload onto the app's AuthUser shape. */
function buildUser(raw: any): AuthUser | null {
  if (!raw || typeof raw !== 'object') return null
  const id = pick(raw, 'id', 'Id', 'ID')
  if (!id) return null

  const email = pick(raw, 'email', 'Email', 'EMAIL') || ''
  const firstName = pick(raw, 'firstName', 'FirstName', 'first_name')
  const lastName = pick(raw, 'lastName', 'LastName', 'last_name')
  const username = pick(raw, 'username', 'Username', 'USERNAME')
  const avatar = pick(raw, 'avatar', 'Avatar', 'avatarUrl', 'AvatarUrl', 'image', 'Image')
  const isSuper = raw?.IsSuperuser === true || raw?.isSuperuser === true

  let role: AuthUser['role'] = 'member'
  const roleRaw = pick(raw, 'role', 'Role')?.toLowerCase()
  if (roleRaw === 'admin' || isSuper) role = 'admin'

  const name =
    [firstName, lastName].filter(Boolean).join(' ') ||
    username ||
    email.split('@')[0] ||
    'Member'

  return { id, name, email, avatar: avatar || undefined, role }
}

function friendlyError(code: string): string {
  const c = String(code || '').trim().toLowerCase()
  if (!c) return t('oauth.error_generic')
  if (/access_denied|denied|cancelled|cancel/.test(c)) return t('oauth.error_access_denied')
  if (/state/.test(c)) return t('oauth.error_invalid_state')
  if (/expired/.test(c)) return t('oauth.error_expired')
  return t('oauth.error_generic')
}

async function fetchProfile(accessToken: string): Promise<any> {
  try {
    const res: any = await $fetch(getUrl('/api/v1/auth/me'), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res?.data ?? res
  } catch {
    return null
  }
}

function go(path: string) {
  const p = typeof path === 'string' && path.startsWith('/') ? path : '/'
  if (import.meta.client) navigateTo(p, { replace: true })
}

/* ------------------------------------------------------------------ *
 * Main flow
 * ------------------------------------------------------------------ */

async function fail(key: string) {
  errorMsg.value = t(key)
  status.value = 'error'
  clearPending()
}

async function complete(accessToken: string, refreshToken: string | null, expiresIn?: number) {
  const applied = auth.applySession({
    data: { accessToken, refreshToken, expiresIn },
  })
  if (!applied) {
    await fail('oauth.error_no_data')
    return
  }

  // Remembered device: rotate to a long-lived refresh token (the OAuth
  // redirect can only carry the default backend expiry).
  if (auth.remember) {
    await auth.prolongSession()
  }

  // Hydrate (and normalize) the profile — the token itself was minted by the
  // backend, so a slow /me must never block the sign-in.
  const raw = await fetchProfile(accessToken)
  const user = buildUser(raw)
  if (user) {
    auth.user = user
    auth.persistUser()
  } else if (auth.user) {
    auth.user = buildUser(auth.user) ?? auth.user
    auth.persistUser()
  }

  clearPending()
  status.value = 'success'
  setTimeout(() => go(destination.value), 800)
}

async function processCallback() {
  if (processed.value) return
  processed.value = true
  status.value = 'loading'
  errorMsg.value = ''

  const pending = resolvePending()
  pendingProvider.value = pending?.provider || ''
  destination.value = pending?.redirect || '/'

  const errorParam = param('error')
  const accessToken = param('access_token')
  const refreshToken = param('refresh_token')
  const expiresIn = Number(param('expires_in')) || undefined

  // 1) The provider/backend reported a failure (user cancelled, etc.)
  if (errorParam) {
    errorMsg.value = friendlyError(errorParam)
    status.value = 'error'
    clearPending()
    return
  }

  // 2) Backend delivered a fresh session.
  if (accessToken) {
    await complete(accessToken, refreshToken, expiresIn)
    return
  }

  // 3) No params — only meaningful if a session already exists.
  if (auth.isLoggedIn) {
    clearPending()
    go(destination.value)
    return
  }

  await fail('oauth.error_no_data')
}

function armGuard() {
  if (guard) clearTimeout(guard)
  guard = setTimeout(() => {
    if (status.value === 'loading') {
      processed.value = false
      errorMsg.value = t('oauth.error_timeout')
      status.value = 'error'
    }
  }, 15_000)
}

function retry() {
  if (status.value === 'success') return
  processed.value = false
  status.value = 'loading'
  errorMsg.value = ''
  armGuard()
  processCallback()
}

const providerLabel = computed(() => {
  const p = String(pendingProvider.value || '').trim()
  if (!p) return 'OAuth'
  return p.charAt(0).toUpperCase() + p.slice(1)
})

onMounted(() => {
  armGuard()
  processCallback()
})

onBeforeUnmount(() => {
  if (guard) clearTimeout(guard)
})
</script>

<template>
  <div class="oauth-page">
    <div
      class="oauth-card"
      role="status"
      :aria-live="status === 'error' ? 'assertive' : 'polite'"
    >
      <div class="oauth-brand">
        <span class="oauth-brand__mark" aria-hidden="true">
          <i class="ri-dumbbell-line"></i>
        </span>
        <span class="oauth-brand__name">RTY Fitness</span>
      </div>

      <template v-if="status === 'loading'">
        <div class="oauth-spinner" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <h1 class="oauth-title">{{ t('oauth.verifying_title') }}</h1>
        <p class="oauth-sub">{{ t('oauth.verifying_sub', { provider: providerLabel }) }}</p>
      </template>

      <template v-else-if="status === 'success'">
        <div class="oauth-badge oauth-badge--success" aria-hidden="true">
          <i class="ri-check-line"></i>
        </div>
        <h1 class="oauth-title">{{ t('oauth.success_title') }}</h1>
        <p class="oauth-sub">{{ t('oauth.success_sub') }}</p>
      </template>

      <template v-else>
        <div class="oauth-badge oauth-badge--error" aria-hidden="true">
          <i class="ri-close-line"></i>
        </div>
        <h1 class="oauth-title oauth-title--error">{{ t('oauth.error_title') }}</h1>
        <p class="oauth-msg">{{ errorMsg }}</p>
        <div class="oauth-actions">
          <NuxtLink to="/" class="oauth-btn oauth-btn--ghost">{{ t('oauth.back_home') }}</NuxtLink>
          <button class="oauth-btn oauth-btn--primary" @click="retry">
            {{ t('oauth.try_again') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.oauth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
  background-color: var(--c-bg, #0a0a0a);
  background-image:
    radial-gradient(circle at 20% 10%, var(--c-primary-soft, rgba(201, 162, 39, 0.12)), transparent 45%),
    radial-gradient(circle at 85% 85%, var(--c-secondary-soft, rgba(139, 30, 30, 0.12)), transparent 45%);
}

.oauth-card {
  width: 100%;
  max-width: 400px;
  background: var(--c-surface, #161616);
  border: 1px solid var(--c-border, #2a2a2a);
  border-radius: var(--radius-lg, 1.25rem);
  box-shadow: var(--shadow-lg, 0 12px 40px rgba(0, 0, 0, 0.6));
  padding: var(--space-4, 2rem);
  text-align: center;
  animation: oauth-card-in 0.35s var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1)) both;
}

.oauth-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  margin-bottom: var(--space-3, 1.5rem);

  &__mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-md, 0.75rem);
    font-size: 1.25rem;
    color: #fff;
    background: linear-gradient(135deg, #d4af37, var(--c-primary, #c9a227) 60%, #8a6a1f);
    box-shadow: var(--shadow-gold, 0 0 24px rgba(201, 162, 39, 0.25));
  }

  &__name {
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: var(--c-text, #f5f5f5);
  }
}

.oauth-spinner {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-2, 1rem);

  span {
    position: absolute;
    box-sizing: border-box;
    display: block;
    width: 40px;
    height: 40px;
    margin: 4px;
    border: 3px solid transparent;
    border-top-color: var(--c-primary, #c9a227);
    border-radius: 50%;
    animation: oauth-spin 1.1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;

    &:nth-child(2) {
      width: 32px;
      height: 32px;
      margin: 8px;
      animation-delay: -0.35s;
      border-top-color: var(--c-primary-soft, rgba(201, 162, 39, 0.4));
    }

    &:nth-child(3) {
      width: 24px;
      height: 24px;
      margin: 12px;
      animation-delay: -0.55s;
      border-top-color: var(--c-secondary, #8b1e1e);
    }
  }
}

.oauth-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 1.5rem;
  margin-bottom: var(--space-2, 1rem);

  &--success {
    color: #fff;
    background: var(--c-success, #2e7d32);
    box-shadow: 0 0 0 6px var(--c-success, #2e7d32);
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--c-success, #2e7d32) 18%, transparent);
  }

  &--error {
    color: #fff;
    background: var(--c-error, #d32f2f);
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--c-error, #d32f2f) 18%, transparent);
  }
}

.oauth-title {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--c-text, #f5f5f5);

  &--error {
    color: var(--c-error, #d32f2f);
  }
}

.oauth-sub {
  margin: 0;
  font-size: 0.875rem;
  color: var(--c-text-muted, #9a9a9a);
}

.oauth-msg {
  margin: 0 0 var(--space-3, 1.5rem);
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--c-text-muted, #9a9a9a);
}

.oauth-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.oauth-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.3rem;
  border-radius: var(--radius-md, 0.75rem);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s) ease;

  &--primary {
    border: none;
    color: #fff;
    background: linear-gradient(135deg, #d4af37, var(--c-primary, #c9a227));

    &:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
      box-shadow: var(--shadow-gold, 0 0 24px rgba(201, 162, 39, 0.25));
    }
  }

  &--ghost {
    border: 1px solid var(--c-border, #2a2a2a);
    color: var(--c-text-muted, #9a9a9a);
    background: transparent;

    &:hover {
      color: var(--c-text, #f5f5f5);
      background: var(--c-primary-soft, rgba(201, 162, 39, 0.08));
    }
  }
}

@keyframes oauth-card-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes oauth-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>