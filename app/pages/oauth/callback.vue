<script setup lang="ts">
/**
 * OAuth Callback Handler
 *
 * Handles two flows:
 * 1. Direct token params — provider returned access_token/refresh_token as query params.
 * 2. Authorization code — provider returned `code`; exchange it for tokens via backend.
 *
 * After obtaining tokens the page verifies the user profile, stores the session,
 * and redirects to the original destination.
 */
const route = useRoute()
const auth = useAuthStore()

const status = ref<'loading' | 'error' | 'retrying'>('loading')
const errorMsg = ref('')
const processed = ref(false)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function param(name: string): string | null {
  const v = route.query[name]
  if (Array.isArray(v)) return v[0] ?? null
  return v ? String(v) : null
}

function readJson(key: string): any {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function clearPending() {
  try {
    localStorage.removeItem('rmf-oauth-pending')
    localStorage.removeItem('oauth_state')
    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('oauth_return')
  } catch { /* ignore */ }
}

/**
 * Exchange an authorization `code` for backend tokens.
 */
async function exchangeCode(code: string, state?: string | null): Promise<{ access_token: string; refresh_token?: string; expires_in?: number } | null> {
  const pending = readJson('rmf-oauth-pending')
  const provider = pending?.provider ?? 'google'
  try {
    const data = await $fetch(getUrl('/api/v1/auth/oauth/callback'), {
      method: 'POST',
      body: {
        code,
        provider,
        state: state || undefined,
      },
    })
    const d = data?.data ?? data
    if (d?.access_token) {
      return {
        access_token: d.access_token,
        refresh_token: d.refresh_token,
        expires_in: d.expires_in,
      }
    }
    return null
  } catch { return null }
}

async function fetchProfile(accessToken: string) {
  console.log("AccessToken in me auth callback function: ", accessToken)
  const res = await $fetch(getUrl('/api/v1/auth/me'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res?.data ?? res
}

/**
 * Verify the access token by loading the user profile.  Retries once using the
 * stored refresh token on 401.
 */
async function verifyAndStore(accessToken: string, refreshToken?: string | null) {
  try {
    const user = await fetchProfile(accessToken)
    console.log("User in verifyAndStore function: ", user)
    if (!user?.id && !user?.Name && !user?.name) throw new Error('Invalid profile')

    auth.setSession({ token: accessToken, refreshToken: refreshToken || '', user: normalizeUser(user) })
    return true
  } catch {
    // Try refresh
    if (refreshToken) {
      const refreshed = await useRefreshToken()
      if (refreshed && auth.token) {
        const user = await fetchProfile(auth.token)
        if (user?.id || user?.Id || user?.Name || user?.name) {
          auth.setSession({ token: auth.token, refreshToken: auth.refreshToken || '', user: normalizeUser(user) })
          return true
        }
      }
    }
    return false
  }
}

function normalizeUser(raw: any) {
  return {
    id: raw.id ?? raw.Id ?? 'oauth_user_' + Date.now(),
    name: raw.name ?? raw.Name ?? raw.email ?? raw.Email ?? 'Member',
    email: raw.email ?? raw.Email ?? '',
    avatar: raw.avatar ?? raw.Avatar ?? raw.image ?? raw.Image ?? null,
    role: raw.role ?? raw.Role ?? 'member',
  }
}

// ---------------------------------------------------------------------------
// Main flow
// ---------------------------------------------------------------------------

async function processCallback() {
  if (processed.value) return
  processed.value = true

  const state = param('state')
  const accessToken = param('access_token')
  const refreshToken = param('refresh_token')
  const expiresIn = param('expires_in')
  const code = param('code')
  const errorParam = param('error')
  const pending = readJson('rmf-oauth-pending')
  const pendingTs = pending?.ts ?? 0
  const expired = Date.now() - pendingTs > 30 * 60 * 1000 // 30 minutes

  // 1) OAuth error returned from provider
  if (errorParam) {
    errorMsg.value = decodeURIComponent(String(errorParam))
    status.value = 'error'
    clearPending()
    return
  }

  // 2) CSRF state check
  const storedState = localStorage.getItem('oauth_state') || sessionStorage.getItem('oauth_state')
  if (state && storedState && state !== storedState) {
    errorMsg.value = 'Security check failed — invalid state.'
    status.value = 'error'
    clearPending()
    return
  }

  // 3) Direct token params
  if (accessToken) {
    status.value = 'loading'
    const ok = await verifyAndStore(accessToken, refreshToken)
    if (ok) {
      clearPending()
      const dest = readJson('oauth_return')?.path || pending?.redirect || '/'
      navigateTo(dest, { replace: true })
      return
    }
    errorMsg.value = 'Could not verify your account. Please try again.'
    status.value = 'error'
    clearPending()
    return
  }

  // 4) Authorization code exchange
  if (code) {
    if (expired) {
      errorMsg.value = 'Login session expired. Please try again.'
      status.value = 'error'
      clearPending()
      return
    }
    const tokens = await exchangeCode(code, state)
    if (tokens?.access_token) {
      const ok = await verifyAndStore(tokens.access_token, tokens.refresh_token)
      if (ok) {
        clearPending()
        const dest = readJson('oauth_return')?.path || pending?.redirect || '/'
        navigateTo(dest, { replace: true })
        return
      }
    }
    errorMsg.value = 'Failed to complete login. Please try again.'
    status.value = 'error'
    clearPending()
    return
  }

  // 5) No recognized params — assume already authenticated
  if (auth.isLoggedIn) {
    navigateTo(pending?.redirect || '/', { replace: true })
    return
  }

  errorMsg.value = 'No authentication data received.'
  status.value = 'error'
  clearPending()
}

// Kick off
onMounted(processCallback)

function retry() {
  processed.value = false
  status.value = 'retrying'
  errorMsg.value = ''
  nextTick(processCallback)
}

const pendingProvider = computed(() => {
  try {
    const p = JSON.parse(localStorage.getItem('rmf-oauth-pending') || '{}')
    return p.provider ?? 'your account'
  } catch { return 'your account' }
})
</script>

<template>
  <div class="callback-page">
    <!-- Loading / retrying -->
    <template v-if="status === 'loading' || status === 'retrying'">
      <div class="spinner-ring">
        <span></span><span></span><span></span>
      </div>
      <h1 class="cb-title">Signing you in…</h1>
      <p class="cb-sub">Verifying your {{ pendingProvider }} account</p>
    </template>

    <!-- Error -->
    <template v-else>
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h1 class="cb-title cb-title--error">Login Failed</h1>
      <p class="cb-error-msg">{{ errorMsg || 'An unexpected error occurred.' }}</p>

      <div class="cb-actions">
        <NuxtLink to="/" class="btn btn-ghost">Back to Home</NuxtLink>
        <button class="btn btn-primary" @click="retry">Try Again</button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.callback-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
  background: var(--color-bg-secondary, #fafafa);
}

/* Spinner */
.spinner-ring {
  display: inline-block;
  position: relative;
  width: 48px;
  height: 48px;
  margin-bottom: .5rem;

  span {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 40px;
    height: 40px;
    margin: 4px;
    border: 3px solid transparent;
    border-radius: 50%;
    border-top-color: var(--color-gold, #eab308);
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;

    &:nth-child(2) { animation-delay: -0.15s; width: 34px; height: 34px; margin: 7px; }
    &:nth-child(3) { animation-delay: -0.3s;  width: 28px; height: 28px; margin: 10px; border-top-color: var(--color-gold, #d97706); }
  }
}

@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.cb-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text-primary, #1a1a1a);
  margin: 0 0 .5rem;

  &--error { color: #dc2626; }
}

.cb-sub {
  font-size: .875rem;
  color: var(--color-text-muted, #6b7280);
  margin: 0;
}

.error-icon {
  margin-bottom: 1rem;
  color: #dc2626;
  line-height: 1;
}

.cb-error-msg {
  font-size: .875rem;
  color: var(--color-text-secondary, #6b7280);
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

.cb-actions {
  display: flex;
  gap: .75rem;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: .6rem 1.25rem;
  border-radius: 10px;
  font-size: .875rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all .2s ease;
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--color-border, #d1d5db);
  color: var(--color-text-secondary, #4b5563);

  &:hover { background: rgba(0,0,0,.03); }
}

.btn-primary {
  background: var(--color-gold, #eab308);
  border: none;
  color: #fff;

  &:hover { background: var(--color-gold-dark, #ca8a04); transform: translateY(-1px); }
}
</style>