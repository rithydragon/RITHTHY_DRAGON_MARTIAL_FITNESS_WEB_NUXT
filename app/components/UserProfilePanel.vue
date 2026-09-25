<template>
  <Teleport to="body">
    <Transition name="user-panel-fade">
      <div
        v-if="ui.userPanelOpen"
        class="user-panel-backdrop"
        @click="closePanel"
      />
    </Transition>

    <aside
      id="user-profile-panel"
      class="user-panel"
      :class="{ 'is-open': ui.userPanelOpen }"
      :aria-hidden="!ui.userPanelOpen"
      :inert="!ui.userPanelOpen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-panel-title"
    >
      <div class="user-panel__header">
        <div>
          <p class="user-panel__eyebrow">{{ t('profile.eyebrow') }}</p>
          <h2 id="user-panel-title" class="user-panel__title">{{ t('profile.title') }}</h2>
        </div>
        <button
          class="user-panel__close"
          type="button"
          :aria-label="t('common.close')"
          @click="closePanel"
        >
          <i class="ri-close-line" aria-hidden="true"></i>
        </button>
      </div>

      <div class="user-panel__content">
        <section class="user-panel__identity" aria-labelledby="user-panel-identity-title">
          <div class="user-panel__avatar-wrap">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="displayName"
              referrerpolicy="no-referrer"
              class="user-panel__avatar"
            />
            <span v-else class="user-panel__avatar user-panel__avatar--fallback">{{ initials }}</span>
            <button
              class="user-panel__avatar-edit"
              type="button"
              :disabled="uploading"
              :aria-label="t('profile.changePhoto')"
              @click="fileInput?.click()"
            >
              <i class="ri-camera-line" aria-hidden="true"></i>
            </button>
            <input
              ref="fileInput"
              class="user-panel__file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              @change="handleFileChange"
            />
          </div>
          <div class="user-panel__identity-copy">
            <h3 id="user-panel-identity-title">{{ displayName }}</h3>
            <p>{{ email || t('profile.memberSince') }}</p>
            <span v-if="uploading" class="user-panel__status">
              <i class="ri-loader-4-line user-panel__spin" aria-hidden="true"></i>
              {{ t('profile.uploading') }}
            </span>
          </div>
        </section>

        <p
          v-if="message"
          class="user-panel__message"
          :class="`is-${messageType}`"
          role="status"
          aria-live="polite"
        >
          <i :class="messageType === 'error' ? 'ri-error-warning-line' : 'ri-check-circle-line'" aria-hidden="true"></i>
          {{ message }}
        </p>

        <form class="user-panel__form" @submit.prevent="saveProfile">
          <div class="user-panel__section-heading">
            <div>
              <h3>{{ t('profile.personalInfo') }}</h3>
              <p>{{ t('profile.personalInfoHint') }}</p>
            </div>
            <i class="ri-user-settings-line" aria-hidden="true"></i>
          </div>

          <div class="user-panel__form-grid">
            <label class="user-panel__field">
              <span>{{ t('profile.firstName') }}</span>
              <input v-model="form.firstName" type="text" maxlength="100" autocomplete="given-name" :placeholder="t('profile.firstNamePlaceholder')" />
            </label>
            <label class="user-panel__field">
              <span>{{ t('profile.lastName') }}</span>
              <input v-model="form.lastName" type="text" maxlength="100" autocomplete="family-name" :placeholder="t('profile.lastNamePlaceholder')" />
            </label>
          </div>

          <label class="user-panel__field">
            <span>{{ t('profile.bio') }}</span>
            <textarea v-model="form.bio" rows="4" maxlength="1000" :placeholder="t('profile.bioPlaceholder')"></textarea>
          </label>

          <label class="user-panel__field">
            <span>{{ t('profile.website') }}</span>
            <input v-model="form.website" type="url" maxlength="255" autocomplete="url" placeholder="https://" />
          </label>

          <div class="user-panel__form-grid">
            <label class="user-panel__field">
              <span>{{ t('profile.gender') }}</span>
              <select v-model="form.gender">
                <option value="">{{ t('profile.notSpecified') }}</option>
                <option value="male">{{ t('profile.male') }}</option>
                <option value="female">{{ t('profile.female') }}</option>
                <option value="other">{{ t('profile.other') }}</option>
              </select>
            </label>
            <label class="user-panel__field">
              <span>{{ t('profile.birthdate') }}</span>
              <input v-model="form.birthdate" type="date" />
            </label>
          </div>

          <button class="user-panel__save" type="submit" :disabled="saving || loading">
            <i v-if="saving" class="ri-loader-4-line user-panel__spin" aria-hidden="true"></i>
            <i v-else class="ri-save-line" aria-hidden="true"></i>
            {{ saving ? t('profile.saving') : t('profile.saveChanges') }}
          </button>
        </form>

        <section class="user-panel__plan" aria-labelledby="user-panel-plan-title">
          <div class="user-panel__plan-heading">
            <div>
              <p class="user-panel__eyebrow">{{ t('profile.membership') }}</p>
              <h3 id="user-panel-plan-title">{{ t('profile.currentPlan') }}</h3>
            </div>
            <span class="user-panel__plan-status" :class="`is-${plan.status || 'active'}`">{{ plan.status === 'active' ? t('profile.active') : (plan.status || t('profile.active')) }}</span>
          </div>
          <div class="user-panel__plan-main">
            <div class="user-panel__plan-icon"><i class="ri-vip-crown-line" aria-hidden="true"></i></div>
            <div class="user-panel__plan-copy">
              <strong>{{ plan.name || t('auth.planFree') }}</strong>
              <span v-if="plan.description">{{ plan.description }}</span>
            </div>
            <div class="user-panel__plan-price">
              <strong v-if="plan.price > 0">{{ formatPrice(plan.price) }}</strong>
              <strong v-else>{{ t('auth.planFree') }}</strong>
              <span v-if="plan.price > 0">{{ t('auth.planMonthly') }}</span>
            </div>
          </div>
          <ul v-if="plan.features.length" class="user-panel__features">
            <li v-for="(feature, index) in plan.features" :key="`${feature}-${index}`">
              <i class="ri-check-line" aria-hidden="true"></i>
              {{ feature }}
            </li>
          </ul>
          <NuxtLink :to="localePath('/pricing')" class="user-panel__plan-link" @click="closePanel">
            {{ t('profile.managePlan') }}
            <i class="ri-arrow-right-line" aria-hidden="true"></i>
          </NuxtLink>
        </section>

        <nav class="user-panel__links" :aria-label="t('profile.quickLinks')">
          <button type="button" @click="ui.toggleNotifPanel()">
            <i class="ri-notification-3-line" aria-hidden="true"></i>
            <span>{{ t('notifications.title') }}</span>
            <i class="ri-arrow-right-line" aria-hidden="true"></i>
          </button>
          <NuxtLink :to="localePath('/schedule')" @click="closePanel">
            <i class="ri-calendar-line" aria-hidden="true"></i>
            <span>{{ t('nav.schedule') }}</span>
            <i class="ri-arrow-right-line" aria-hidden="true"></i>
          </NuxtLink>
          <NuxtLink :to="localePath('/trainers')" @click="closePanel">
            <i class="ri-user-star-line" aria-hidden="true"></i>
            <span>{{ t('nav.trainers') }}</span>
            <i class="ri-arrow-right-line" aria-hidden="true"></i>
          </NuxtLink>
        </nav>

        <button class="user-panel__logout" type="button" @click="logout">
          <i class="ri-logout-box-r-line" aria-hidden="true"></i>
          {{ t('common.logout') }}
        </button>
      </div>
    </aside>
  </Teleport>
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUIStore } from '~/stores/ui'
import { useRefreshToken } from '~/composables/refreshToken'
import { useUserData } from '~/composables/userData'
import getUrl from '~/utils/getUrl'

interface ProfileForm {
  firstName: string
  lastName: string
  bio: string
  website: string
  gender: string
  birthdate: string
}

interface PlanState {
  code: string
  name: string
  nameEn: string
  description: string
  price: number
  currency: string
  interval: string
  status: string
  features: string[]
}

const auth = useAuthStore()
const ui = useUIStore()
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const nuxtApp = useNuxtApp()
const sessionData = useUserData()
const accessToken = useCookie<string | null>('access_token')
const { lock, unlock } = useScrollLock()
const fileInput = ref<HTMLInputElement | null>(null)

const form = ref<ProfileForm>({
  firstName: '',
  lastName: '',
  bio: '',
  website: '',
  gender: '',
  birthdate: '',
})
const plan = ref<PlanState>({
  code: 'free',
  name: 'Free Plan',
  nameEn: 'Free Plan',
  description: '',
  price: 0,
  currency: 'USD',
  interval: 'month',
  status: 'active',
  features: [],
})
const avatarPreview = ref('')
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const sessionUser = computed<any>(() => sessionData.value || auth.user || {})
const email = computed(() => String(sessionUser.value?.Email || sessionUser.value?.email || auth.user?.email || ''))
const avatarUrl = computed(() => {
  if (avatarPreview.value) return avatarPreview.value
  const source = sessionUser.value
  return String(
    source?.AvatarUrl ||
      source?.avatarUrl ||
      source?.avatar ||
      source?.Avatar ||
      auth.user?.avatar ||
      '',
  )
})
const displayName = computed(() => {
  const combined = [form.value.firstName, form.value.lastName].filter(Boolean).join(' ').trim()
  return combined || String(sessionUser.value?.name || auth.user?.name || email.value || t('profile.member'))
})
const initials = computed(() => {
  const value = displayName.value.trim()
  if (!value) return '?'
  return value.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
})

function unwrap(value: any): any {
  return value?.data && typeof value.data === 'object' ? value.data : value
}

function setForm(raw: any) {
  const first = raw?.FirstName || raw?.first_name || raw?.firstName || raw?.Name || raw?.name || ''
  const last = raw?.LastName || raw?.last_name || raw?.lastName || raw?.NameEn || ''
  const fullName = String(first || '')
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const resolvedFirst = raw?.FirstName || raw?.first_name || raw?.firstName || (parts.length > 1 ? parts[0] : parts[0] || '')
  const resolvedLast = raw?.LastName || raw?.last_name || raw?.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : '')
  form.value = {
    firstName: String(resolvedFirst || ''),
    lastName: String(resolvedLast || last || ''),
    bio: String(raw?.Bio || raw?.bio || ''),
    website: String(raw?.Website || raw?.website || ''),
    gender: String(raw?.Gender || raw?.gender || '').toLowerCase(),
    birthdate: raw?.Birthdate || raw?.birthdate ? String(raw?.Birthdate || raw?.birthdate).slice(0, 10) : '',
  }
}

function setPlan(raw: any) {
  const value = raw?.plan || raw?.Plan || raw
  const features = Array.isArray(value?.features)
    ? value.features.map((item: any) => typeof item === 'string' ? item : item?.name || item?.title || '').filter(Boolean)
    : []
  plan.value = {
    code: String(value?.code || value?.Code || 'free'),
    name: String(value?.name || value?.Name || t('auth.planFree')),
    nameEn: String(value?.name_en || value?.nameEn || value?.name || t('auth.planFree')),
    description: String(value?.description || ''),
    price: Number(value?.price || 0),
    currency: String(value?.currency || 'USD'),
    interval: String(value?.interval || 'month'),
    status: String(value?.status || 'active'),
    features,
  }
}

async function loadData() {
  if (!import.meta.client || !(auth.token || accessToken.value)) return
  loading.value = true
  message.value = ''
  try {
    const [profileResult, planResult] = await Promise.all([
      useWeb<any>('/api/v1/auth/me', { auth: true }),
      useWeb<any>('/api/v1/auth/me/plan', { auth: true }),
    ])
    if (profileResult.error.value) throw new Error(profileResult.error.value)
    if (planResult.error.value) throw new Error(planResult.error.value)
    setForm(unwrap(profileResult.data.value))
    setPlan(unwrap(planResult.data.value))
  } catch (error: any) {
    message.value = error?.message || t('profile.loadError')
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  if (saving.value) return
  saving.value = true
  message.value = ''
  try {
    const result = await useWeb<any>('/api/v1/auth/me/update', {
      method: 'POST',
      auth: true,
      data: {
        Name: form.value.firstName.trim() || null,
        NameEn: form.value.lastName.trim() || null,
        Bio: form.value.bio.trim() || null,
        Website: form.value.website.trim() || null,
        Gender: form.value.gender || null,
        Birthdate: form.value.birthdate || null,
      },
    })
    if (result.error.value) throw new Error(result.error.value)
    try {
      await nuxtApp.runWithContext(() => auth.fetchProfile())
    } catch {}
    message.value = t('profile.saved')
    messageType.value = 'success'
  } catch (error: any) {
    message.value = error?.message || t('profile.saveError')
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}

async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const send = (token: string | null) => axios.post(getUrl('/api/v1/auth/me/avatar'), formData, {
    withCredentials: true,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  try {
    let response
    try {
      response = await send(auth.token)
    } catch (error: any) {
      if (error?.response?.status !== 401) throw error
      const refreshed = await useRefreshToken(true)
      if (!refreshed) throw error
      response = await send(refreshed)
    }
    const nextAvatar = String(response?.data?.avatar_url || response?.data?.AvatarUrl || response?.data?.url || '')
    if (!nextAvatar) throw new Error(t('profile.avatarError'))
    const current = { ...(auth.user || sessionUser.value), avatar: nextAvatar, AvatarUrl: nextAvatar }
    nuxtApp.runWithContext(() => {
      auth.user = current as any
      auth.persistUser()
      useUserData({
        ...current,
        access_token: auth.token,
        refresh_token: auth.refreshToken,
      })
    })
    avatarPreview.value = ''
    message.value = t('profile.avatarSaved')
    messageType.value = 'success'
  } catch (error: any) {
    avatarPreview.value = ''
    const detail = error?.response?.data?.detail || error?.response?.data?.message
    message.value = detail || t('profile.avatarError')
    messageType.value = 'error'
  }
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    message.value = t('profile.invalidImage')
    messageType.value = 'error'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    message.value = t('profile.imageTooLarge')
    messageType.value = 'error'
    return
  }
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  avatarPreview.value = URL.createObjectURL(file)
  uploading.value = true
  try {
    await uploadAvatar(file)
  } finally {
    uploading.value = false
  }
}

function formatPrice(value: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: plan.value.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${plan.value.currency || 'USD'} ${value}`
  }
}

function closePanel() {
  ui.userPanelOpen = false
}

async function logout() {
  closePanel()
  await auth.logout()
  useUserData(null)
  await navigateTo(localePath('/'))
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && ui.userPanelOpen) closePanel()
}

watch(
  () => ui.userPanelOpen,
  async (open) => {
    if (!import.meta.client) return
    if (open) {
      lock()
      await loadData()
    } else {
      unlock()
    }
  },
)

watch(
  () => route.fullPath,
  () => {
    if (ui.userPanelOpen) closePanel()
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  unlock()
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
})
</script>

<style lang="scss" scoped>
.user-panel-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(10, 10, 10, 0.62);
  backdrop-filter: blur(3px);
}

.user-panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  width: min(430px, 100vw);
  height: 100vh;
  overflow: hidden;
  color: var(--c-text);
  background: var(--c-bg);
  border-left: 1px solid var(--c-border);
  box-shadow: -20px 0 55px rgba(0, 0, 0, 0.28);
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.user-panel.is-open {
  transform: translateX(0);
}

.user-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.35rem 1.35rem 1.1rem;
  border-bottom: 1px solid var(--c-border);
  background: color-mix(in srgb, var(--c-surface) 88%, transparent);
}

.user-panel__eyebrow {
  margin: 0 0 0.28rem;
  color: var(--c-primary);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.user-panel__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.user-panel__close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  color: var(--c-muted);
  background: transparent;
  border: 1px solid var(--c-border);
  border-radius: 50%;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.user-panel__close:hover {
  color: var(--c-primary);
  border-color: var(--c-primary);
  background: var(--c-primary-soft);
}

.user-panel__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.25rem;
}

.user-panel__identity {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.user-panel__avatar-wrap {
  position: relative;
  width: 76px;
  height: 76px;
  flex: 0 0 auto;
}

.user-panel__avatar {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  object-fit: cover;
  color: var(--c-primary);
  background: var(--c-primary-soft);
  border: 2px solid var(--c-primary);
  border-radius: 50%;
  font-size: 1.25rem;
  font-weight: 800;
}

.user-panel__avatar-edit {
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: grid;
  place-items: center;
  width: 27px;
  height: 27px;
  color: #0a0a0a;
  background: var(--c-primary);
  border: 3px solid var(--c-bg);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.user-panel__avatar-edit:hover {
  transform: scale(1.08);
}

.user-panel__avatar-edit:disabled {
  cursor: wait;
  opacity: 0.65;
}

.user-panel__file-input {
  display: none;
}

.user-panel__identity-copy {
  min-width: 0;
}

.user-panel__identity-copy h3 {
  margin: 0;
  overflow: hidden;
  color: var(--c-text);
  font-size: 1.05rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-panel__identity-copy p {
  margin: 0.35rem 0 0;
  overflow: hidden;
  color: var(--c-muted);
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-panel__status {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.4rem;
  color: var(--c-primary);
  font-size: 0.72rem;
}

.user-panel__message {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0 0 1rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid;
  border-radius: 10px;
  font-size: 0.78rem;
  line-height: 1.4;
}

.user-panel__message.is-success {
  color: var(--c-success);
  background: color-mix(in srgb, var(--c-success) 12%, transparent);
  border-color: color-mix(in srgb, var(--c-success) 35%, transparent);
}

.user-panel__message.is-error {
  color: var(--c-error);
  background: color-mix(in srgb, var(--c-error) 12%, transparent);
  border-color: color-mix(in srgb, var(--c-error) 35%, transparent);
}

.user-panel__form,
.user-panel__plan,
.user-panel__links {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
}

.user-panel__section-heading,
.user-panel__plan-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.user-panel__section-heading h3,
.user-panel__plan-heading h3 {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 800;
}

.user-panel__section-heading p {
  margin: 0.25rem 0 0;
  color: var(--c-muted);
  font-size: 0.72rem;
}

.user-panel__section-heading > i {
  color: var(--c-primary);
  font-size: 1.2rem;
}

.user-panel__form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.user-panel__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.user-panel__field > span {
  color: var(--c-muted);
  font-size: 0.7rem;
  font-weight: 700;
}

.user-panel__field input,
.user-panel__field textarea,
.user-panel__field select {
  width: 100%;
  padding: 0.65rem 0.7rem;
  color: var(--c-text);
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 9px;
  outline: none;
  font: inherit;
  font-size: 0.8rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.user-panel__field textarea {
  min-height: 88px;
  resize: vertical;
}

.user-panel__field input:focus,
.user-panel__field textarea:focus,
.user-panel__field select:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-soft);
}

.user-panel__save {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  margin-top: 0.15rem;
  padding: 0.72rem 1rem;
  color: #0a0a0a;
  background: var(--c-primary);
  border: none;
  border-radius: 9px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 800;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.user-panel__save:hover:not(:disabled) {
  transform: translateY(-1px);
}

.user-panel__save:disabled {
  cursor: wait;
  opacity: 0.6;
}

.user-panel__plan {
  background: linear-gradient(145deg, color-mix(in srgb, var(--c-primary) 13%, var(--c-surface)), var(--c-surface));
}

.user-panel__plan-status {
  padding: 0.25rem 0.5rem;
  color: var(--c-success);
  background: color-mix(in srgb, var(--c-success) 12%, transparent);
  border-radius: 999px;
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: capitalize;
}

.user-panel__plan-status.is-pending {
  color: var(--c-warning);
  background: color-mix(in srgb, var(--c-warning) 12%, transparent);
}

.user-panel__plan-main {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.user-panel__plan-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  color: var(--c-primary);
  background: var(--c-primary-soft);
  border-radius: 12px;
  font-size: 1.2rem;
}

.user-panel__plan-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.2rem;
}

.user-panel__plan-copy strong {
  color: var(--c-text);
  font-size: 0.86rem;
}

.user-panel__plan-copy span {
  overflow: hidden;
  color: var(--c-muted);
  font-size: 0.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-panel__plan-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
}

.user-panel__plan-price strong {
  color: var(--c-primary);
  font-size: 0.9rem;
}

.user-panel__plan-price span {
  color: var(--c-muted);
  font-size: 0.66rem;
}

.user-panel__features {
  display: grid;
  gap: 0.35rem;
  margin: 0.9rem 0 0;
  padding: 0;
  list-style: none;
}

.user-panel__features li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--c-muted);
  font-size: 0.72rem;
}

.user-panel__features i {
  color: var(--c-success);
}

.user-panel__plan-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.75rem;
  color: var(--c-primary);
  border-top: 1px solid var(--c-border);
  font-size: 0.76rem;
  font-weight: 800;
  text-decoration: none;
}

.user-panel__links {
  display: grid;
  gap: 0.2rem;
  padding: 0.45rem;
}

.user-panel__links a,
.user-panel__links button {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.65rem 0.7rem;
  color: var(--c-text);
  background: transparent;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  text-align: left;
  text-decoration: none;
  transition: color 0.2s ease, background 0.2s ease;
}

.user-panel__links a:hover,
.user-panel__links button:hover {
  color: var(--c-primary);
  background: var(--c-primary-soft);
}

.user-panel__links a > i:last-child,
.user-panel__links button > i:last-child {
  margin-left: auto;
  color: var(--c-muted);
}

.user-panel__logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.7rem;
  color: var(--c-error);
  background: color-mix(in srgb, var(--c-error) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-error) 25%, transparent);
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  transition: background 0.2s ease;
}

.user-panel__logout:hover {
  background: color-mix(in srgb, var(--c-error) 16%, transparent);
}

.user-panel__spin {
  animation: user-panel-spin 0.8s linear infinite;
}

.user-panel-fade-enter-active,
.user-panel-fade-leave-active {
  transition: opacity 0.25s ease;
}

.user-panel-fade-enter-from,
.user-panel-fade-leave-to {
  opacity: 0;
}

@keyframes user-panel-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .user-panel__content {
    padding: 1rem;
  }

  .user-panel__form,
  .user-panel__plan {
    padding: 0.85rem;
  }
}

@media (max-width: 380px) {
  .user-panel__form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
