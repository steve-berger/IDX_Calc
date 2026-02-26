import Link from "next/link";
import { getIndexLabel } from "@/lib/index-provider";
import { formatDateAT } from "@/lib/calculation";

interface CaseFileListProps {
  caseFiles: {
    id: string;
    title: string;
    contractDate: Date;
    initialValue: number;
    indexKey: string | null;
    notes: string | null;
    createdAt: Date;
  }[];
  customerId: string;
  defaultIndexKey: string;
}

export function CaseFileList({
  caseFiles,
  customerId,
  defaultIndexKey,
}: CaseFileListProps) {
  if (caseFiles.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">
        Noch keine Verträge für diesen Kunden.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {caseFiles.map((cf) => (
        <Link
          key={cf.id}
          href={`/customers/${customerId}/cases/${cf.id}`}
          className="block bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{cf.title}</h3>
              <p className="text-sm text-muted mt-0.5">
                Vertrag:{" "}
                {formatDateAT(cf.contractDate)} ·
                Anfangswert: €{" "}
                {cf.initialValue.toLocaleString("de-AT", {
                  minimumFractionDigits: 2,
                })}{" "}
                · {getIndexLabel(cf.indexKey ?? defaultIndexKey)}
              </p>
              {cf.notes && (
                <p className="text-xs text-muted mt-1">{cf.notes}</p>
              )}
            </div>
            <span className="text-muted text-sm">→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
