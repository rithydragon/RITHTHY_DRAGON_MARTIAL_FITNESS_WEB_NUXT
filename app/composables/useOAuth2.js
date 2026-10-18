
const GIS_SCRIPT = "https://accounts.google.com/gsi/client"
let gisScript = null

/**
 * Load Google Identity Services once per page.
 *
 * The widget is only needed on the file explorer, so the script is injected on
 * demand instead of being shipped in every page's head.
 */
function loadGoogleIdentityServices() {
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
        reject(new Error("Google Identity Services failed to load"))
      }
      document.head.appendChild(script)
    })
  }
  return gisScript
}

export default function useOAuth2() {
  const toast = useToast()
  const { t } = useI18n()

  // useState keys make this state shared: every component calling useOAuth2()
  // (the explorer page, the CloudStatus icon, ...) sees the same values.
  const status = useState("drive:status", () => false)
  const loading = useState("drive:loading", () => true)
  const connecting = useState("drive:connecting", () => false)

  // tokens so the client secret never leaves the server.
  async function connectWithGoogle() {
    if (connecting.value) return
    connecting.value = true

    try {
      if (!status.value) {
        console.log("Load() in connectWithGoogle !status.value========> ", !status.value)
      }

      const clientId = status.value?.ClientId
      const scope = status.value?.Scope
      if (!status.value?.DriveEnabled || !clientId || !scope) {
        toast.add({ color: "error", title: t("rtyCms.drive.connectFailed") })
        connecting.value = false
        return
      }

      await loadGoogleIdentityServices()

      const codeClient = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope,
        ux_mode: "popup",
        callback: async (response) => {
          try {
            if (!response?.code) {
              toast.add({ color: "error", title: t("rtyCms.drive.connectFailed") })
              return
            }

            const { error } = await useWeb('api/v1/google-drive/connect',{
              method:'POST',
              data:{
                Code: response.code,
                RedirectUri: window.location.origin,
                Action:'authorize'
              },
              headers: { 'X-Requested-With': 'XMLHttpRequest', },
            })
            if (isNotEmpty(error.value)) {
              toast.add({
                color: "error",
                title:
                  error.value?.detail?.Message
                  || error.value?.error
                  || t("rtyCms.drive.connectFailed"),
              })
              return
            }

            toast.add({ color: "success", title: t("rtyCms.drive.connected") })
          } catch {
            toast.add({ color: "error", title: t("rtyCms.drive.connectFailed") })
          } finally {
            connecting.value = false
          }
        },
        error_callback: (err) => {
          // The user backing out of the popup is not an error worth reporting.
          if (err?.type !== "popup_closed") {
            toast.add({ color: "error", title: t("rtyCms.drive.connectFailed") })
          }
          connecting.value = false
        },
      })

      codeClient.requestCode()
    } catch {
      toast.add({ color: "error", title: t("rtyCms.drive.connectFailed") })
      connecting.value = false
    }
  }

  // Full-page redirect handshake: navigates to Google and is sent back through
  // GET /callback on the backend. Kept for deployments where the widget is off.
  async function connect() {
    if (connecting.value) return
    connecting.value = true
    try {
      const { data, error } = await useWeb("api/v1/google-drive/connect",{
        method:'POST',
        data:{
          Action: 'connect',
          Scope: "",
          RedirectUri: window.location.origin,
        },
      })
      const url = data.value?.AuthorizationUrl
      if (isNotEmpty(error.value) || !url) {
        toast.add({ color: "error", title: t("rtyCms.drive.connectFailed") })
        return
      }
      await navigateTo(url, { external: true })
    } finally {
      connecting.value = false
    }
  }

  return {
    status,
    loading,
    connecting,
    connect,
    connectWithGoogle,
  }
}