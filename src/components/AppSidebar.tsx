import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  User,
  BarChart3,
  CreditCard,
  Settings,
  Receipt,
  Sparkles,
  X,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { user } from "@/lib/mock";

const items = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/profiles", label: "My Profiles", icon: User },
  { to: "/app/requests", label: "Access Requests", icon: Inbox },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/cards", label: "NFC Cards", icon: CreditCard },
  { to: "/app/settings", label: "Settings", icon: Settings },
  { to: "/app/billing", label: "Billing", icon: Receipt },
];

export function AppSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">TAPME</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((it) => {
            const active = isActive(it.to, it.exact);
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <img src={user.avatar} alt="" className="h-9 w-9 rounded-full" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">vadik@example.com</p>
          </div>
        </div>
      </aside>
    </>
  );
}
