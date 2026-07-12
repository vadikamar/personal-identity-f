import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MoreVertical,
  Plus,
  Briefcase,
  HandMetal,
  Users,
  Heart,
  LifeBuoy,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Profile, ProfileType } from "@/lib/types";
import { PROFILE_TYPE_LABEL } from "@/lib/types";
import { getUsername } from "@/lib/session";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — TapMe" }] }),
  component: Dashboard,
});

const icons = {
  professional: Briefcase,
  "just-met": HandMetal,
  friends: Users,
  personal: Heart,
  sos: LifeBuoy,
} as const;

const tints: Record<ProfileType, string> = {
  professional: "bg-violet-500/15 text-violet-300",
  "just-met": "bg-sky-500/15 text-sky-300",
  friends: "bg-emerald-500/15 text-emerald-300",
  personal: "bg-pink-500/15 text-pink-300",
  sos: "bg-red-500/15 text-red-300",
};

function Dashboard() {
  const [username, setUsernameState] = useState<string | null>(null);
  useEffect(() => setUsernameState(getUsername()), []);

  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: api.listProfiles,
  });

  const activate = useMutation({
    mutationFn: (id: string) => api.activateProfile(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
  const deactivate = useMutation({
    mutationFn: (id: string) => api.deactivateProfile(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.deleteProfile(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });

  const mine = (data ?? []).filter((p) => !username || p.userName === username);

  const publicUrl = username ? `${typeof window !== "undefined" ? window.location.origin : ""}/u/${username}` : "";
  const qrSrc = publicUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(publicUrl)}`
    : "";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">My Profiles</h1>
          <p className="text-sm text-muted-foreground">
            Only one profile can be active at a time.
            {username && (
              <>
                {" "}Public URL:{" "}
                <Link
                  to="/u/$handle"
                  params={{ handle: username }}
                  className="break-all text-primary underline underline-offset-2"
                >
                  tapme.in/{username}
                </Link>
              </>
            )}
          </p>
        </div>
        <Link
          to="/app/create"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow sm:w-auto"
        >
          <Plus className="h-4 w-4" /> New Profile
        </Link>
      </div>

      {username && (
        <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
          <div className="rounded-xl bg-white p-2">
            <img src={qrSrc} alt="Your profile QR code" className="h-32 w-32" />
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-medium">Your unique QR code</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Scan to open your active profile at{" "}
              <span className="break-all text-foreground">{publicUrl}</span>
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <a
                href={qrSrc}
                download={`tapme-${username}-qr.png`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent"
              >
                Download PNG
              </a>
              <button
                onClick={() => navigator.clipboard?.writeText(publicUrl)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          Couldn't reach backend at personal-identity.onrender.com. It may be waking up — retry in a few seconds.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : mine.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No profiles yet. Create your first one.
          </div>
        ) : (
          mine.map((p, i) => {
            const Icon = icons[p.profileType] ?? Briefcase;
            const busy =
              (activate.isPending && activate.variables === p.id) ||
              (deactivate.isPending && deactivate.variables === p.id);
            return (
              <ProfileRow
                key={p.id}
                p={p}
                Icon={Icon}
                first={i === 0}
                busy={busy}
                onActivate={() => activate.mutate(p.id)}
                onDeactivate={() => deactivate.mutate(p.id)}
                onDelete={() => {
                  if (confirm(`Delete "${p.displayName}"?`)) del.mutate(p.id);
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function ProfileRow({
  p,
  Icon,
  first,
  busy,
  onActivate,
  onDeactivate,
  onDelete,
}: {
  p: Profile;
  Icon: React.ComponentType<{ className?: string }>;
  first: boolean;
  busy: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("flex items-center gap-4 px-5 py-4", !first && "border-t border-border")}>
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", tints[p.profileType])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{p.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {PROFILE_TYPE_LABEL[p.profileType]} · {p.headline || "—"}
        </p>
      </div>
      {busy ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
          {p.active ? "Deactivating…" : "Activating…"}
        </span>
      ) : p.active ? (
        <button
          onClick={onDeactivate}
          className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25"
        >
          Active
        </button>
      ) : (
        <button
          onClick={onActivate}
          className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Activate
        </button>
      )}
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {open && (
          <div
            onMouseLeave={() => setOpen(false)}
            className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          >
            <Link
              to="/app/create"
              search={{ edit: p.id }}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              disabled={p.active}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-accent disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
