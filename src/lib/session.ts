const USER_KEY = "tapme.username";
const AUTH_KEY = "tapme.basicauth";

function b64(input: string): string {
  if (typeof window === "undefined") return "";
  // btoa handles ASCII; usernames/passwords may contain unicode — encode via UTF-8 first.
  return window.btoa(unescape(encodeURIComponent(input)));
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_KEY);
}

export function getAuthHeader(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_KEY);
}

export function isSignedIn(): boolean {
  return !!getAuthHeader() && !!getUsername();
}

export function setCredentials(username: string, password: string): string {
  const normalized = username.trim().toLowerCase();
  if (typeof window === "undefined") return normalized;
  window.localStorage.setItem(USER_KEY, normalized);
  window.localStorage.setItem(AUTH_KEY, `Basic ${b64(`${normalized}:${password}`)}`);
  return normalized;
}

export function clearCredentials(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(AUTH_KEY);
}

export function isValidUsername(u: string): boolean {
  return /^[a-z0-9_.-]{3,24}$/.test(u.trim().toLowerCase());
}
