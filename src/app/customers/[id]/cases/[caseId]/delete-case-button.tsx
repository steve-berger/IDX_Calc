"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCaseFile } from "@/app/actions/case-files";
import { Button } from "@/components/ui/button";

export function DeleteCaseButton({
  caseId,
  customerId,
}: {
  caseId: string;
  customerId: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteCaseFile(caseId, customerId);
    router.push(`/customers/${customerId}`);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
          {loading ? "Lösche…" : "Bestätigen"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Abbruch
        </Button>
      </div>
    );
  }

  return (
    <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
      Löschen
    </Button>
  );
}
