import type {
  AnalyticsOverview,
  NfcCard,
  NfcCardRequest,
  Profile,
  ProfileAccessCreateRequest,
  ProfileAccessRequest,
  ProfilePost,
  ProfilePostRequest,
  ProfileRequest,
  VisitorLocation,
  VisitorLocationRequest,
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

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("tapme.basicauth");
  return token ? { Authorization: token } : {};
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  if (res.status === 404) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return null as any;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    // Global session expiry: clear creds and bounce to /auth for non-auth calls.
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !path.startsWith("/api/auth/")
    ) {
      window.localStorage.removeItem("tapme.basicauth");
      const here = window.location.pathname + window.location.search;
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.replace(`/auth?redirect=${encodeURIComponent(here)}`);
      }
    }
    throw new ApiError(res.status, text || res.statusText);
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
      headers: { ...authHeaders() },
      body: form,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new ApiError(res.status, text || res.statusText);
    }
    const body = (await res.json()) as ApiEnvelope<Profile>;
    return body.data;
  },

  // Auth
  signUp: (username: string, password: string) =>
    request<string>("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  signIn: (username: string, password: string) =>
    request<string>("/api/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  signOut: () => request<string>("/api/auth/sign-out", { method: "POST" }),
  updatePassword: (username: string, password: string, newPassword: string) =>
    request<string>("/api/auth/password-update", {
      method: "POST",
      body: JSON.stringify({ username, password, newPassword }),
    }),



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

  // Visitor locations (SOS)
  recordVisitorLocation: (username: string, body: VisitorLocationRequest) =>
    request<Profile>(
      `/api/profiles/${encodeURIComponent(username)}/visitor-location`,
      { method: "POST", body: JSON.stringify(body) },
    ),
  listVisitorLocations: (username: string) =>
    request<VisitorLocation[]>(
      `/api/profiles/${encodeURIComponent(username)}/visitor-locations`,
    ),

  // Profile access requests
  requestProfileAccess: (ownerProfileId: string, body: ProfileAccessCreateRequest) =>
    request<ProfileAccessRequest>(
      `/api/profiles/${encodeURIComponent(ownerProfileId)}/access-requests`,
      { method: "POST", body: JSON.stringify(body) },
    ),
  listPendingAccessRequests: () =>
    request<ProfileAccessRequest[]>("/api/profiles/dashboard/access-requests"),
  approveAccessRequest: (requestId: string) =>
    request<ProfileAccessRequest>(
      `/api/profiles/access-requests/${encodeURIComponent(requestId)}/approve`,
      { method: "POST" },
    ),
  rejectAccessRequest: (requestId: string) =>
    request<ProfileAccessRequest>(
      `/api/profiles/access-requests/${encodeURIComponent(requestId)}/reject`,
      { method: "POST" },
    ),
  viewAuthorizedProfile: (username: string) =>
    request<Profile | null>(
      `/api/profiles/${encodeURIComponent(username)}/view`,
    ),

  // Resolves the best profile to display for the given handle.
  // Signed-in viewers: try the authorized `/view` endpoint first (may return
  // a profile approved specifically for the requester), fall back to the
  // public endpoint. Signed-out viewers always use the public endpoint.
  resolveViewableProfile: async (
    username: string,
    signedIn: boolean,
  ): Promise<Profile | null> => {
    if (signedIn) {
      try {
        const authorized = await api.viewAuthorizedProfile(username);
        if (authorized) return authorized;
      } catch {
        // fall through to public endpoint
      }
    }
    return api.getProfileByUsername(username);
  },
};

export { BASE_URL };
