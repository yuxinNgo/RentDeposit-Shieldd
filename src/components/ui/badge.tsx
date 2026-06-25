import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]",
        className,
      )}
      {...props}
    />
  );
}
