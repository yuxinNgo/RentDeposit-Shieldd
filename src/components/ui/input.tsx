import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-0 placeholder:text-[var(--text-muted)] focus:border-[var(--blue)]",
        className,
      )}
      {...props}
    />
  );
}
