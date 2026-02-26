import Link from "next/link";
import { getCustomers } from "@/app/actions/customers";
import { getIndexLabel } from "@/lib/index-provider";
import { CustomerSearch } from "./customer-search";
import { Button } from "@/components/ui/button";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const { customers, total, totalPages } = await getCustomers(q, page);

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/customers${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kunden</h1>
        <Link href="/customers/new">
          <Button>+ Neuer Kunde</Button>
        </Link>
      </div>

      <CustomerSearch initialQuery={q ?? ""} />

      {customers.length === 0 ? (
        <div className="text-center py-12 text-muted">
          {q ? (
            <p>Keine Kunden gefunden für &quot;{q}&quot;</p>
          ) : (
            <p>Noch keine Kunden angelegt.</p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {customers.map((customer) => (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="block bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{customer.name}</h2>
                    <p className="text-sm text-muted mt-0.5">
                      {getIndexLabel(customer.defaultIndexKey)} ·{" "}
                      {customer._count.caseFiles} Verträge
                      {customer._count.caseFiles !== 1 ? "n" : ""}
                    </p>
                  </div>
                  <span className="text-muted text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted">
                {total} Kunden · Seite {page} von {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Link href={pageHref(page - 1)}>
                    <Button variant="secondary" size="sm">← Zurück</Button>
                  </Link>
                ) : (
                  <Button variant="secondary" size="sm" disabled>← Zurück</Button>
                )}
                {page < totalPages ? (
                  <Link href={pageHref(page + 1)}>
                    <Button variant="secondary" size="sm">Weiter →</Button>
                  </Link>
                ) : (
                  <Button variant="secondary" size="sm" disabled>Weiter →</Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
