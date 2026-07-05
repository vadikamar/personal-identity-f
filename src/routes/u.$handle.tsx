import {
  createFileRoute,
  Navigate,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/u/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.handle} — TapMe` },
      { name: "description", content: `Connect with @${params.handle} on TapMe.` },
    ],
  }),
  component: HandleRoute,
});

function HandleRoute() {
  const matches = useMatches();
  // If a child route (e.g. /u/$handle/$type) is active, just render it.
  const hasChild = matches.some((m) => m.routeId !== "/u/$handle" && m.routeId.startsWith("/u/$handle"));
  if (hasChild) return <Outlet />;
  return <HandleRedirect />;
}

function HandleRedirect() {
  const { handle } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-profile", handle],
    queryFn: () => api.getProfileByUsername(handle),
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (data) {
    return (
      <Navigate
        to="/u/$handle/$type"
        params={{ handle, type: data.profileType }}
        replace
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 text-center">
      <div>
        <p className="text-lg font-semibold">No active profile</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isError
            ? "Couldn't load this profile."
            : "This user hasn't activated a profile yet."}
        </p>
      </div>
    </div>
  );
}
