import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomer } from "@/app/actions/customers";
import { getIndexLabel } from "@/lib/index-provider";
import { Button } from "@/components/ui/button";
import { DeleteCustomerButton } from "./delete-button";
import { CaseFileList } from "./case-file-list";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) return notFound();

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/customers"
            className="text-sm text-muted hover:text-foreground mb-1 inline-block"
          >
            ← Zurück zur Kundenliste
          </Link>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <div className="text-sm text-muted mt-1">
            <span>Standard-Index: {getIndexLabel(customer.defaultIndexKey)}</span>
          </div>
          {customer.notes && (
            <p className="text-sm mt-2 text-muted">{customer.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/${id}/edit`}>
            <Button variant="secondary" size="sm">
              Bearbeiten
            </Button>
          </Link>
          <DeleteCustomerButton customerId={id} />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Verträge ({customer.caseFiles.length})
          </h2>
          <Link href={`/customers/${id}/cases/new`}>
            <Button size="sm">+ Neuer Vertrag</Button>
          </Link>
        </div>

        <CaseFileList
          caseFiles={customer.caseFiles}
          customerId={id}
          defaultIndexKey={customer.defaultIndexKey}
        />
      </div>
    </div>
  );
}
