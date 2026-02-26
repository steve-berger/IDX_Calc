"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCaseFile, updateCaseFile } from "@/app/actions/case-files";
import { INDEX_LABELS } from "@/lib/index-provider/types";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CaseFileFormProps {
  customerId: string;
  defaultIndexKey: string;
  caseFile?: {
    id: string;
    title: string;
    contractDate: Date;
    initialValue: number;
    indexKey: string | null;
    notes: string | null;
  };
}

const indexOptions = [
  { value: "", label: "— Standard des Kunden verwenden —" },
  ...Object.entries(INDEX_LABELS).map(([value, label]) => ({ value, label })),
];

export function CaseFileForm({
  customerId,
  defaultIndexKey,
  caseFile,
}: CaseFileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!caseFile;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = isEdit
      ? await updateCaseFile(caseFile.id, customerId, formData)
      : await createCaseFile(customerId, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/customers/${customerId}`);
    router.refresh();
  }

  const contractDateStr = caseFile
    ? new Date(caseFile.contractDate).toISOString().split("T")[0]
    : "";

  return (
    <form action={handleSubmit} className="space-y-4 max-w-lg">
      {error && (
        <div className="bg-danger/10 text-danger text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <Input
        id="title"
        name="title"
        label="Titel / Bezeichnung *"
        required
        defaultValue={caseFile?.title}
        placeholder="z.B. Vertrag A"
      />

      <DateInput
        name="contractDate"
        label="Vertragsabschlussdatum *"
        required
        defaultValue={contractDateStr}
      />

      <Input
        id="initialValue"
        name="initialValue"
        label="Anfangswert (€) *"
        type="number"
        step="0.01"
        min="0"
        required
        defaultValue={caseFile?.initialValue?.toString()}
        placeholder="z.B. 2500.00"
      />

      <Select
        id="indexKey"
        name="indexKey"
        label={`Index (Standard: ${INDEX_LABELS[defaultIndexKey] ?? defaultIndexKey})`}
        options={indexOptions}
        defaultValue={caseFile?.indexKey ?? ""}
      />

      <Textarea
        id="notes"
        name="notes"
        label="Notizen"
        defaultValue={caseFile?.notes ?? ""}
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
