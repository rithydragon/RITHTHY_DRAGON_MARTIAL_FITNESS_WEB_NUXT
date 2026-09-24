<template>
  <main class="tw">
    <div class="tw__card">
      <div class="tw__brand">
        <span class="tw__mark">R</span>
        <span class="tw__name">RITHTHY Fitness</span>
      </div>

      <h1 class="tw__title">{{ t('auth.telegramWidgetTitle') }}</h1>
      <p class="tw__sub">{{ t('auth.telegramWidgetSubtitle') }}</p>

      <div ref="widgetEl" class="tw__widget">
        <p v-if="signingIn" class="tw__signing">
          <i class="ri-loader-4-line tw__spin"></i> {{ t('auth.telegramWidgetSigningIn') }}
        </p>
        <p v-else-if="error" class="tw__error">
          <i class="ri-error-warning-line"></i> {{ error }}
        </p>
      </div>

      <nuxt-link class="tw__back" to="/">{{ t('auth.telegramWidgetBack') }}</nuxt-link>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Sign in with Telegram',
})

const { t } = useI18n()

const widgetEl = ref<HTMLElement>()
const error = ref('')
const signingIn = ref(false)

/* ----------------------------------------------------------------
   Official Telegram Login Widget integration.
   - The widget button is Telegram's own; clicking it authorizes on
     oauth.telegram.org (only for origins registered in @BotFather).
   - On success the widget calls window.onTelegramAuth with the signed
     payload (id, first_name, ..., auth_date, hash). We perform a normal
     top-level navigation to the backend callback with those as query
     params — no hidden iframe. The backend validates the HMAC-SHA256
     hash and 302-redirects to /oauth/callback with the tokens.
----------------------------------------------------------------- */
onMounted(async () => {
  try {
    const res: any = await $fetch<{ data: any }>(
      getUrl('/api/v1/auth/oauth/telegram/config'),
    )
    const data = res?.data ?? {}
    const bot = data?.bot?.bot_username

    if (!data?.configured || !bot) {
      error.value = t('auth.telegramUnavailable')
      return
    }
    if (data?.domain_ok === false) {
      error.value = t('auth.telegramDomainHint')
      return
    }

    ;(window as any).onTelegramAuth = (user: Record<string, string>) => {
      signingIn.value = true
      const qs = new URLSearchParams(user).toString()
      window.location.href = getUrl('/api/v1/auth/oauth/telegram/callback?' + qs)
    }

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?23'
    script.setAttribute('data-telegram-login', bot)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '12')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    widgetEl.value?.appendChild(script)
  } catch {
    error.value = t('auth.telegramUnavailable')
  }
})
</script>

<style lang="scss" scoped>
.tw {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(1200px 600px at 50% -10%, #1a1a1a 0%, #0a0a0a 60%);
  color: var(--c-text, #f5f5f4);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Noto Sans Khmer', 'PingFang SC', 'Microsoft YaHei', sans-serif;

  &__card {
    width: 100%;
    max-width: 420px;
    padding: 40px 36px 32px;
    background: var(--c-surface, #141414);
    border: 1px solid var(--c-border, #262626);
    border-radius: 24px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
    text-align: center;
  }

  &__brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }

  &__mark {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(135deg, #e7c95f, #c9a227);
    color: #0a0a0a;
    font-weight: 800;
    font-size: 20px;
  }

  &__name {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0.4px;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  &__sub {
    margin: 0 0 30px;
    font-size: 14px;
    line-height: 1.55;
    color: var(--c-muted, #9c9c9c);
  }

  &__widget {
    display: flex;
    justify-content: center;
    min-height: 48px;
  }

  &__error,
  &__signing {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0.9rem;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.5;
    text-align: left;

    i {
      flex-shrink: 0;
    }
  }

  &__error {
    align-items: flex-start;
    border: 1px solid rgba(244, 63, 94, 0.35);
    background: rgba(244, 63, 94, 0.1);
    color: #fb7185;
  }

  &__signing {
    border: 1px solid rgba(231, 201, 95, 0.3);
    background: rgba(231, 201, 95, 0.08);
    color: #e7c95f;
  }

  &__spin {
    animation: tw-spin 1s linear infinite;
  }

  @keyframes tw-spin {
    to {
      transform: rotate(360deg);
    }
  }

  &__back {
    display: inline-block;
    margin-top: 26px;
    font-size: 13px;
    color: var(--c-muted, #9c9c9c);
    text-decoration: none;

    &:hover {
      color: var(--c-text, #f5f5f4);
    }
  }
}
</style>