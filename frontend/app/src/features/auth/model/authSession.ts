import type { AuthResponse, AuthUser } from "./authTypes";

const tokenKey = "quydung.auth.token";
const userKey = "quydung.auth.user";
const authChangeEvent = "quydung-auth-change";

export function saveAuthSession(response: AuthResponse, persistent: boolean) {
  clearAuthSession();

  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(tokenKey, response.token);
  storage.setItem(userKey, JSON.stringify(response.user));
  window.dispatchEvent(new Event(authChangeEvent));
}

export function clearAuthSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  sessionStorage.removeItem(tokenKey);
  sessionStorage.removeItem(userKey);
  window.dispatchEvent(new Event(authChangeEvent));
}

export function updateStoredUser(user: AuthUser) {
  const storage = localStorage.getItem(tokenKey)
    ? localStorage
    : sessionStorage.getItem(tokenKey)
      ? sessionStorage
      : null;

  if (!storage) return;

  storage.setItem(userKey, JSON.stringify(user));
  window.dispatchEvent(new Event(authChangeEvent));
}

export function getAuthToken() {
  return localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey);
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
