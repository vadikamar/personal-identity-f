import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PhoneFrame({
  children,
  className,
  screenClassName,
}: {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
}) {
  return (
    <div className={cn("phone-frame w-full max-w-[320px] shrink-0", className)}>
      <div className={cn("phone-screen bg-white text-neutral-900", screenClassName)}>
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-medium opacity-70">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span className="h-1.5 w-3 rounded-sm bg-current" />
            <span className="h-1.5 w-4 rounded-sm border border-current" />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
