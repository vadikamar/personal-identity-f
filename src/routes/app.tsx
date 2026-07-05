import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { getUsername, isValidUsername, setUsername } from "@/lib/session";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Dashboard — TapMe" }] }),
  component: AppLayout,
});

function AppLayout() {
  const [username, setUsernameState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUsernameState(getUsername());
    setHydrated(true);
  }, []);

  if (hydrated && !username) {
    return <UsernameOnboarding onDone={(u) => setUsernameState(u)} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search profiles, cards, links…"
              className="w-full rounded-lg border border-border bg-card py-1.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
            />
          </div>
          <div className="flex items-center gap-3">
            {username && (
              <span className="hidden rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground sm:inline">
                tapme.in/<span className="text-foreground">{username}</span>
              </span>
            )}
            <button className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function UsernameOnboarding({ onDone }: { onDone: (u: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const v = value.trim().toLowerCase();
    if (!isValidUsername(v)) {
      setError("3–24 chars, lowercase letters, numbers, . _ -");
      return;
    }
    onDone(setUsername(v));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <h1 className="text-2xl font-semibold tracking-tight">Pick your handle</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is your permanent public URL. You can't change it later.
        </p>
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <span className="text-sm text-muted-foreground">tapme.in/</span>
          <input
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="yourhandle"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button
          onClick={submit}
          className="mt-6 w-full rounded-lg bg-gradient-primary py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
        >
          Lock in handle
        </button>
      </div>
    </div>
  );
}
