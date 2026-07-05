import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — TapMe" }] }),
  component: Analytics,
});

function Analytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: api.analyticsOverview,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
      <p className="text-sm text-muted-foreground">Aggregate reach across your profiles and cards.</p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          Couldn't load analytics. Is the backend running?
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Stat label="Total Profiles" value={data?.totalProfiles} loading={isLoading} />
        <Stat label="Active Profiles" value={data?.activeProfiles} loading={isLoading} />
        <Stat label="Total Cards" value={data?.totalCards} loading={isLoading} />
        <Stat label="Active Cards" value={data?.activeCards} loading={isLoading} />
        <Stat label="Unique Visitors" value={data?.uniqueVisitors} loading={isLoading} />
        <Stat label="Link Clicks" value={data?.linkClicks} loading={isLoading} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">Top Links</p>
        <div className="mt-3 space-y-2">
          {(data?.topLinks ?? []).map((l) => (
            <div key={l.label} className="flex items-center justify-between text-sm">
              <span className="truncate text-muted-foreground">{l.label}</span>
              <span className="font-medium">{l.clicks}</span>
            </div>
          ))}
          {!isLoading && (data?.topLinks ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  loading,
}: {
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {loading ? "…" : (value ?? 0).toLocaleString()}
      </p>
    </div>
  );
}
