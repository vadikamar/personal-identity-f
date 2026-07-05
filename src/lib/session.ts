const KEY = "tapme.username";

export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

/** Set the username once. Subsequent calls with a different value are ignored — usernames are permanent. */
export function setUsername(username: string): string {
  if (typeof window === "undefined") return username;
  const existing = window.localStorage.getItem(KEY);
  if (existing) return existing;
  const normalized = username.trim().toLowerCase();
  window.localStorage.setItem(KEY, normalized);
  return normalized;
}

export function isValidUsername(u: string): boolean {
  return /^[a-z0-9_.-]{3,24}$/.test(u.trim().toLowerCase());
}
