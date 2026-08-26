import type { AuthResponse, AuthUser } from "./authTypes";

const tokenKey = "quydung.auth.token";
const refreshTokenKey = "quydung.auth.refresh-token";
const userKey = "quydung.auth.user";
const authChangeEvent = "quydung-auth-change";

export function saveAuthSession(response: AuthResponse, persistent: boolean) {
  clearStoredSession();

  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(tokenKey, response.token);
  storage.setItem(refreshTokenKey, response.refreshToken);
  storage.setItem(userKey, JSON.stringify(response.user));
  window.dispatchEvent(new Event(authChangeEvent));
}

export function clearAuthSession() {
  clearStoredSession();
  window.dispatchEvent(new Event(authChangeEvent));
}

function clearStoredSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(refreshTokenKey);
  localStorage.removeItem(userKey);
  sessionStorage.removeItem(tokenKey);
  sessionStorage.removeItem(refreshTokenKey);
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

export function getRefreshToken() {
  return localStorage.getItem(refreshTokenKey) || sessionStorage.getItem(refreshTokenKey);
}

export function isAuthSessionPersistent() {
  return Boolean(localStorage.getItem(refreshTokenKey) || localStorage.getItem(tokenKey));
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
  if (localStorage.getItem(tokenKey) || localStorage.getItem(refreshTokenKey)) {
    return localStorage;
  }
  if (sessionStorage.getItem(tokenKey) || sessionStorage.getItem(refreshTokenKey)) {
    return sessionStorage;
  }
  return null;
}
