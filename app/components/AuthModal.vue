<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="auth-modal__overlay" @click.self="close">
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
            <p class="auth-modal__oauth-heading">{{ mode === 'login' ? 'Sign in with Social' : 'Quick Sign Up with' }}</p>
            <div class="auth-modal__oauth">
              <button
                v-for="provider in providers"
                :key="provider.id"
                :class="['auth-modal__oauth-btn', `auth-modal__oauth-btn--${provider.id}`]"
                @click="handleOAuth(provider.id)"
                :disabled="auth.loading"
                :aria-label="provider.name"
              >
                <i :class="provider.icon"></i>
                <span>{{ provider.name }}</span>
              </button>
            </div>
          </div>

          <div class="auth-modal__divider">
            <span>{{ t('common.or') || 'OR WITH EMAIL' }}</span>
          </div>

          <form class="auth-modal__form" @submit.prevent="handleSubmit">
            <div v-if="mode === 'register' || mode === 'join'" class="auth-modal__field">
              <label>{{ t('auth.fullName') }}</label>
              <input v-model="form.name" type="text" required :placeholder="t('auth.fullName')" />
            </div>

            <div class="auth-modal__field">
              <label>{{ t('auth.email') }}</label>
              <input v-model="form.email" type="email" required :placeholder="t('auth.email')" />
            </div>

            <div v-if="mode === 'register' || mode === 'join'" class="auth-modal__field">
              <label>{{ t('auth.phone') }}</label>
              <input v-model="form.phone" type="tel" :placeholder="t('auth.phone')" />
            </div>

            <div class="auth-modal__field">
              <label>{{ t('auth.password') }}</label>
              <input v-model="form.password" type="password" required :placeholder="t('auth.password')" />
            </div>

            <div v-if="mode === 'register'" class="auth-modal__field">
              <label>{{ t('auth.confirmPassword') }}</label>
              <input v-model="form.confirmPassword" type="password" required :placeholder="t('auth.confirmPassword')" />
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
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

type AuthMode = 'login' | 'register' | 'join'

const props = defineProps<{
  isOpen: boolean
  mode: AuthMode
}>()

const emit = defineEmits<{
  close: []
  switchMode: [mode: AuthMode]
}>()

const { t } = useI18n()
const auth = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const plans = [
  { id: 'free', label: 'Free', price: 0 },
  { id: 'basic', label: 'Basic', price: 49 },
  { id: 'pro', label: 'Pro', price: 99 },
  { id: 'elite', label: 'Elite', price: 199 },
] as const

const selectedPlan = ref<'basic' | 'pro' | 'elite'>('pro')

const providers = [
  { id: 'google', name: 'Google', icon: 'ri-google-fill' },
  { id: 'telegram', name: 'Telegram', icon: 'ri-telegram-fill' },
  { id: 'tiktok', name: 'TikTok', icon: 'ri-tiktok-fill' },
  { id: 'facebook', name: 'Facebook', icon: 'ri-facebook-circle-fill' },
] as const

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

function switchMode() {
  emit('switchMode', props.mode === 'login' ? 'register' : 'login')
}

async function handleSubmit() {
  try {
    if (props.mode === 'login') {
      await auth.login(form.email, form.password)
    } else if (props.mode === 'register') {
      await auth.register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      })
    } else if (props.mode === 'join') {
      await auth.joinPlan(selectedPlan.value)
    }
    close()
  } catch {
    // error is stored in auth.error
  }
}

async function handleOAuth(providerId: 'google' | 'telegram' | 'facebook' | 'tiktok') {
  try {
    await auth.loginWithProvider(providerId)
    close()
  } catch {
    // error stored in auth.error
  }
}
</script>

<style scoped>
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

.auth-modal__plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
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
