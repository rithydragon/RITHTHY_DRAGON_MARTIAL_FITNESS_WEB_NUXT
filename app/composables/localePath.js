// import { useLocalePath, useCookie } from "#imports";
// export default (path) => {
//   // console.log("Path =================> ", path)
//   const cookie = useCookie("i18n_redirected").value;
//   // console.log("Cookie ==============> ", cookie)
//   return cookie != "en" ? `/${cookie}${path}` : path;
// };

import { useCookie } from '#imports'

const SUPPORTED_LOCALES = ['en', 'km', 'zh']
const DEFAULT_LOCALE = 'en'

export default (path = '/') => {
  const cookie = useCookie('i18n_redirected')
  const locale = cookie.value

  // External URL
  if (/^(https?:)?\/\//.test(path)) {
    return path
  }

  // Normalize path
  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`

  // Only accept supported locales
  const currentLocale = SUPPORTED_LOCALES.includes(locale)
    ? locale
    : DEFAULT_LOCALE

  // English is the default and is not prefixed
  if (currentLocale === DEFAULT_LOCALE) {
    return normalizedPath
  }

  // km / zh
  return `/${currentLocale}${normalizedPath}`
}