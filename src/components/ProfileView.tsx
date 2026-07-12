import { cn } from "@/lib/utils";
import { profiles as mockProfiles, emergency, user as mockUser } from "@/lib/mock";
import type { ProfileKey } from "@/lib/mock";
import type { Profile, ProfilePost, ProfileType, VisitorLocation } from "@/lib/types";
import { api } from "@/lib/api";
import { ProfileIcon } from "./ProfileIcon";
import { Image as ImageIcon, MapPin, X, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";


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
  posts,
  handle,
}: {
  type?: ProfileType | ProfileKey;
  data?: Profile;
  avatarUrl?: string | null;
  posts?: ProfilePost[];
  handle?: string;
}) {
  const activeType: ProfileType =
    (data?.profileType as ProfileType) ??
    (type as ProfileType) ??
    "professional";
  const t = themes[activeType];
  const isSos = activeType === "sos";
  const [activePost, setActivePost] = useState<ProfilePost | null>(null);
  const [showLocations, setShowLocations] = useState(false);
  const [locations, setLocations] = useState<VisitorLocation[] | null>(null);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [shareStatus, setShareStatus] = useState<
    | { kind: "idle" }
    | { kind: "success" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const shareLocation = () => {
    if (!handle) return;
    if (typeof window === "undefined" || !navigator.geolocation) {
      setShareStatus({ kind: "error", message: "Geolocation not supported on this device." });
      return;
    }
    setSharingLocation(true);
    setShareStatus({ kind: "idle" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        api
          .recordVisitorLocation(handle, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
          .then(() => setShareStatus({ kind: "success" }))
          .catch(() =>
            setShareStatus({ kind: "error", message: "Couldn't share location. Try again." }),
          )
          .finally(() => setSharingLocation(false));
      },
      (err) => {
        setSharingLocation(false);
        setShareStatus({
          kind: "error",
          message:
            err.code === err.PERMISSION_DENIED
              ? "Location permission denied."
              : "Couldn't get your location.",
        });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  useEffect(() => {
    if (!activePost) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActivePost(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [activePost]);




  useEffect(() => {
    if (!showLocations || !handle) return;
    setLoadingLocations(true);
    api
      .listVisitorLocations(handle)
      .then((list) => setLocations(list ?? []))
      .catch(() => setLocations([]))
      .finally(() => setLoadingLocations(false));
  }, [showLocations, handle]);


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
  const avatarSrc = data?.photoUrl || avatarUrl || mockUser.avatar;

  // For professional CTA "View Resume": find a resume link.
  const resumeLink =
    activeType === "professional"
      ? (data?.links ?? []).find(
          (l) => l.icon === "resume" || /resume|cv/i.test(l.label),
        )
      : undefined;

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
        resumeLink?.url ? (
          <a
            href={resumeLink.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "mt-6 block w-full rounded-xl py-3 text-center text-sm font-semibold shadow-md",
              !hasCustom && t.cta,
            )}
            style={ctaStyle}
          >
            {ctaLabel}
          </a>
        ) : (
          <button
            type="button"
            disabled={activeType === "professional"}
            className={cn(
              "mt-6 w-full rounded-xl py-3 text-sm font-semibold shadow-md",
              !hasCustom && t.cta,
              activeType === "professional" && "opacity-60 cursor-not-allowed",
            )}
            style={ctaStyle}
            title={activeType === "professional" ? "Add a Resume link to enable this" : undefined}
          >
            {ctaLabel}
          </button>
        )
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

      {!isSos && posts && posts.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold">Posts</p>
          <div className="grid grid-cols-3 gap-2">
            {posts.slice(0, 6).map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setActivePost(p)}
                className={cn(
                  "group overflow-hidden rounded-lg text-left transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50",
                  !hasCustom && t.card,
                )}
                style={chipStyle}
              >
                <div className="aspect-square w-full bg-black/10">
                  {p.photoUrl ? (
                    <img
                      src={p.photoUrl}
                      alt={p.description}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-4 w-4 opacity-60" />
                    </div>
                  )}
                </div>
                {p.description && (
                  <p className={cn("line-clamp-2 px-1.5 py-1 text-[9px] leading-snug", t.sub)}>
                    {p.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {activePost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActivePost(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white text-neutral-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePost(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {activePost.photoUrl ? (
              <img
                src={activePost.photoUrl}
                alt={activePost.description}
                className="max-h-[65vh] w-full object-contain bg-black"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-neutral-100">
                <ImageIcon className="h-10 w-10 text-neutral-400" />
              </div>
            )}
            {activePost.description && (
              <div className="overflow-y-auto p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {activePost.description}
                </p>
              </div>
            )}
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
          <button
            type="button"
            onClick={shareLocation}
            disabled={sharingLocation || !handle}
            className={cn(
              "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold shadow-md",
              t.cta,
              (sharingLocation || !handle) && "opacity-70 cursor-not-allowed",
            )}
          >
            {sharingLocation ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Sharing…
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" /> Share My Location
              </>
            )}
          </button>
          {shareStatus.kind === "success" && (
            <p className="mt-2 text-center text-xs text-emerald-600">
              Location shared with the profile owner.
            </p>
          )}
          {shareStatus.kind === "error" && (
            <p className="mt-2 text-center text-xs text-red-600">{shareStatus.message}</p>
          )}
          <button
            type="button"
            onClick={() => setShowLocations(true)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            <MapPin className="h-4 w-4" /> View Visitor Locations
          </button>
        </>
      )}

      {showLocations && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowLocations(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white text-neutral-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <p className="text-sm font-semibold">Visitor Locations</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLocations(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-3">
              {loadingLocations ? (
                <p className="p-4 text-center text-sm text-neutral-500">Loading…</p>
              ) : !locations || locations.length === 0 ? (
                <p className="p-4 text-center text-sm text-neutral-500">
                  No visitor locations recorded yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {locations.map((loc) => {
                    const when = loc.visitedAt
                      ? new Date(loc.visitedAt).toLocaleString()
                      : "";
                    const label =
                      loc.address ||
                      [loc.city, loc.country].filter(Boolean).join(", ") ||
                      `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`;
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
                    return (
                      <li key={loc.id}>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-start justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 hover:bg-neutral-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{label}</p>
                            <p className="text-[11px] text-neutral-500">
                              {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                              {when ? ` · ${when}` : ""}
                            </p>
                          </div>
                          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
