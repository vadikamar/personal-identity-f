import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Loader2, LogOut, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { api } from "@/lib/api";
import { clearCredentials, getUsername, isSignedIn } from "@/lib/session";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Dashboard — TapMe" }] }),
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const [username, setUsernameState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isSignedIn()) {
      navigate({ to: "/auth", search: { redirect: pathname } });
      return;
    }
    setUsernameState(getUsername());
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await api.signOut().catch(() => undefined);
    } finally {
      clearCredentials();
      navigate({ to: "/auth" });
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search…"
              className="w-full rounded-lg border border-border bg-card py-1.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
            />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {username && (
              <span className="hidden rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground md:inline">
                tapme.in/<span className="text-foreground">{username}</span>
              </span>
            )}
            <button className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
            <button
              onClick={signOut}
              disabled={signingOut}
              aria-label="Sign out"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-60"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
