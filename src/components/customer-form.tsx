"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCustomer, updateCustomer } from "@/app/actions/customers";
import { INDEX_LABELS } from "@/lib/index-provider/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CustomerFormProps {
  customer?: {
    id: string;
    name: string;
    defaultIndexKey: string;
    notes: string | null;
  };
}

const indexOptions = Object.entries(INDEX_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!customer;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = isEdit
      ? await updateCustomer(customer.id, formData)
      : await createCustomer(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(isEdit ? `/customers/${customer.id}` : "/customers");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-lg">
      {error && (
        <div className="bg-danger/10 text-danger text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <Input
        id="name"
        name="name"
        label="Name *"
        required
        defaultValue={customer?.name}
        placeholder="z.B. Müller GmbH"
      />

      <Select
        id="defaultIndexKey"
        name="defaultIndexKey"
        label="Standard-Index *"
        options={indexOptions}
        defaultValue={customer?.defaultIndexKey ?? "VPI_2020"}
      />

      <Textarea
        id="notes"
        name="notes"
        label="Notizen"
        defaultValue={customer?.notes ?? ""}
        placeholder="Optionale Anmerkungen…"
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Speichern…" : isEdit ? "Aktualisieren" : "Anlegen"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
