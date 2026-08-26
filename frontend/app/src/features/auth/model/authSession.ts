import type { AuthResponse, AuthUser } from "./authTypes";

const tokenKey = "quydung.auth.token";
const legacyRefreshTokenKey = "quydung.auth.refresh-token";
const userKey = "quydung.auth.user";
const authChangeEvent = "quydung-auth-change";

export function saveAuthSession(response: AuthResponse, persistent: boolean) {
  clearStoredSession();

  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(tokenKey, response.token);
  storage.setItem(userKey, JSON.stringify(response.user));
  window.dispatchEvent(new Event(authChangeEvent));
}

export function clearAuthSession() {
  clearStoredSession();
  window.dispatchEvent(new Event(authChangeEvent));
}

function clearStoredSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(legacyRefreshTokenKey);
  localStorage.removeItem(userKey);
  sessionStorage.removeItem(tokenKey);
  sessionStorage.removeItem(legacyRefreshTokenKey);
  sessionStorage.removeItem(userKey);
}

export function updateStoredUser(user: AuthUser) {
  const storage = getSessionStorage();

  if (!storage) return;

  storage.setItem(userKey, JSON.stringify(user));
  window.dispatchEvent(new Event(authChangeEvent));
}

export function getAuthToken() {
  return localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey);
}

export function isAuthSessionPersistent() {
  return Boolean(localStorage.getItem(tokenKey));
}

export function getStoredUser(): AuthUser | null {
  const rawUser = localStorage.getItem(userKey) || sessionStorage.getItem(userKey);

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

export const onAuthChange = (listener: () => void) => {
  window.addEventListener(authChangeEvent, listener);
  return () => window.removeEventListener(authChangeEvent, listener);
};

function getSessionStorage() {
  if (localStorage.getItem(tokenKey)) {
    return localStorage;
  }
  if (sessionStorage.getItem(tokenKey)) {
    return sessionStorage;
  }
  return null;
}
