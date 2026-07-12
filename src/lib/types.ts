export type ProfileType =
  | "professional"
  | "just-met"
  | "friends"
  | "personal"
  | "sos";

export const PROFILE_TYPES: ProfileType[] = [
  "professional",
  "just-met",
  "friends",
  "personal",
  "sos",
];

export const PROFILE_TYPE_LABEL: Record<ProfileType, string> = {
  professional: "Professional",
  "just-met": "Just Met",
  friends: "Friends",
  personal: "Personal / Date",
  sos: "SOS (Emergency)",
};

export type LinkIcon =
  | "email"
  | "call"
  | "linkedin"
  | "github"
  | "instagram"
  | "whatsapp"
  | "spotify"
  | "photos"
  | "music"
  | "snapchat"
  | "resume";

export interface Link {
  label: string;
  url: string;
  icon: LinkIcon | string;
  clicks?: number;
}

export interface Profile {
  id: string;
  displayName: string;
  profileType: ProfileType;
  userName: string;
  headline?: string;
  bio?: string;
  theme?: string;
  photoUrl?: string;
  active: boolean;
  interests?: string[];
  links?: Link[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileRequest {
  displayName: string;
  profileType: ProfileType;
  userName: string;
  headline?: string;
  bio?: string;
  theme?: string;
  photoUrl?: string;
  active: boolean;
  interests?: string[];
  links?: Link[];
}

export interface NfcCard {
  id: string;
  cardLabel: string;
  cardId: string;
  status: string;
  active: boolean;
  assignedProfileId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NfcCardRequest {
  cardLabel: string;
  status: string;
  active: boolean;
  assignedProfile?: string;
}

export interface ProfilePost {
  id: string;
  description: string;
  photoUrl: string;
  createdAt?: string;
}

export interface ProfilePostRequest {
  description: string;
  photoUrl: string;
}

export const MAX_POSTS_PER_PROFILE = 5;

export interface VisitorLocation {
  id: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  address?: string;
  visitedAt?: string;
}

export interface VisitorLocationRequest {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  address?: string;
}

export interface ProfileLinkMetric {
  label: string;
  url: string;
  clicks: number;
}

export interface AnalyticsOverview {
  totalProfiles: number;
  activeProfiles: number;
  totalCards: number;
  activeCards: number;
  uniqueVisitors: number;
  linkClicks: number;
  topLinks: ProfileLinkMetric[];
}
