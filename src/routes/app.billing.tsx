import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/billing")({
  head: () => ({ meta: [{ title: "Billing — TapMe" }] }),
  component: Billing,
});

function Billing() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="text-sm text-muted-foreground">Your plan and payment history.</p>
      <div className="mt-6 rounded-2xl border border-border bg-gradient-card p-6">
        <p className="text-xs uppercase tracking-widest text-primary">Current plan</p>
        <p className="mt-2 text-2xl font-semibold">TapMe Pro</p>
        <p className="text-sm text-muted-foreground">$9 / month · Renews on Aug 5, 2026</p>
        <button className="mt-4 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent">
          Manage subscription
        </button>
      </div>
    </div>
  );
}
