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

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Profiles</h1>
          <p className="text-sm text-muted-foreground">
            Only one profile can be active at a time.
            {username && (
              <>
                {" "}Public URL:{" "}
                <Link
                  to="/u/$handle"
                  params={{ handle: username }}
                  className="text-primary underline underline-offset-2"
                >
                  tapme.in/{username}
                </Link>
              </>
            )}
          </p>
        </div>
        <Link
          to="/app/create"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
        >
          <Plus className="h-4 w-4" /> New Profile
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          Couldn't reach backend. Ensure Spring Boot is running on port 8081.
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
            return (
              <ProfileRow
                key={p.id}
                p={p}
                Icon={Icon}
                first={i === 0}
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
  onActivate,
  onDeactivate,
  onDelete,
}: {
  p: Profile;
  Icon: React.ComponentType<{ className?: string }>;
  first: boolean;
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
      {p.active ? (
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
