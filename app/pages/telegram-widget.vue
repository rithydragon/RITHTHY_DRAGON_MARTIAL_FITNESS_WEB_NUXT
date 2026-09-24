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
        <p v-if="error" class="tw__error">
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

/* ----------------------------------------------------------------
   The Telegram Login Widget must run on THIS site's origin (the
   domain registered for the bot in @BotFather). Verify against the
   backend config API first, then inject the official widget, pointing
   data-auth-url at the backend callback so the hash is validated
   server-side.
----------------------------------------------------------------- */
onMounted(async () => {
  try {
    const res: any = await $fetch<{ data: any }>(
      getUrl(
        '/api/v1/auth/oauth/telegram/config?origin=' +
          encodeURIComponent(window.location.origin),
      ),
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

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', bot)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '12')
    script.setAttribute('data-auth-url', getUrl('/api/v1/auth/oauth/telegram/callback'))
    script.setAttribute('data-request-access', 'write')
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

  &__error {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem 0.9rem;
    border: 1px solid rgba(244, 63, 94, 0.35);
    background: rgba(244, 63, 94, 0.1);
    color: #fb7185;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.5;
    text-align: left;

    i {
      margin-top: 2px;
      flex-shrink: 0;
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