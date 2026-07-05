import { cn } from "@/lib/utils";
import { profiles as mockProfiles, emergency, user as mockUser } from "@/lib/mock";
import type { ProfileKey } from "@/lib/mock";
import type { Profile, ProfileType } from "@/lib/types";
import { ProfileIcon } from "./ProfileIcon";

type Theme = {
  bg: string;
  accent: string;
  cta: string;
  chip: string;
  sub: string;
  card: string;
  dark: boolean;
};

const themes: Record<ProfileType, Theme> = {
  professional: {
    bg: "bg-gradient-to-b from-[#2a1550] via-[#1c0f3a] to-[#160b2e] text-white",
    accent: "text-purple-200",
    cta: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white",
    chip: "bg-white/10 text-white",
    sub: "text-purple-200/80",
    card: "bg-white/5 border border-white/10 text-white",
    dark: true,
  },
  "just-met": {
    bg: "bg-gradient-to-b from-sky-50 via-white to-sky-100 text-neutral-900",
    accent: "text-sky-600",
    cta: "bg-sky-500 text-white",
    chip: "bg-sky-100 text-sky-900",
    sub: "text-neutral-500",
    card: "bg-white border border-sky-100",
    dark: false,
  },
  friends: {
    bg: "bg-gradient-to-b from-[#062a20] via-[#04211a] to-[#031913] text-white",
    accent: "text-emerald-300",
    cta: "bg-emerald-400 text-emerald-950",
    chip: "bg-emerald-500/10 text-emerald-200",
    sub: "text-emerald-200/80",
    card: "bg-white/5 border border-emerald-500/20 text-white",
    dark: true,
  },
  personal: {
    bg: "bg-gradient-to-b from-pink-100 via-rose-50 to-pink-100 text-neutral-900",
    accent: "text-pink-600",
    cta: "bg-pink-500 text-white",
    chip: "bg-pink-100 text-pink-800",
    sub: "text-neutral-500",
    card: "bg-white border border-pink-200",
    dark: false,
  },
  sos: {
    bg: "bg-white text-neutral-900",
    accent: "text-red-600",
    cta: "bg-red-600 text-white",
    chip: "bg-red-50 text-red-700",
    sub: "text-neutral-500",
    card: "bg-white border border-neutral-200",
    dark: false,
  },
};

/**
 * Renders a themed profile card. Prefers a real Profile from the backend;
 * falls back to a static mock keyed by `type` for previews.
 */
export function ProfileView({
  type,
  data,
  avatarUrl,
}: {
  type?: ProfileType | ProfileKey;
  data?: Profile;
  avatarUrl?: string | null;
}) {
  const activeType: ProfileType =
    (data?.profileType as ProfileType) ??
    (type as ProfileType) ??
    "professional";
  const t = themes[activeType];
  const isSos = activeType === "sos";

  const displayName = data?.displayName ?? mockUser.name;
  const headline = data?.headline ?? mockProfiles[activeType].headline;
  const bio = data?.bio ?? mockProfiles[activeType].bio;
  const interests = data?.interests ?? mockProfiles[activeType].interests;
  const links =
    data?.links && data.links.length > 0
      ? data.links.map((l) => ({ icon: l.icon, label: l.label, url: l.url }))
      : mockProfiles[activeType].links.map((l) => ({
          icon: l.icon as string,
          label: l.label,
          url: "#",
        }));
  const ctaLabel = mockProfiles[activeType].ctaLabel;
  const avatarSrc = avatarUrl || mockUser.avatar;

  // Theme color override: `data.theme` is a raw CSS color (oklch/hex/etc).
  // We build an inline gradient + accent styles so the user's choice is
  // actually visible on both the preview and the public profile.
  const themeColor = data?.theme?.trim();
  const hasCustom = !!themeColor && !isSos;
  const bgStyle = hasCustom
    ? {
        background: t.dark
          ? `linear-gradient(180deg, color-mix(in oklab, ${themeColor} 55%, #000) 0%, color-mix(in oklab, ${themeColor} 25%, #000) 60%, #0b0714 100%)`
          : `linear-gradient(180deg, color-mix(in oklab, ${themeColor} 18%, #fff) 0%, #ffffff 60%, color-mix(in oklab, ${themeColor} 15%, #fff) 100%)`,
      }
    : undefined;
  const ctaStyle = hasCustom
    ? {
        background: `linear-gradient(90deg, ${themeColor}, color-mix(in oklab, ${themeColor} 60%, #fff))`,
        color: t.dark ? "#fff" : "#111",
      }
    : undefined;
  const chipStyle = hasCustom
    ? {
        background: t.dark
          ? `color-mix(in oklab, ${themeColor} 22%, transparent)`
          : `color-mix(in oklab, ${themeColor} 18%, #fff)`,
        color: t.dark ? "#fff" : "#111",
      }
    : undefined;
  const accentStyle = hasCustom ? { color: themeColor } : undefined;

  return (
    <div
      className={cn("h-full min-h-[560px] px-5 pt-4 pb-6", !hasCustom && t.bg, hasCustom && (t.dark ? "text-white" : "text-neutral-900"))}
      style={bgStyle}
    >
      <div className="flex flex-col items-center pt-2">
        {isSos ? (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-2xl font-bold text-white shadow-lg">
            SOS
          </div>
        ) : (
          <img
            src={avatarSrc}
            alt={displayName}
            className="h-24 w-24 rounded-full border-4 border-white/40 object-cover shadow-lg"
          />
        )}
        <h1 className="mt-3 text-xl font-semibold">{displayName}</h1>
        {headline && <p className={cn("text-sm", t.sub)}>{headline}</p>}
      </div>

      {activeType === "professional" && interests && interests.length > 0 && (
        <div className={cn("mt-4 text-center text-[11px] leading-relaxed", !hasCustom && t.accent)} style={accentStyle}>
          {interests.join("  |  ")}
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-6 grid grid-cols-4 gap-3">
          {links.slice(0, 8).map((l, i) => {
            const inner = (
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn("flex h-11 w-11 items-center justify-center rounded-full", !hasCustom && t.chip)}
                  style={chipStyle}
                >
                  <ProfileIcon name={l.icon as never} className="h-5 w-5" />
                </div>
                <span className={cn("text-[10px]", t.sub)}>{l.label}</span>
              </div>
            );
            return l.url && l.url !== "#" ? (
              <a key={`${l.label}-${i}`} href={l.url} target="_blank" rel="noreferrer">
                {inner}
              </a>
            ) : (
              <div key={`${l.label}-${i}`}>{inner}</div>
            );
          })}
        </div>
      )}

      {!isSos && (
        <button
          className={cn("mt-6 w-full rounded-xl py-3 text-sm font-semibold shadow-md", !hasCustom && t.cta)}
          style={ctaStyle}
        >
          {ctaLabel}
        </button>
      )}

      {bio && activeType !== "friends" && activeType !== "sos" && (
        <div className="mt-5">
          <p className="mb-1 text-sm font-semibold">
            {activeType === "personal" ? "My Vibe" : activeType === "just-met" ? "Tagline" : "About Me"}
          </p>
          <p className={cn("text-xs leading-relaxed", t.sub)}>{bio}</p>
        </div>
      )}

      {activeType !== "professional" && interests && interests.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">Interests</p>
          <div className="flex flex-wrap gap-2">
            {interests.map((i) => (
              <span
                key={i}
                className={cn("rounded-full px-3 py-1 text-[11px]", !hasCustom && t.chip)}
                style={chipStyle}
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      {isSos && (
        <>
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-bold tracking-wider text-neutral-500">
              EMERGENCY CONTACTS
            </p>
            <div className="space-y-2">
              {(links.length > 0 ? links : emergency.contacts.map((c) => ({ label: c.label, url: `tel:${c.phone}`, icon: "call" }))).map(
                (c, i) => (
                  <a
                    key={`${c.label}-${i}`}
                    href={c.url || "#"}
                    className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium">{c.label}</p>
                      <p className="text-[11px] text-neutral-500">{c.url}</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <ProfileIcon name="call" className="h-4 w-4" />
                    </div>
                  </a>
                ),
              )}
            </div>
          </div>
          <button className={cn("mt-5 w-full rounded-xl py-3 text-sm font-semibold shadow-md", t.cta)}>
            {ctaLabel}
          </button>
        </>
      )}
    </div>
  );
}
