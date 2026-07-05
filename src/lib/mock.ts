export type ProfileKey = "professional" | "just-met" | "friends" | "personal" | "sos";

export const user = {
  name: "Vadik Amar",
  handle: "vadik",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Vadik&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9",
};

export const profiles: Record<
  ProfileKey,
  {
    key: ProfileKey;
    label: string;
    emoji: string;
    headline: string;
    tagline?: string;
    stack?: string[];
    interests?: string[];
    music?: { title: string; sub: string };
    vibe?: string;
    bio?: string;
    ctaLabel: string;
    ctaHref?: string;
    links: { icon: "email" | "call" | "linkedin" | "github" | "instagram" | "whatsapp" | "spotify" | "photos" | "music" | "snapchat"; label: string }[];
  }
> = {
  professional: {
    key: "professional",
    label: "Professional",
    emoji: "💼",
    headline: "Backend Engineer",
    stack: ["Java", "Spring Boot", "Microservices", "AWS", "PostgreSQL", "Docker"],
    ctaLabel: "View Resume",
    bio: "I love building scalable backend systems and solving real-world problems.",
    links: [
      { icon: "email", label: "Email" },
      { icon: "call", label: "Call" },
      { icon: "linkedin", label: "LinkedIn" },
      { icon: "github", label: "GitHub" },
    ],
  },
  "just-met": {
    key: "just-met",
    label: "Just Met",
    emoji: "👋",
    headline: "Backend Engineer",
    tagline: "Love Tech · Travel · Cricket",
    interests: ["Travel", "Cricket", "Photography"],
    ctaLabel: "Let's Connect!",
    links: [
      { icon: "instagram", label: "Instagram" },
      { icon: "whatsapp", label: "WhatsApp" },
      { icon: "linkedin", label: "LinkedIn" },
      { icon: "email", label: "Email" },
    ],
  },
  friends: {
    key: "friends",
    label: "Friends",
    emoji: "❤️",
    headline: "Gaming · Anime · Music",
    music: { title: "Valorant", sub: "Rank: Diamond 2" },
    ctaLabel: "Let's Hangout!",
    links: [
      { icon: "instagram", label: "Instagram" },
      { icon: "snapchat", label: "Snapchat" },
      { icon: "spotify", label: "Spotify" },
      { icon: "whatsapp", label: "WhatsApp" },
    ],
  },
  personal: {
    key: "personal",
    label: "Personal / Date",
    emoji: "💗",
    headline: "Coffee Addict ☕",
    tagline: "Let's create memories 💫",
    vibe: "Good talks, late nights, and endless laughter.",
    ctaLabel: "Let's Talk 💕",
    links: [
      { icon: "instagram", label: "Instagram" },
      { icon: "whatsapp", label: "WhatsApp" },
      { icon: "music", label: "My Playlist" },
      { icon: "photos", label: "Photos" },
    ],
  },
  sos: {
    key: "sos",
    label: "SOS (Emergency)",
    emoji: "🆘",
    headline: "Emergency Profile",
    ctaLabel: "Share Location",
    links: [],
  },
};

export const emergency = {
  contacts: [
    { label: "Mom", phone: "+91 9876543210" },
    { label: "Brother", phone: "+91 9123456780" },
  ],
  medical: [
    { label: "Blood Group", value: "B+" },
    { label: "Allergies", value: "None" },
  ],
};

export const dashboardProfiles = [
  { key: "professional", label: "Professional", sub: "Backend Engineer", active: true },
  { key: "just-met", label: "Just Met", sub: "Networking", active: false },
  { key: "friends", label: "Friends", sub: "Close Friends", active: false },
  { key: "personal", label: "Personal / Date", sub: "Personal", active: false },
  { key: "sos", label: "SOS (Emergency)", sub: "Emergency Profile", active: false },
] as const;

export const nfcCards = [
  { name: "Office Card", id: "TAPM-7X8A", status: "active" as const },
  { name: "Backup Card", id: "TAPM-2K9B", status: "active" as const },
  { name: "Old Card", id: "TAPM-1M3Z", status: "inactive" as const },
];

export const analytics = {
  views: 1284,
  viewsDelta: 12.5,
  visitors: 842,
  visitorsDelta: 8.7,
  clicks: 2341,
  clicksDelta: 15.3,
  chart: [
    { day: "Mon", value: 120 },
    { day: "Tue", value: 180 },
    { day: "Wed", value: 240 },
    { day: "Thu", value: 210 },
    { day: "Fri", value: 260 },
    { day: "Sat", value: 190 },
    { day: "Sun", value: 150 },
  ],
  topLinks: [
    { label: "Resume", count: 832 },
    { label: "LinkedIn", count: 642 },
    { label: "GitHub", count: 421 },
    { label: "Email", count: 210 },
  ],
};
