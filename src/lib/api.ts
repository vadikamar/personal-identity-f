import type {
  AnalyticsOverview,
  NfcCard,
  NfcCardRequest,
  Profile,
  ProfilePost,
  ProfilePostRequest,
  ProfileRequest,
} from "./types";

const BASE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE_URL) ||
  "https://personal-identity.onrender.com";

interface ApiEnvelope<T> {
  status: number;
  message: string;
  msId: string;
  data: T;
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (res.status === 404) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return null as any;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return undefined as any;
  }
  const body = (await res.json()) as ApiEnvelope<T>;
  return body.data;
}

export const api = {
  // Profiles
  listProfiles: () => request<Profile[]>("/api/profiles"),
  getActiveProfile: () => request<Profile | null>("/api/profiles/active"),
  getProfileByUsername: (username: string) =>
    request<Profile | null>(`/api/profiles/${encodeURIComponent(username)}`),
  createProfile: (body: ProfileRequest) =>
    request<Profile>("/api/profiles", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateProfile: (id: string, body: ProfileRequest) =>
    request<Profile>(`/api/profiles/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteProfile: (id: string) =>
    request<void>(`/api/profiles/${id}`, { method: "DELETE" }),
  activateProfile: (id: string) =>
    request<Profile>(`/api/profiles/${id}/activate`, { method: "POST" }),
  deactivateProfile: (id: string) =>
    request<Profile>(`/api/profiles/${id}/deactivate`, { method: "POST" }),
  uploadProfilePhoto: async (id: string, file: File): Promise<Profile> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/api/profiles/${id}/photo`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`Upload ${res.status}: ${text}`);
    }
    const body = (await res.json()) as ApiEnvelope<Profile>;
    return body.data;
  },


  // Posts
  listPosts: (profileId: string) =>
    request<ProfilePost[]>(`/api/profiles/${profileId}/posts`),
  addPost: (profileId: string, body: ProfilePostRequest) =>
    request<Profile>(`/api/profiles/${profileId}/posts`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updatePost: (profileId: string, postId: string, body: ProfilePostRequest) =>
    request<ProfilePost>(`/api/profiles/${profileId}/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deletePost: (profileId: string, postId: string) =>
    request<void>(`/api/profiles/${profileId}/posts/${postId}`, {
      method: "DELETE",
    }),

  // Cards
  listCards: () => request<NfcCard[]>("/api/cards"),
  createCard: (body: NfcCardRequest) =>
    request<NfcCard>("/api/cards", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteCard: (id: string) =>
    request<void>(`/api/cards/${id}`, { method: "DELETE" }),
  deactivateCard: (id: string) =>
    request<NfcCard>(`/api/cards/${id}/deactivate`, { method: "POST" }),

  // Analytics
  analyticsOverview: () =>
    request<AnalyticsOverview>("/api/analytics/overview"),
};

export { BASE_URL };
