import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { PROFILE_TYPE_LABEL } from "@/lib/types";
import { getUsername } from "@/lib/session";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/app/profiles")({
  head: () => ({ meta: [{ title: "My Profiles — TapMe" }] }),
  component: Profiles,
});

function Profiles() {
  const [username, setUsernameState] = useState<string | null>(null);
  useEffect(() => setUsernameState(getUsername()), []);

  const { data, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: api.listProfiles,
  });

  const mine = (data ?? []).filter((p) => !username || p.userName === username);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Profiles</h1>
        <Link
          to="/app/create"
          className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
        >
          New Profile
        </Link>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : mine.length === 0 ? (
        <p className="text-sm text-muted-foreground">No profiles yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map((p) => (
            <Link
              key={p.id}
              to="/u/$handle/$type"
              params={{ handle: p.userName, type: p.profileType }}
              className="group rounded-2xl border border-border bg-gradient-card p-5 transition-colors hover:border-primary/60"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold">{p.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {PROFILE_TYPE_LABEL[p.profileType]}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px]",
                    p.active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {p.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {p.headline || p.bio || "No description"}
              </p>
              <div className="mt-4 text-xs text-primary">Preview →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
