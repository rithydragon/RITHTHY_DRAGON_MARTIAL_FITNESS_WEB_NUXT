# OFIT Telegram OIDC Login

This document describes the Telegram OIDC login flow used by the OFIT Nuxt frontend and the RamaGallery FastAPI backend.

## Architecture

1. The frontend opens the official Telegram Login library from `https://oauth.telegram.org/js/telegram-login.js?6`.
2. The frontend requests a one-time nonce and the public Telegram Client ID from `GET /api/v1/auth/oauth/telegram/config`.
3. Telegram returns an `id_token` through the popup callback. The frontend does not decode or trust the token for authentication.
4. The frontend sends the token and nonce to `POST /api/v1/auth/oauth/telegram/oidc`.
5. The backend fetches Telegram's JWKS, verifies the token, consumes the nonce, rejects token replay, and creates the application session.
6. The frontend stores the returned access and refresh tokens and uses the access token as a Bearer token for `/api/v1/auth/me`.

The Telegram Client Secret is not required by the JavaScript widget flow, but it must remain backend-only if it is configured for other Telegram OAuth/OIDC operations. Never expose it through Nuxt public runtime configuration.

## Telegram setup

1. Create or choose a bot with `@BotFather`.
2. Open **Login Widget** and register every frontend origin that will render the button.
3. Register the exact frontend URL used by the login page. The SDK uses the current page origin and pathname as its redirect URI, so register the actual route used in the browser, normally `https://your-domain.example/`.
4. Copy the Client ID and Client Secret from BotFather.
5. Keep the default `RS256` signing algorithm unless the backend verifier is deliberately extended for another algorithm.
6. Use a public HTTPS frontend origin. `localhost`, private IPs, and unregistered domains are rejected by Telegram.
7. Ensure the frontend and backend use the same public frontend origin in their deployment configuration. A mismatch causes the backend preflight to return `domain_ok: false`.

Official references:

- [Telegram Login documentation](https://core.telegram.org/widgets/login)
- [Telegram OIDC discovery document](https://oauth.telegram.org/.well-known/openid-configuration)
- [Telegram JWKS endpoint](https://oauth.telegram.org/.well-known/jwks.json)

## Backend configuration

Set these values in the backend `.env` or deployment secret store:

```dotenv
TELEGRAM_CLIENT_ID=your-telegram-client-id
TELEGRAM_CLIENT_SECRET=your-telegram-client-secret
TELEGRAM_WIDGET_BASE_URL=https://your-frontend.example
TELEGRAM_OIDC_ISSUER=https://oauth.telegram.org
TELEGRAM_OIDC_JWKS_URL=https://oauth.telegram.org/.well-known/jwks.json
TELEGRAM_OIDC_NONCE_TTL_SECONDS=600
TELEGRAM_OIDC_MAX_TOKEN_AGE_SECONDS=86400
REDIS_URL=redis://redis-host:6379/0
ALLOWED_ORIGINS=https://your-frontend.example
```

`TELEGRAM_WIDGET_BASE_URL` must be the HTTPS origin registered with BotFather. It must not contain a path, query string, fragment, credentials, or a private/local host.

Use Redis in every multi-instance deployment. The in-memory fallback is intended for local development only because nonce and replay state is process-local when Redis is unavailable.

## Frontend configuration

Set these values in the Nuxt `.env` or deployment environment:

```dotenv
NUXT_PUBLIC_API_BASE=https://your-api.example
NUXT_PUBLIC_SITE_URL=https://your-frontend.example
NUXT_PUBLIC_TELEGRAM_CLIENT_ID=your-telegram-client-id
NUXT_PUBLIC_TELEGRAM_BOT_NAME=your_bot_username
```

`NUXT_PUBLIC_TELEGRAM_CLIENT_ID` is a public identifier only. The backend configuration remains authoritative for the Client ID used during token verification.

The frontend must load the official script dynamically. Do not place a side-effect `<script>` directly inside a Vue component template; Vue ignores such tags in client components.

```ts
const script = document.createElement('script')
script.async = true
script.src = 'https://oauth.telegram.org/js/telegram-login.js?6'
script.dataset.clientId = String(clientId)
script.dataset.requestAccess = 'write'
script.dataset.onauth = 'window.onTelegramOauth(data)'
script.dataset.telegramLogin = 'true'
document.head.appendChild(script)
```

The callback must be `window.onTelegramOauth(data)`. The application initializes the SDK with `openid`, `profile`, and `write` scopes. The SDK translates `write` to Telegram's `telegram:bot_access` scope.

## API contract

### Preflight

`GET /api/v1/auth/oauth/telegram/config`

Successful response:

```json
{
  "success": true,
  "data": {
    "configured": true,
    "client_id": "your-telegram-client-id",
    "nonce": "one-time-random-value",
    "scope": "openid profile",
    "request_access": "write",
    "origin": "https://your-frontend.example",
    "domain_ok": true
  }
}
```

The nonce is stored in the backend cache and expires after `TELEGRAM_OIDC_NONCE_TTL_SECONDS`. A nonce can be consumed only once.

### Session exchange

`POST /api/v1/auth/oauth/telegram/oidc`

Request body:

```json
{
  "id_token": "telegram-id-token",
  "nonce": "the-preflight-nonce",
  "remember": false
}
```

Successful response:

```json
{
  "success": true,
  "data": {
    "access_token": "application-access-token",
    "refresh_token": "application-refresh-token",
    "expires_in": 3600
  }
}
```

The application accepts the token only after all of these checks pass:

- JWT header algorithm is `RS256`.
- Signature validates against the matching key in Telegram's JWKS.
- `iss` equals `https://oauth.telegram.org`.
- `aud` matches the configured Telegram Client ID.
- `exp` and `iat` are valid and within the configured age limit.
- `nonce` matches the one-time preflight nonce.
- The token has not already been used.

The endpoint is rate-limited to 10 attempts per client IP per minute. Invalid, expired, wrong-audience, wrong-issuer, wrong-nonce, and replayed tokens are rejected without creating a session.

## Browser and deployment requirements

The Telegram popup uses `window.postMessage` across origins. Do not deploy the frontend with:

```text
Cross-Origin-Opener-Policy: same-origin
```

The Nuxt configuration sets:

```text
Cross-Origin-Opener-Policy: same-origin-allow-popups
```

If a reverse proxy or CDN adds `Cross-Origin-Opener-Policy: same-origin`, remove or override that header. Also allow the frontend origin in the backend CORS configuration.

The API and frontend must use HTTPS in production. A browser cannot complete the Telegram widget flow from an unregistered `http://localhost` page.

## Database requirements

The OAuth user upsert uses the existing `USERS`, `USER_PROFILES`, `AUTH_PROVIDERS`, `OAUTH_PROVIDERS`, and `OAUTH_ACCOUNTS` tables. Telegram does not return an email address for this flow, so the backend generates a stable synthetic storage email and username for new OAuth-only users:

```text
telegram_<hash>@users.invalid
telegram_<hash>
```

These values are internal storage compatibility values. They are not sent to Telegram and must not be presented as a verified user email.

Before deployment, verify the live schema against the SQLAlchemy models. The repository's `db.sql` is an older reference schema and does not fully match the current application schema; in particular, field names such as `HASHED_PASSWORD`, `IS_ACTIVE`, and `USER_TYPE_ID` must be checked against the deployed database. Do not assume that the reference SQL file is an executable migration for the current code.

The OAuth account row must have a unique key on `(PROVIDER_ID, PROVIDER_USER_ID)`. That key prevents a Telegram account from being linked to multiple users.

## Local development

The backend can be run locally with Python 3.12. The repository's `pyproject.toml` requires Python `>=3.12,<3.13`; Python 3.13 may install dependencies but is outside the supported range.

The Telegram widget itself cannot be reliably tested on `localhost`. Use a registered HTTPS staging domain or a secure tunnel whose origin has been added to BotFather. Keep production Client Secrets out of local frontend files and never paste them into issue reports.

## Verification

From the backend directory:

```powershell
python -m compileall -q app
python -c "from app.core.telegram_oidc import TelegramOIDCIdentity; print('ok')"
```

From the frontend directory:

```powershell
npm run build
```

A successful Nuxt build should end with `Build complete!`. The build may still report existing bundle-size, sourcemap, or deprecated dependency warnings; those warnings do not indicate a Telegram login failure.

For a live test:

1. Open the frontend over HTTPS.
2. Open the login modal and select Telegram.
3. Confirm that the Telegram button opens the official popup.
4. Complete login and confirm that the modal closes after `/api/v1/auth/me` succeeds.
5. Refresh the page and confirm that the session remains usable.
6. Replay the same ID token/nonce pair in a test client and confirm that it is rejected.

## Troubleshooting

### `Telegram login is not configured`

Verify `TELEGRAM_CLIENT_ID`, `TELEGRAM_OIDC_ISSUER`, and `TELEGRAM_OIDC_JWKS_URL` in the backend environment, then restart the API process.

### `domain_ok: false`

Compare the browser origin with `TELEGRAM_WIDGET_BASE_URL` and the allowed URL in BotFather. They must match exactly, including scheme, host, and any non-default port.

### The popup opens but no callback arrives

Check for `Cross-Origin-Opener-Policy: same-origin`, browser popup blockers, third-party cookie restrictions, and a Content Security Policy that blocks `https://oauth.telegram.org`.

### `invalid_telegram_id_token`

Check that the backend Client ID matches the token audience, the issuer is `https://oauth.telegram.org`, the system clock is correct, and the BotFather signing algorithm is the default `RS256`.

### `invalid_telegram_nonce` or `telegram_oidc_replay`

Use a fresh preflight request for every login attempt. Do not reuse an old popup callback or submit the same ID token twice.

### Account creation fails

Verify the live `USERS` and `USER_PROFILES` columns and foreign-key rows against the current application schema. Check the backend database logs for the exact SQL error before changing the OAuth code.
