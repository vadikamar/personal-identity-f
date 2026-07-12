import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { isSignedIn, isValidUsername, setCredentials } from "@/lib/session";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — TapMe" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.search as { redirect?: string } });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn()) navigate({ to: search?.redirect || "/app" });
  }, [navigate, search]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const u = username.trim().toLowerCase();
    if (!isValidUsername(u)) {
      setError("Username: 3–24 chars, lowercase letters, numbers, . _ -");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await api.signUp(u, password);
      } else {
        // Preflight credentials via a lightweight authenticated call
        setCredentials(u, password);
        // Verify by calling an authenticated endpoint
        try {
          await api.listProfiles();
        } catch (err) {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            throw new ApiError(err.status, "Invalid username or password");
          }
          throw err;
        }
      }
      setCredentials(u, password);
      navigate({ to: search?.redirect || "/app" });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 409
            ? "Username already exists"
            : err.status === 401
              ? "Invalid username or password"
              : err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      setError(msg);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">TAPME</span>
        </Link>
        <div className="mb-6 flex gap-1 rounded-lg border border-border bg-background p-1 text-sm">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={
                "flex-1 rounded-md py-1.5 transition-colors " +
                (mode === m
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to manage your profiles and NFC cards."
            : "Pick a permanent handle — this becomes your public URL."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Username</label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <span className="text-sm text-muted-foreground">tapme.in/</span>
              <input
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourhandle"
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Password</label>
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary py-2.5 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-70"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "signin" ? "New to TapMe? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
