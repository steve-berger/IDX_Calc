import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomer } from "@/app/actions/customers";
import { CaseFileForm } from "@/components/case-file-form";

export default async function NewCaseFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) return notFound();

  return (
    <div>
      <Link
        href={`/customers/${id}`}
        className="text-sm text-muted hover:text-foreground mb-1 inline-block"
      >
        ← Zurück zu {customer.name}
      </Link>
      <h1 className="text-2xl font-bold mb-6">Neuer Vertrag</h1>
      <CaseFileForm
        customerId={id}
        defaultIndexKey={customer.defaultIndexKey}
      />
    </div>
  );
}
