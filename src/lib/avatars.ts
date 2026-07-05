// Client-side avatar storage. Backend has no avatar field, so we persist a
// data URL in localStorage keyed by profile id (and mirror by username+type
// so public /u/{handle}/{type} views can find it).

const PREFIX = "tapme.avatar:";

export function avatarKeyById(id: string) {
  return `${PREFIX}id:${id}`;
}
export function avatarKeyByHandleType(handle: string, type: string) {
  return `${PREFIX}u:${handle.toLowerCase()}:${type}`;
}

export function getAvatar(...keys: string[]): string | null {
  if (typeof window === "undefined") return null;
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

export function setAvatar(dataUrl: string, ...keys: string[]) {
  if (typeof window === "undefined") return;
  for (const k of keys) window.localStorage.setItem(k, dataUrl);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
