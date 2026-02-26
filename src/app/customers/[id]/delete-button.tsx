"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCustomer } from "@/app/actions/customers";
import { Button } from "@/components/ui/button";

export function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteCustomer(customerId);
    router.push("/customers");
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
