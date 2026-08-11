// server/api/[...].ts
// Same-origin proxy into the FastAPI backend. Keeping API calls same-origin
// during SSR lets the httpOnly refresh-token cookie travel automatically and
// avoids CORS entirely for browser requests that hit /api/* on this Nuxt
// server instead of the FastAPI host directly.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = event.path.replace(/^\/api/, '')
  const target = `${config.public.apiBase}${path}`

  return proxyRequest(event, target, {
    headers: {
      // forward the incoming cookie so FastAPI sees the refresh token
      cookie: getHeader(event, 'cookie') || '',
    },
  })
})
