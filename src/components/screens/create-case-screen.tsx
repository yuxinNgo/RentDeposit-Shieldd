import { CreateCaseForm } from "@/components/cases/create-case-form";
import { Card } from "@/components/ui/card";

export function CreateCaseScreen() {
  return (
    <div className="space-y-6">
      <Card className="hero-mesh">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Landlord intake</p>
        <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Create a new escrow case inside Next.js</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          This form posts directly to `app/api/cases` and persists into Neon Postgres so you can test the full product flow without a separate backend.
        </p>
      </Card>
      <CreateCaseForm />
    </div>
  );
}
