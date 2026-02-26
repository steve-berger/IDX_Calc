"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

export function CustomerSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      startTransition(() => {
        const params = new URLSearchParams();
        if (value) {
          params.set("q", value);
        }
        const qs = params.toString();
        router.push(`/customers${qs ? `?${qs}` : ""}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="mb-4 relative">
      <Input
        type="search"
        placeholder="Kunden suchen…"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
