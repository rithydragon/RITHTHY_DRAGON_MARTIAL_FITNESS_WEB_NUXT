import CryptoJS from 'crypto-js'
import { useRoute, useRuntimeConfig, navigateTo } from '#imports'

export function useQueryParams() {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const secretKey = runtimeConfig.public.encryptionSecret || 'fallback-secret-key'

  const encrypt = (data) => {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString()
    } catch (err) {
      console.log('Encryption failed:', err)
      return null
    }
  }

  const decrypt = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey)
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8)
      return JSON.parse(decryptedStr)
    } catch (error) {
      console.log('Decryption failed for:', ciphertext, error)
      return null
    }
  }

  const queryParams = (path, data, key) => {
    // Read mode
    if (!path) {
      const result = {}
      for (const [k, v] of Object.entries(route.query)) {
        result[k] = decrypt(v)
      }
      console.log("Decrypted params: ", result) // ✅ Add this
      return result
    }

    // Write mode
    const queryKey = key || '_e'

    console.log( "key ==========> : ", queryKey)

    if (typeof data !== 'object') {
      console.warn('[useQueryParams] Only object or array is allowed')
      return
    }

    const encrypted = encrypt(data)

    return navigateTo({
      path,
      query: {
        [queryKey]: encrypted
      }
    })
  }

  return queryParams
}
