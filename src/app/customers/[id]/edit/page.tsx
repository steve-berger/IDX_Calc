import { notFound } from "next/navigation";
import { getCustomer } from "@/app/actions/customers";
import { CustomerForm } from "@/components/customer-form";
import Link from "next/link";

export default async function EditCustomerPage({
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
        ← Zurück
      </Link>
      <h1 className="text-2xl font-bold mb-6">Kunde bearbeiten</h1>
      <CustomerForm customer={customer} />
    </div>
  );
}
