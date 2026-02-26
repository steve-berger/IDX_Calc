import { notFound } from "next/navigation";
import Link from "next/link";
import { getCaseFile } from "@/app/actions/case-files";
import { CaseFileForm } from "@/components/case-file-form";

export default async function EditCaseFilePage({
  params,
}: {
  params: Promise<{ id: string; caseId: string }>;
}) {
  const { id, caseId } = await params;
  const caseFile = await getCaseFile(caseId);
  if (!caseFile || caseFile.customerId !== id) return notFound();

  return (
    <div>
      <Link
        href={`/customers/${id}/cases/${caseId}`}
        className="text-sm text-muted hover:text-foreground mb-1 inline-block"
      >
        ← Zurück
      </Link>
      <h1 className="text-2xl font-bold mb-6">Vertrag bearbeiten</h1>
      <CaseFileForm
        customerId={id}
        defaultIndexKey={caseFile.customer.defaultIndexKey}
        caseFile={caseFile}
      />
    </div>
  );
}
