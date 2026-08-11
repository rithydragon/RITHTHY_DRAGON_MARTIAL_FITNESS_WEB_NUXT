/**
 * useTBy — inline multilingual text helper for long-form content.
 * Usage: tBy({ en: 'English text', km: 'Khmer text', zh: 'Chinese text' })
 * Returns the string for the current locale, falling back to English.
 */

export type Locale = 'en' | 'km' | 'zh'

interface LocalizedText {
  en?: string
  km?: string
  zh?: string
  [key: string]: string | undefined
}

export function useTBy() {
  const locale = useState<Locale>('locale', () => 'en')

  function tBy(text: LocalizedText): string {
    if (!text) return ''
    return text[locale.value] || text['en'] || ''
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
    tBy,
    setLocale,
    initLocale,
  }
}
