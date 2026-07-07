import type { LinkIcon, ProfileType } from "./types";

export interface FieldSpec {
  showHeadline: boolean;
  bioLabel: string | null; // null = hidden
  interestsLabel: string | null;
  suggestedLinks: { icon: LinkIcon; label: string; placeholder: string }[];
}

export const PROFILE_FIELDS: Record<ProfileType, FieldSpec> = {
  professional: {
    showHeadline: true,
    bioLabel: "About Me",
    interestsLabel: "Tech Stack (comma separated)",
    suggestedLinks: [
      { icon: "email", label: "Email", placeholder: "mailto:you@example.com" },
      { icon: "call", label: "Call", placeholder: "tel:+911234567890" },
      { icon: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/you" },
      { icon: "github", label: "GitHub", placeholder: "https://github.com/you" },
      { icon: "resume", label: "Resume", placeholder: "https://drive.google.com/…/resume.pdf" },
    ],
  },
  "just-met": {
    showHeadline: true,
    bioLabel: "Tagline",
    interestsLabel: "Interests (comma separated)",
    suggestedLinks: [
      { icon: "instagram", label: "Instagram", placeholder: "https://instagram.com/you" },
      { icon: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/91xxxxxxxxxx" },
      { icon: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/you" },
      { icon: "email", label: "Email", placeholder: "mailto:you@example.com" },
    ],
  },
  friends: {
    showHeadline: true,
    bioLabel: null,
    interestsLabel: "Vibes (comma separated)",
    suggestedLinks: [
      { icon: "instagram", label: "Instagram", placeholder: "https://instagram.com/you" },
      { icon: "snapchat", label: "Snapchat", placeholder: "https://snapchat.com/add/you" },
      { icon: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/user/you" },
      { icon: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/91xxxxxxxxxx" },
    ],
  },
  personal: {
    showHeadline: true,
    bioLabel: "My Vibe",
    interestsLabel: null,
    suggestedLinks: [
      { icon: "instagram", label: "Instagram", placeholder: "https://instagram.com/you" },
      { icon: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/91xxxxxxxxxx" },
      { icon: "music", label: "My Playlist", placeholder: "https://open.spotify.com/playlist/..." },
      { icon: "photos", label: "Photos", placeholder: "https://photos.app.goo.gl/..." },
    ],
  },
  sos: {
    showHeadline: false,
    bioLabel: null,
    interestsLabel: null,
    suggestedLinks: [
      { icon: "call", label: "Mom", placeholder: "tel:+919876543210" },
      { icon: "call", label: "Brother", placeholder: "tel:+919123456780" },
    ],
  },
};
