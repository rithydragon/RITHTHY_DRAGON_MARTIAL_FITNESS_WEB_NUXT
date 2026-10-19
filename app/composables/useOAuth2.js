const GIS_SCRIPT = "https://accounts.google.com/gsi/client"
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive"
const SCOPES = ["openid", "email", "profile", DRIVE_SCOPE].join(" ")

// Fallback only. Prefer runtimeConfig.public.googleClientId (see nuxt.config).
const FALLBACK_CLIENT_ID =
  "488162025369-si0500ntml99div3ri0nkr4n6itoff45.apps.googleusercontent.com"

// A code issued by the GIS *popup* flow must be exchanged on the backend with
// redirect_uri = "postmessage" (NOT the page origin), otherwise Google answers
// redirect_uri_mismatch.
const POPUP_REDIRECT_URI = "postmessage"

let gisScript = null

/**
 * Load Google Identity Services once per page.
 * Only needed on the file explorer, so it is injected on demand.
 */
function loadGoogleIdentityServices() {
  if (!import.meta.client) {
    return Promise.reject(new Error("Google Identity Services is browser-only"))
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve()

  if (!gisScript) {
    gisScript = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = GIS_SCRIPT
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => {
        gisScript = null // let the next attempt reload it
        script.remove() // don't leave a dead tag behind
        reject(new Error("Google Identity Services failed to load"))
      }
      document.head.appendChild(script)
    })
  }
  return gisScript
}

/**
 * @param {{ preload?: boolean }} [options]
 *   preload: load GIS + build the code client on mount, so the popup can be
 *   opened synchronously inside the click (required by popup blockers).
 *   Use it on the page that owns the "Connect Google" button.
 */
export default function useOAuth2({ preload = false } = {}) {
  const toast = useToast()
  const { t } = useI18n()
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()
  const clientId = config.public?.googleClientId || FALLBACK_CLIENT_ID

  // useState keys make this state shared: every component calling useOAuth2()
  // (the explorer page, the CloudStatus icon, ...) sees the same values.
  const loading = useState("drive:loading", () => true)
  const connecting = useState("drive:connecting", () => false)

  const fail = (title) =>
    toast.add({ color: "error", title: title || t("rtyCms.drive.connectFailed") })

  // Composables like useWeb need the Nuxt context, which is lost inside
  // Google's async callback, so re-enter it explicitly.
  const callApi = (url, options) =>
    nuxtApp.runWithContext(() => useWeb(url, options))

  let codeClient = null

  // ── Popup flow: Google returns a one-time code, backend swaps it for tokens
  async function handleCode(response) {
    try {
      if (response?.error || !response?.code) return fail()

      // User un-ticked the Drive permission on the consent screen.
      if (response.scope && !response.scope.includes(DRIVE_SCOPE)) return fail()

      const { error } = await callApi("api/v1/google-drive/connect_cls", {
        method: "POST",
        data: {
          Code: response.code,
          RedirectUri: POPUP_REDIRECT_URI,
          Action: "authorize",
        },
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })

      if (isNotEmpty(error.value)) {
        return fail(error.value?.detail?.Message || error.value?.error)
      }
      toast.add({ color: "success", title: t("rtyCms.drive.connected") })
    } catch {
      fail()
    } finally {
      connecting.value = false
    }
  }

  function initCodeClient() {
    if (codeClient) return codeClient

    codeClient = window.google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: SCOPES, // NOTE: singular. `scopes` is silently ignored by Google.
      ux_mode: "popup",
      callback: handleCode,
      error_callback: (err) => {
        connecting.value = false
        // The user backing out of the popup is not an error worth reporting.
        if (err?.type === "popup_closed") return
        // Browser blocked the popup → fall back to the full-page redirect flow.
        if (err?.type === "popup_failed_to_open") {
          connect()
          return
        }
        fail()
      },
    })
    return codeClient
  }

  /** Load the script and build the client ahead of the click. Safe to call many times. */
  async function prepare() {
    try {
      await loadGoogleIdentityServices()
      initCodeClient()
    } catch {
      // Retried on click; nothing to tell the user yet.
    }
  }

  async function connectWithGoogle() {
    if (connecting.value) return
    connecting.value = true

    try {
      // Fast path: everything is ready, so requestCode() runs synchronously
      // inside the user's click and the popup is never blocked.
      if (!codeClient) {
        await loadGoogleIdentityServices()
        initCodeClient()
      }
      codeClient.requestCode()
    } catch {
      connecting.value = false
      fail()
    }
  }

  // Full-page redirect handshake: navigates to Google and is sent back through
  // GET /callback on the backend. Also the automatic fallback when popups are blocked.
  async function connect() {
    if (connecting.value) return
    connecting.value = true
    try {
      const { data, error } = await callApi("api/v1/google-drive/connect_cls", {
        method: "POST",
        data: {
          Action: "connect",
          Scope: "",
          RedirectUri: window.location.origin,
        },
      })
      const url = data.value?.AuthorizationUrl
      if (isNotEmpty(error.value) || !url) {
        fail()
        return
      }
      await navigateTo(url, { external: true })
    } catch {
      fail()
    } finally {
      connecting.value = false
    }
  }

  if (preload && import.meta.client && getCurrentInstance()) {
    onMounted(prepare)
  }

  return {
    loading,
    connecting,
    prepare,
    connect,
    connectWithGoogle,
  }
}