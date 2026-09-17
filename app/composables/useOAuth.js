


export function useOAuth() {
  const config = useRuntimeConfig()

  const loading = ref(false)
  const error = ref(null)

  /**
   * Convert an unknown error into a user-friendly message.
   */
  function getErrorMessage(err, fallback) {
    const error = err

    return (
      error?.data?.message ||
      error?.message ||
      error?.error ||
      fallback
    )
  }

  /**
   * Generic API authentication request.
   */
  async function authenticate(provider, idToken) {
    if (!idToken) {
      throw new Error('Missing ID token.')
    }

    const endpoint = `/api/auth/${provider}`

    return await $fetch(endpoint, {
      method: 'POST',
      body: {
        id_token: idToken,
      },
    })
  }

  /**
   * Authenticate with Google using an ID token.
   */
  async function authenticateGoogle(idToken) {
    loading.value = true
    error.value = null

    try {
      return await authenticate('google', idToken)
    } catch (err) {
      error.value = getErrorMessage(
        err,
        'Google authentication failed.'
      )

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Load Telegram Login SDK.
   *
   * The promise is cached so calling this multiple times
   * won't inject multiple script tags.
   */
  async function loadTelegramScript(){
    if (!import.meta.client) {
      throw new Error(
        'Telegram Login can only be initialized on the client.'
      )
    }

    if (window.Telegram?.Login) {
      return window.Telegram.Login
    }

    if (telegramScriptPromise) {
      return telegramScriptPromise
    }

    telegramScriptPromise = new Promise<TelegramLogin>(
      (resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(
          'script[data-telegram-login]'
        )

        if (existingScript) {
          existingScript.addEventListener('load', () => {
            if (window.Telegram?.Login) {
              resolve(window.Telegram.Login)
            } else {
              reject(
                new Error(
                  'Telegram Login SDK was not initialized.'
                )
              )
            }
          })

          existingScript.addEventListener('error', () => {
            reject(
              new Error(
                'Failed to load Telegram Login SDK.'
              )
            )
          })

          return
        }

        const script = document.createElement('script')

        script.src =
          'https://oauth.telegram.org/js/telegram-login.js?3'

        script.async = true
        script.dataset.telegramLogin = 'true'

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
      }
    )

    try {
      return await telegramScriptPromise
    } catch (err) {
      telegramScriptPromise = null
      throw err
    }
  }

  /**
   * Open Telegram OAuth login.
   */
  async function openTelegramLogin() {
    if (!import.meta.client) {
      throw new Error(
        'Telegram Login can only be opened on the client.'
      )
    }

    if (loading.value) {
      throw new Error('Authentication is already in progress.')
    }

    loading.value = true
    error.value = null

    try {
      const TelegramLogin =
        await loadTelegramScript()

      const clientId = Number(
        config.public.telegramClientId
      )

      if (!clientId) {
        throw new Error(
          'Telegram client ID is not configured.'
        )
      }

      const result =
        await new Promise<TelegramAuthResult>(
          (resolve, reject) => {
            try {
              TelegramLogin.auth(
                {
                  client_id: clientId,
                  scope: [
                    'openid',
                    'profile',
                  ],
                  lang: 'en',
                },
                resolve
              )
            } catch (err) {
              reject(err)
            }
          }
        )

      if (result.error) {
        throw new Error(
          result.error_description ||
          result.error
        )
      }

      if (!result.id_token) {
        throw new Error(
          'Telegram authentication did not return an ID token.'
        )
      }

      return await authenticate(
        'telegram',
        result.id_token
      )
    } catch (err) {
      error.value = getErrorMessage(
        err,
        'Telegram authentication failed.'
      )

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset the current OAuth error.
   */
  function clearError() {
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),

    authenticate,

    authenticateGoogle,
    openTelegramLogin,

    clearError,
  }
}
