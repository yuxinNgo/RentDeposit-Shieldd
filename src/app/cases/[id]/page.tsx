import { AppShell } from "@/components/layout/app-shell";
import { CaseDetailScreen } from "@/components/screens/case-detail-screen";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <CaseDetailScreen caseId={id} />
    </AppShell>
  );
}
