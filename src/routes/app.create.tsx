import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, HandMetal, Users, Heart, LifeBuoy, Plus, X, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ProfileView } from "@/components/ProfileView";
import { api } from "@/lib/api";
import type { Link as ProfileLink, Profile, ProfileRequest, ProfileType } from "@/lib/types";
import { PROFILE_TYPES, PROFILE_TYPE_LABEL } from "@/lib/types";
import { PROFILE_FIELDS } from "@/lib/profileFields";
import { getUsername } from "@/lib/session";
import { avatarKeyById, avatarKeyByHandle, avatarKeyByHandleType, fileToDataUrl, getAvatar, setAvatar } from "@/lib/avatars";

type Search = { edit?: string };

export const Route = createFileRoute("/app/create")({
  head: () => ({ meta: [{ title: "Create Profile — TapMe" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    edit: typeof s.edit === "string" ? s.edit : undefined,
  }),
  component: Create,
});

const typeIcons: Record<ProfileType, React.ComponentType<{ className?: string }>> = {
  professional: Briefcase,
  "just-met": HandMetal,
  friends: Users,
  personal: Heart,
  sos: LifeBuoy,
};

const themeSwatches = [
  "oklch(0.68 0.19 295)",
  "oklch(0.72 0.16 240)",
  "oklch(0.72 0.17 155)",
  "oklch(0.78 0.14 15)",
  "oklch(0.62 0.24 25)",
];

function Create() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { edit: editId } = Route.useSearch();
  const isEdit = !!editId;

  const [username, setUsernameState] = useState<string | null>(null);
  useEffect(() => setUsernameState(getUsername()), []);

  // Load existing profile if editing
  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ["profile", editId],
    queryFn: async () => {
      const list = await api.listProfiles();
      return list.find((p) => p.id === editId) ?? null;
    },
    enabled: isEdit,
  });

  const [type, setType] = useState<ProfileType>("professional");
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [interestsText, setInterestsText] = useState("");
  const [theme, setTheme] = useState(themeSwatches[0]);
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [activateNow, setActivateNow] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const spec = PROFILE_FIELDS[type];

  // Hydrate form when editing profile loads
  useEffect(() => {
    if (!isEdit || !existing || hydrated) return;
    setType(existing.profileType);
    setDisplayName(existing.displayName ?? "");
    setHeadline(existing.headline ?? "");
    setBio(existing.bio ?? "");
    setInterestsText((existing.interests ?? []).join(", "));
    if (existing.theme) setTheme(existing.theme);
    setLinks(existing.links ?? []);
    setActivateNow(existing.active);
    const savedAvatar = getAvatar(
      avatarKeyById(existing.id),
      avatarKeyByHandleType(existing.userName, existing.profileType),
      avatarKeyByHandle(existing.userName),
    );
    if (savedAvatar) setAvatarDataUrl(savedAvatar);
    if (existing.photoUrl) setExistingPhotoUrl(existing.photoUrl);
    setHydrated(true);
  }, [isEdit, existing, hydrated]);

  // Reset link scaffolding when type changes (skip during initial edit hydration)
  useEffect(() => {
    if (isEdit && !hydrated) return;
    setLinks((prev) => {
      // preserve if user already filled links matching count
      if (prev.length > 0 && isEdit) return prev;
      return spec.suggestedLinks.map((s) => ({ label: s.label, icon: s.icon, url: "" }));
    });
    if (!spec.bioLabel) setBio("");
    if (!spec.interestsLabel) setInterestsText("");
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useMutation({
    mutationFn: async (body: ProfileRequest) => {
      const saved =
        isEdit && editId
          ? await api.updateProfile(editId, body)
          : await api.createProfile(body);
      if (avatarFile && saved?.id) {
        try {
          const withPhoto = await api.uploadProfilePhoto(saved.id, avatarFile);
          return withPhoto;
        } catch (err) {
          console.error("Photo upload failed", err);
          alert("Profile saved, but photo upload failed. You can retry from Edit.");
          return saved;
        }
      }
      return saved;
    },
    onSuccess: (saved) => {
      if (avatarDataUrl && saved?.id) {
        setAvatar(
          avatarDataUrl,
          avatarKeyById(saved.id),
          avatarKeyByHandleType(saved.userName, saved.profileType),
          avatarKeyByHandle(saved.userName),
        );
      }
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["profile", saved?.id] });
      qc.invalidateQueries({ queryKey: ["public-profile", saved?.userName] });
      navigate({ to: "/app" });
    },
  });

  const preview: Profile = useMemo(
    () => ({
      id: "preview",
      profileType: type,
      userName: username ?? "you",
      displayName: displayName || "Your Name",
      headline: spec.showHeadline ? headline : undefined,
      bio: spec.bioLabel ? bio : undefined,
      theme,
      photoUrl: !avatarDataUrl && existingPhotoUrl ? existingPhotoUrl : undefined,
      active: false,
      interests: spec.interestsLabel
        ? interestsText.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      links: links.filter((l) => l.url.trim() !== ""),
    }),
    [type, username, displayName, headline, bio, theme, interestsText, links, spec, avatarDataUrl, existingPhotoUrl],
  );

  const onPickAvatar = async (file: File | null | undefined) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image must be under 3MB.");
      return;
    }
    const url = await fileToDataUrl(file);
    setAvatarDataUrl(url);
    setAvatarFile(file);
  };

  const submit = () => {
    if (!username) return;
    if (!displayName.trim()) {
      alert("Please enter a profile name.");
      return;
    }
    save.mutate({
      displayName: displayName.trim(),
      profileType: type,
      userName: username,
      headline: preview.headline,
      bio: preview.bio,
      theme,
      active: activateNow,
      interests: preview.interests,
      links: preview.links,
    });
  };

  if (isEdit && loadingExisting) {
    return <div className="mx-auto max-w-6xl px-6 py-12 text-sm text-muted-foreground">Loading profile…</div>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold tracking-tight">
          {isEdit ? "Edit Profile" : "Create Profile"}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Handle: <span className="text-foreground">tapme.in/{username ?? "…"}</span>
        </p>

        <label className="mt-6 block text-xs font-medium text-muted-foreground">Profile Type</label>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {PROFILE_TYPES.map((k) => {
            const Icon = typeIcons[k];
            return (
              <button
                key={k}
                onClick={() => setType(k)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-[11px]",
                  type === k
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className="h-4 w-4" />
                {PROFILE_TYPE_LABEL[k]}
              </button>
            );
          })}
        </div>

        <Field label="Profile Photo">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              {avatarDataUrl || existingPhotoUrl ? (
                <img src={avatarDataUrl ?? existingPhotoUrl ?? ""} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                  No photo
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickAvatar(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent"
            >
              <Upload className="h-3.5 w-3.5" />
              {avatarDataUrl || existingPhotoUrl ? "Change photo" : "Upload photo"}
            </button>
            {(avatarDataUrl || avatarFile) && (
              <button
                type="button"
                onClick={() => {
                  setAvatarDataUrl(null);
                  setAvatarFile(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Photo is uploaded to the server after saving and shown on your public profile.
          </p>
        </Field>



        <Field label="Profile Name">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Work Profile"
            className="input"
          />
        </Field>

        {spec.showHeadline && (
          <Field label="Headline">
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Backend Engineer"
              className="input"
            />
          </Field>
        )}

        {spec.bioLabel && (
          <Field label={spec.bioLabel}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="input"
            />
          </Field>
        )}

        {spec.interestsLabel && (
          <Field label={spec.interestsLabel}>
            <input
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
              placeholder="Java, Spring Boot, AWS"
              className="input"
            />
          </Field>
        )}

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Links</label>
            <button
              onClick={() =>
                setLinks((ls) => [...ls, { label: "New link", icon: "email", url: "" }])
              }
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <Plus className="h-3 w-3" /> Add link
            </button>
          </div>
          <div className="space-y-2">
            {links.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={l.label}
                  onChange={(e) => updateLink(i, { label: e.target.value })}
                  className="input w-1/3"
                  placeholder="Label"
                />
                <input
                  value={l.url}
                  onChange={(e) => updateLink(i, { url: e.target.value })}
                  className="input flex-1"
                  placeholder={spec.suggestedLinks[i]?.placeholder ?? "https://…"}
                />
                <button
                  onClick={() => setLinks((ls) => ls.filter((_, idx) => idx !== i))}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <Field label="Theme">
          <div className="mt-1 flex gap-2">
            {themeSwatches.map((c) => (
              <button
                key={c}
                onClick={() => setTheme(c)}
                style={{ background: c }}
                className={cn(
                  "h-7 w-7 rounded-full ring-2 transition-all",
                  theme === c ? "ring-primary" : "ring-border",
                )}
              />
            ))}
          </div>
        </Field>

        <label className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={activateNow}
            onChange={(e) => setActivateNow(e.target.checked)}
          />
          Activate this profile now (deactivates any other active one)
        </label>

        {save.error && (
          <p className="mt-3 text-xs text-red-400">
            Save failed — the backend may be waking up. Please retry in a moment.
          </p>
        )}

        <div className="mt-8 flex justify-end gap-2">
          <button
            onClick={() => navigate({ to: "/app" })}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={save.isPending || !username}
            className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {save.isPending ? "Saving…" : isEdit ? "Update Profile" : "Save Profile"}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Live preview</p>
        <PhoneFrame>
          <ProfileView data={preview} avatarUrl={avatarDataUrl} />
        </PhoneFrame>
      </div>
    </div>
  );

  function updateLink(i: number, patch: Partial<ProfileLink>) {
    setLinks((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
