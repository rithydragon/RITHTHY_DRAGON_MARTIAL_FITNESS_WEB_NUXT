// Token refresh composable
// Called proactively before requests and reactively on 401 responses.

let isRefreshing = false;
// Queue of resolvers waiting for an in-progress refresh to complete
let refreshQueue = [];

function resolveQueue(success) {
  refreshQueue.forEach((resolve) => resolve(success));
  refreshQueue = [];
}

function isJwtExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Treat as expired 30 seconds early to avoid edge-case 401s
    return payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
}

export const useRefreshToken = async (force = false) => {
  // If another refresh is already in flight, wait for it instead of starting a new one
  if (isRefreshing) {
    return new Promise((resolve) => refreshQueue.push(resolve));
  }

  const refreshToken = useCookie('refresh_token').value;
  if (!refreshToken) {
    // Both tokens gone — session fully expired, redirect to login
    resolveQueue(false);
    const authStore = useAuthStore();
    authStore.clearAuthCookies();
    await navigateTo(localePath('/?auth=login'), { replace: true })
    return false;
  }

  // Skip if access token is still valid (unless forced)
  if (!force) {
    const accessToken = useCookie('access_token').value;
    if (accessToken && !isJwtExpired(accessToken)) {
      resolveQueue(true);
      return true;
    }
  }

  isRefreshing = true;

  try {
    const { default: axios } = await import('axios');
    const { config } = helper();
    const baseUrl = (useCookie('tmp_server').value || config.apiUrl).replace(/\/$/, '');

    const response = await axios.post(
      `${getUrl('/api/v1/auth/refresh')}`,
      {
        refresh_token: encodeURIComponent(refreshToken)
      }
    );

    const payload = response.data?.data ?? response.data;
    if (!payload?.accessToken) throw new Error('No access token in refresh response');

    // Preserve remember-me maxAge if the flag cookie is set
    const isRemembered = useCookie('remember_me').value === '1'
    const isProd = process.env.NODE_ENV === 'production'
    const accessMaxAge  = isRemembered ? 60 * 60 * 24 * 30 : 60 * 60 * 24
    const refreshMaxAge = isRemembered ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7
    const opts = (age) => ({ maxAge: age, sameSite: 'lax', secure: isProd, path: '/' })

    // Update cookies — must use same options as when first written
    useCookie('access_token',  opts(accessMaxAge)).value  = payload.accessToken;
    useCookie('refresh_token', opts(refreshMaxAge)).value = payload.refreshToken;

    // Sync Pinia store
    const authStore = useAuthStore();
    authStore.token = payload.accessToken;
    if (payload.refreshToken) authStore.refreshToken = payload.refreshToken;
    authStore.persist();

    resolveQueue(true);
    return true;
  } catch {
    // Refresh failed — clear auth and redirect to login
    const isProdClear = process.env.NODE_ENV === 'production'
    useCookie('access_token',  { maxAge: 0, sameSite: 'lax', secure: isProdClear, path: '/' }).value = null;
    useCookie('refresh_token', { maxAge: 0, sameSite: 'lax', secure: isProdClear, path: '/' }).value = null;

    const authStore = useAuthStore();
    authStore.clearAuthCookies();

    await navigateTo(localePath('/?auth=login'), { replace: true })
    // await navigateTo('/', { replace: true });

    resolveQueue(false);
    return false;
  } finally {
    isRefreshing = false;
  }
};
