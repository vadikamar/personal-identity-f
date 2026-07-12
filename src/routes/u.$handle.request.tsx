import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Check,
  HandMetal,
  Heart,
  LifeBuoy,
  Loader2,
  Lock,
  Send,
  Users,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { PROFILE_TYPE_LABEL, type Profile, type ProfileType } from "@/lib/types";
import { getUsername, isSignedIn } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/$handle/request")({
  head: ({ params }) => ({
    meta: [{ title: `Request access — @${params.handle}` }],
  }),
  component: RequestAccessPage,
});

const iconFor: Record<ProfileType, React.ComponentType<{ className?: string }>> = {
  professional: Briefcase,
  "just-met": HandMetal,
  friends: Users,
  personal: Heart,
  sos: LifeBuoy,
};

const tints: Record<ProfileType, string> = {
  professional: "bg-violet-500/15 text-violet-600",
  "just-met": "bg-sky-500/15 text-sky-600",
  friends: "bg-emerald-500/15 text-emerald-600",
  personal: "bg-pink-500/15 text-pink-600",
  sos: "bg-red-500/15 text-red-600",
};

function RequestAccessPage() {
  const { handle } = Route.useParams();
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);
  const [me, setMe] = useState<string | null>(null);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn()) {
      navigate({
        to: "/auth",
        search: { redirect: `/u/${handle}/request` },
      });
      return;
    }
    setMe(getUsername());
    setHydrated(true);
  }, [handle, navigate]);

  const { data: profiles, isLoading, error: loadErr } = useQuery({
    queryKey: ["profiles"],
    queryFn: api.listProfiles,
    enabled: hydrated,
  });

  const ownerProfiles = (profiles ?? []).filter((p) => p.userName === handle);
  const submitReq = useMutation({
    mutationFn: (p: Profile) =>
      api.requestProfileAccess(p.id, {
        requestedProfileId: p.id,
        message: message.trim() || undefined,
      }),
    onSuccess: (_r, p) => setSubmitted(p.id),
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(
          err.status === 409
            ? "You already have access or a pending request for this profile."
            : "Couldn't send request. Try again.",
        );
      } else {
        setError("Couldn't send request. Try again.");
      }
    },
  });

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (me === handle) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero px-4 text-center">
        <div>
          <p className="text-lg font-semibold">That's you</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You already have access to all your profiles.
          </p>
          <Link
            to="/app"
            className="mt-4 inline-block text-sm text-primary underline"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero px-4 py-6 sm:py-10">
      <div className="mx-auto flex max-w-lg items-center justify-between pb-4 text-xs text-muted-foreground">
        <Link
          to="/u/$handle"
          params={{ handle }}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to profile
        </Link>
        <span className="hidden sm:inline">tapme.in/{handle}</span>
      </div>

      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            Request access to @{handle}'s profiles
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Pick one profile to request. Once approved, it becomes the default
            profile shown to you when visiting @{handle}.
          </p>
        </div>

        {loadErr && (
          <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-500">
            Couldn't load profiles. Try again.
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading profiles…
          </div>
        ) : ownerProfiles.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No profiles found for @{handle}.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ownerProfiles.map((p) => {
              const Icon = iconFor[p.profileType] ?? Briefcase;
              const isSelected = selected?.id === p.id;
              const isDone = submitted === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (submitted) return;
                    setError(null);
                    setSelected(p);
                  }}
                  disabled={!!submitted && !isDone}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                      : "border-border hover:bg-accent/50",
                    submitted && !isDone && "opacity-50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      tints[p.profileType],
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {PROFILE_TYPE_LABEL[p.profileType]}
                    </p>
                  </div>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                      <Check className="h-3 w-3" /> Sent
                    </span>
                  ) : p.authorizedViewerUsernames?.includes(me ?? "") ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                      <Check className="h-3 w-3" /> Access
                    </span>
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selected && !submitted && (
          <div className="mt-5 space-y-3">
            <label className="block text-xs font-medium text-muted-foreground">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder={`Hi @${handle}, could I see your ${
                PROFILE_TYPE_LABEL[selected.profileType]
              } profile?`}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-sm outline-none focus:border-primary/60"
            />
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            <button
              type="button"
              disabled={submitReq.isPending}
              onClick={() => submitReq.mutate(selected)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {submitReq.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send request
            </button>
          </div>
        )}

        {submitted && (
          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-600">
            Request sent! You'll be notified when @{handle} approves it.
            <div className="mt-2">
              <Link
                to="/u/$handle"
                params={{ handle }}
                className="text-xs underline"
              >
                Back to @{handle}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
