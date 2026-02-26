import Link from "next/link";
import { notFound } from "next/navigation";
import { getCaseFile } from "@/app/actions/case-files";
import { getIndexLabel } from "@/lib/index-provider";
import { contractDateToPeriod, formatDateAT } from "@/lib/calculation";
import { CaseCalculation } from "./case-calculation";
import { DeleteCaseButton } from "./delete-case-button";
import { Button } from "@/components/ui/button";

export default async function CaseFileDetailPage({
  params,
}: {
  params: Promise<{ id: string; caseId: string }>;
}) {
  const { id, caseId } = await params;
  const caseFile = await getCaseFile(caseId);
  if (!caseFile || caseFile.customerId !== id) return notFound();

  const effectiveIndexKey =
    caseFile.indexKey ?? caseFile.customer.defaultIndexKey;
  const basePeriod = contractDateToPeriod(caseFile.contractDate);

  return (
    <div>
      <Link
        href={`/customers/${id}`}
        className="text-sm text-muted hover:text-foreground mb-1 inline-block"
      >
        ← Zurück zu {caseFile.customer.name}
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{caseFile.title}</h1>
          <p className="text-sm text-muted mt-1">
            Vertrag:{" "}
            {formatDateAT(caseFile.contractDate)} ·
            Anfangswert: €{" "}
            {caseFile.initialValue.toLocaleString("de-AT", {
              minimumFractionDigits: 2,
            })}{" "}
            · Index: {getIndexLabel(effectiveIndexKey)} · Basisperiode:{" "}
            {basePeriod}
          </p>
          {caseFile.notes && (
            <p className="text-sm mt-2 text-muted">{caseFile.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/${id}/cases/${caseId}/edit`}>
            <Button variant="secondary" size="sm">
              Bearbeiten
            </Button>
          </Link>
          <DeleteCaseButton caseId={caseId} customerId={id} />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="text-lg font-semibold mb-4">Indexanpassung berechnen</h2>
        <CaseCalculation
          initialValue={caseFile.initialValue}
          indexKey={effectiveIndexKey}
          basePeriod={basePeriod}
        />
      </div>
    </div>
  );
}
