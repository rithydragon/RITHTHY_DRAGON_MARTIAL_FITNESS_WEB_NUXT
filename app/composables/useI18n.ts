/**
 * useI18n — lightweight i18n composable for Khmer (km), English (en), Chinese (zh).
 * Loads JSON locale files and provides $t / t / setLocale.
 * No wrapping — direct key access: { "nav.home": "Home" }
 */
import en from '~/assets/i18n/en.json'
import km from '~/assets/i18n/km.json'
import zh from '~/assets/i18n/zh.json'

export type Locale = 'en' | 'km' | 'zh'

const messages: Record<Locale, Record<string, any>> = {
  en,
  km,
  zh,
}

function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key in obj) {
    const value = obj[key]
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      result[fullKey] = value
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flatten(value, fullKey))
    }
  }
  return result
}

const flatMessages: Record<Locale, Record<string, string>> = {
  en: flatten(en),
  km: flatten(km),
  zh: flatten(zh),
}

export function useI18n() {
  const locale = useState<Locale>('i18n-locale', () => 'en')

  function t(key: string): string {
    const msgs = flatMessages[locale.value] || flatMessages.en
    return msgs[key] || flatMessages.en[key] || key
  }

  function setLocale(l: Locale) {
    locale.value = l
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rmf-locale', l)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', l)
    }
  }

  function initLocale() {
    if (typeof localStorage === 'undefined') return
    const stored = localStorage.getItem('rmf-locale') as Locale | null
    if (stored && ['en', 'km', 'zh'].includes(stored)) {
      locale.value = stored
    }
  }

  return {
    locale,
    t,
    setLocale,
    initLocale,
  }
}
