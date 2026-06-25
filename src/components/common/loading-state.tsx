export function LoadingState({ label = "Loading workspace..." }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-[var(--radius-xl)] border border-dashed border-[var(--border-strong)] bg-white/60 p-8 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-3 border-[rgba(63,111,231,0.2)] border-t-[var(--blue)]" />
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}
