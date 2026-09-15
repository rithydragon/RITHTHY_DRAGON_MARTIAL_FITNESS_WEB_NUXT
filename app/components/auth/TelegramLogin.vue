```vue
<script setup>
const config = useRuntimeConfig()

const loading = ref(false)
const error = ref('')

const emit = defineEmits([
  'success',
  'error'
])

function loadTelegramScript() {
  return new Promise((resolve, reject) => {
    if (window.Telegram?.Login) {
      resolve(window.Telegram.Login)
      return
    }

    const script = document.createElement('script')

    script.src =
      'https://oauth.telegram.org/js/telegram-login.js?3'

    script.async = true

    script.onload = () => {
      if (window.Telegram?.Login) {
        resolve(window.Telegram.Login)
      } else {
        reject(
          new Error(
            'Telegram Login SDK was not initialized.'
          )
        )
      }
    }

    script.onerror = () => {
      reject(
        new Error(
          'Failed to load Telegram Login SDK.'
        )
      )
    }

    document.head.appendChild(script)
  })
}

async function openTelegramLogin() {
  if (loading.value) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const TelegramLogin =
      await loadTelegramScript()

    TelegramLogin.auth(
      {
        client_id:
          Number(config.public.telegramClientId),

        scope: [
          'openid',
          'profile'
        ],

        lang: 'en'
      },

      async (result) => {
        if (result?.error) {
          error.value =
            result.error

          emit(
            'error',
            result.error
          )

          loading.value = false

          return
        }

        if (!result?.id_token) {
          error.value =
            'Telegram authentication failed.'

          loading.value = false

          return
        }

        try {
          /*
           * Send Telegram ID token
           * to your server.
           */
          const response = await $fetch(
            '/api/auth/telegram',
            {
              method: 'POST',

              body: {
                id_token:
                  result.id_token
              }
            }
          )

          emit(
            'success',
            response
          )
        } catch (err) {
          error.value =
            err?.data?.message ||
            'Authentication failed.'

          emit(
            'error',
            err
          )
        } finally {
          loading.value = false
        }
      }
    )
  } catch (err) {
    console.error(
      'Telegram Login:',
      err
    )

    error.value =
      'Unable to open Telegram Login.'

    emit(
      'error',
      err
    )

    loading.value = false
  }
}
</script>

<template>
  <div class="telegram-auth">

    <button
      type="button"
      class="telegram-login-button"
      :disabled="loading"
      @click="openTelegramLogin"
    >
      <span v-if="loading">
        Connecting...
      </span>

      <span v-else>
        Continue with Telegram
      </span>
    </button>

    <p
      v-if="error"
      class="telegram-error"
    >
      {{ error }}
    </p>

  </div>
</template>

<style scoped>
.telegram-auth {
  width: 100%;
}

.telegram-login-button {
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
}

.telegram-login-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.telegram-error {
  margin-top: 8px;
  font-size: 13px;
}
</style>
```
