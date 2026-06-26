"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-shell flex min-h-screen flex-col items-center justify-center py-12 text-center">
      <h2 className="text-3xl font-semibold text-[var(--text-primary)]">Something broke in the workspace</h2>
      <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
        The app caught this with its global error boundary. Reset the route to recover the local workspace state.
      </p>
      <div className="mt-6">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
