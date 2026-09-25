<template>
  <main class="tw">
    <div class="tw__card">
      <h1>{{ t('auth.telegramWidgetTitle') }}</h1>
      <p>{{ t('auth.telegramWidgetSubtitle') }}</p>
      <p v-if="error" role="alert">{{ error }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

definePageMeta({
  layout: false,
  title: 'Sign in with Telegram',
})

const { t } = useI18n()
const error = ref('')

onMounted(async () => {
  try {
    await navigateTo({ path: '/', query: { auth: 'login' } }, { replace: true })
  } catch {
    error.value = t('auth.telegramUnavailable')
  }
})
</script>

<style lang="scss" scoped>
.tw {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  color: var(--c-text, #f5f5f4);
}

.tw__card {
  width: min(420px, 100%);
  padding: 40px 36px;
  border: 1px solid var(--c-border, #262626);
  border-radius: 24px;
  background: var(--c-surface, #141414);
  text-align: center;
}

p[role='alert'] {
  color: #fb7185;
}
</style>
