import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/cards")({
  head: () => ({ meta: [{ title: "NFC Cards — TapMe" }] }),
  component: Cards,
});

function Cards() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["cards"], queryFn: api.listCards });

  const [label, setLabel] = useState("");
  const create = useMutation({
    mutationFn: () =>
      api.createCard({ cardLabel: label || "New Card", status: "active", active: true }),
    onSuccess: () => {
      setLabel("");
      qc.invalidateQueries({ queryKey: ["cards"] });
    },
  });
  const deactivate = useMutation({
    mutationFn: (id: string) => api.deactivateCard(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.deleteCard(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">NFC Cards</h1>
      <p className="text-sm text-muted-foreground">
        Register and manage the physical cards linked to your profiles.
      </p>

      <div className="mt-6 flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Card label (e.g. Office Card)"
          className="input flex-1"
        />
        <button
          onClick={() => create.mutate()}
          className="inline-flex items-center gap-1 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
        >
          <Plus className="h-4 w-4" /> Add Card
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (data ?? []).length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">No cards yet.</div>
        ) : (
          (data ?? []).map((c, i) => (
            <div
              key={c.id}
              className={cn("flex items-center gap-4 px-5 py-4", i > 0 && "border-t border-border")}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.cardLabel}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">{c.cardId}</p>
              </div>
              {c.active ? (
                <button
                  onClick={() => deactivate.mutate(c.id)}
                  className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300"
                >
                  Active
                </button>
              ) : (
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  Inactive
                </span>
              )}
              <button
                onClick={() => {
                  if (confirm(`Delete "${c.cardLabel}"?`)) del.mutate(c.id);
                }}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
