import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Inbox, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";
import { PROFILE_TYPE_LABEL, type Profile, type ProfileType } from "@/lib/types";

export const Route = createFileRoute("/app/requests")({
  head: () => ({ meta: [{ title: "Access Requests — TapMe" }] }),
  component: RequestsPage,
});

function RequestsPage() {
  const qc = useQueryClient();
  const {
    data: requests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["access-requests"],
    queryFn: api.listPendingAccessRequests,
  });

  // Fetch profiles so we can resolve requested profile details.
  const { data: allProfiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: api.listProfiles,
  });
  const profileMap = new Map<string, Profile>();
  (allProfiles ?? []).forEach((p) => profileMap.set(p.id, p));

  const approve = useMutation({
    mutationFn: (id: string) => api.approveAccessRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["access-requests"] });
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
  const reject = useMutation({
    mutationFn: (id: string) => api.rejectAccessRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["access-requests"] }),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Access Requests</h1>
        <p className="text-sm text-muted-foreground">
          People asking to view your other profiles. Approve to grant them
          access.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          Couldn't load access requests. Try again in a moment.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center text-sm text-muted-foreground">
            <Inbox className="h-6 w-6" />
            <p>No pending requests.</p>
          </div>
        ) : (
          requests.map((r, i) => {
            const target = profileMap.get(r.requestedProfileId);
            const busyApprove = approve.isPending && approve.variables === r.id;
            const busyReject = reject.isPending && reject.variables === r.id;
            return (
              <div
                key={r.id}
                className={
                  "flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 " +
                  (i > 0 ? "border-t border-border" : "")
                }
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    @{r.requesterUsername}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    Wants access to{" "}
                    <span className="text-foreground">
                      {target?.displayName ??
                        PROFILE_TYPE_LABEL[
                          target?.profileType as ProfileType
                        ] ??
                        "your profile"}
                    </span>
                    {target?.profileType && (
                      <> · {PROFILE_TYPE_LABEL[target.profileType]}</>
                    )}
                  </p>
                  {r.message && (
                    <p className="mt-1 line-clamp-3 rounded-md bg-accent/40 px-2 py-1 text-xs text-muted-foreground">
                      "{r.message}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => approve.mutate(r.id)}
                    disabled={busyApprove || busyReject}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-60 sm:flex-none"
                  >
                    {busyApprove ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => reject.mutate(r.id)}
                    disabled={busyApprove || busyReject}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-60 sm:flex-none"
                  >
                    {busyReject ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
