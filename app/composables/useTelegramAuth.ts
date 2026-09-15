export const useTelegramAuth = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function authenticate(idToken: string) {
    loading.value = true
    error.value = null

    try {
      return await $fetch('/api/auth/telegram', {
        method: 'POST',

        body: {
          id_token: idToken,
        },
      })
    } catch (err: any) {
      error.value =
        err?.data?.message ||
        'Telegram authentication failed.'

      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    authenticate,
  }
}