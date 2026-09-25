const TELEGRAM_LOGIN_SCRIPT = 'https://oauth.telegram.org/js/telegram-login.js?6'

let telegramScriptPromise = null

export function useOAuth() {
  const auth = useAuthStore()
  const loading = ref(false)
  const error = ref(null)

  function getErrorMessage(err, fallback) {
    return (
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.data?.message ||
      err?.message ||
      fallback
    )
  }

  async function loadTelegramScript() {
    if (!import.meta.client) {
      throw new Error('Telegram Login can only be initialized on the client.')
    }

    if (window.Telegram?.Login) return window.Telegram.Login
    if (telegramScriptPromise) return telegramScriptPromise

    telegramScriptPromise = new Promise((resolve, reject) => {
      let script = document.querySelector(
        `script[data-telegram-login][src="${TELEGRAM_LOGIN_SCRIPT}"]`,
      )

      if (!script) {
        script = document.createElement('script')
        script.src = TELEGRAM_LOGIN_SCRIPT
        script.async = true
        script.dataset.telegramLogin = 'true'
      }

      const finish = () => {
        if (window.Telegram?.Login) {
          resolve(window.Telegram.Login)
        } else {
          reject(new Error('Telegram Login SDK was not initialized.'))
        }
      }
      const fail = () => reject(new Error('Failed to load Telegram Login SDK.'))

      script.addEventListener('load', finish, { once: true })
      script.addEventListener('error', fail, { once: true })
      window.setTimeout(fail, 10000)
      if (!script.isConnected) document.head.appendChild(script)
    })

    try {
      return await telegramScriptPromise
    } catch (err) {
      telegramScriptPromise = null
      throw err
    }
  }

  async function authenticate(provider, idToken, nonce) {
    if (provider !== 'telegram') {
      throw new Error(`OAuth provider '${provider}' is not supported by this helper.`)
    }
    if (!idToken || !nonce) {
      throw new Error('Telegram authentication requires an ID token and nonce.')
    }
    return auth.completeTelegramLogin(idToken, nonce)
  }

  async function openTelegramLogin() {
    if (!import.meta.client) {
      throw new Error('Telegram Login can only be opened on the client.')
    }
    if (loading.value) {
      throw new Error('Authentication is already in progress.')
    }

    loading.value = true
    error.value = null

    try {
      const config = await auth.telegramPreflight()
      const clientId = Number(config?.client_id)
      const nonce = String(config?.nonce || '')
      if (!Number.isSafeInteger(clientId) || clientId <= 0 || !nonce) {
        throw new Error('Telegram client ID or nonce is not configured.')
      }

      const telegramLogin = await loadTelegramScript()
      const result = await new Promise((resolve, reject) => {
        try {
          telegramLogin.auth(
            {
              client_id: clientId,
              scope: ['openid', 'profile', 'write'],
              lang: 'en',
              nonce,
            },
            resolve,
          )
        } catch (err) {
          reject(err)
        }
      })

      if (result?.error) {
        throw new Error(result.error_description || result.error)
      }
      if (!result?.id_token) {
        throw new Error('Telegram authentication did not return an ID token.')
      }

      return await authenticate('telegram', result.id_token, nonce)
    } catch (err) {
      error.value = getErrorMessage(err, 'Telegram authentication failed.')
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    authenticate,
    openTelegramLogin,
    clearError,
  }
}
