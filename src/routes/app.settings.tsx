import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { clearCredentials, getUsername, setCredentials } from "@/lib/session";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — TapMe" }] }),
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  useEffect(() => setUsername(getUsername()), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!username) return;
    if (newPassword.length < 6) {
      setMsg({ tone: "err", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirm) {
      setMsg({ tone: "err", text: "Passwords do not match." });
      return;
    }
    setBusy(true);
    try {
      await api.updatePassword(username, currentPassword, newPassword);
      setCredentials(username, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setMsg({ tone: "ok", text: "Password updated successfully." });
    } catch (err) {
      const text =
        err instanceof ApiError && err.status === 401
          ? "Current password is incorrect."
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      setMsg({ tone: "err", text });
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      await api.signOut().catch(() => undefined);
    } finally {
      clearCredentials();
      navigate({ to: "/auth" });
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Handle (permanent)</p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              locked
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <span className="text-sm text-muted-foreground">tapme.in/</span>
            <input
              value={username ?? ""}
              readOnly
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Your handle can't be changed once set.
          </p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Change password</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs text-muted-foreground">Current password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">New password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Confirm new password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
              />
            </label>
          </div>
          {msg && (
            <p
              className={
                "mt-3 rounded-lg px-3 py-2 text-xs " +
                (msg.tone === "ok"
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border border-red-500/30 bg-red-500/10 text-red-300")
              }
            >
              {msg.text}
            </p>
          )}
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-60"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sign out
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-70"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
