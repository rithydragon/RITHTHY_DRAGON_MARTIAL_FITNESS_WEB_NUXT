import { ref } from "vue";

const secretKey = "rtyuserdata";
const key = "rty_user_data";
const ACCESS_AGE = 60 * 60 * 24;
const REFRESH_AGE = 60 * 60 * 24 * 30;
const shared = ref(null);

function cookieOpts(maxAge) {
  let secure = false;
  if (import.meta.client) secure = window.location.protocol === "https:";
  return {
    maxAge,
    sameSite: "lax",
    secure,
    path: "/",
    httpOnly: false,
  };
}

function tokenAge(expiresIn, fallback) {
  return expiresIn && expiresIn > 60 ? expiresIn : fallback;
}

function readFromCookies() {
  const accessToken = useCookie("access_token").value;
  if (isNotEmpty(accessToken)) {
    let user = null;
    const rawUser = useCookie("auth_user").value;
    if (isNotEmpty(rawUser)) {
      try {
        user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      } catch {
        user = null;
      }
    }
    return {
      ...(user || {}),
      access_token: accessToken,
      refresh_token: useCookie("refresh_token").value || "",
      expires_in: null,
    };
  }
  return null;
}

function hydrate() {
  const encrypted = useCookie(key).value;
  if (isNotEmpty(encrypted)) {
    try {
      return JSON.parse(decryptAES(encrypted, secretKey));
    } catch {}
  }
  return readFromCookies();
}

export const useUserData = (val) => {
  if (val === null) {
    useCookie(key, cookieOpts(0)).value = null;
    shared.value = null;
    return shared;
  }

  if (isNotEmpty(val) && typeof val === "object") {
    const encrypted = encryptAES(JSON.stringify(val), secretKey);
    useCookie(key, cookieOpts(tokenAge(val.expires_in, REFRESH_AGE))).value =
      encrypted;

    if (isNotEmpty(val.access_token)) {
      useCookie("access_token", cookieOpts(tokenAge(val.expires_in, ACCESS_AGE)))
        .value = val.access_token;
    }
    if (isNotEmpty(val.refresh_token)) {
      useCookie("refresh_token", cookieOpts(REFRESH_AGE)).value =
        val.refresh_token;
    }

    shared.value = val;
    return shared;
  }

  shared.value = hydrate();
  return shared;
};