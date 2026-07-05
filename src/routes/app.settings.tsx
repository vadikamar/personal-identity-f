import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getUsername } from "@/lib/session";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — TapMe" }] }),
  component: Settings,
});

function Settings() {
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => setUsername(getUsername()), []);

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

        {[
          { label: "Display name", value: "Vadik Amar" },
          { label: "Email", value: "vadik@example.com" },
        ].map((f) => (
          <div key={f.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{f.label}</p>
            <input defaultValue={f.value} className="input mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
