"use client";

import { useCallback, useRef, useState } from "react";

interface DateInputProps {
  label?: string;
  name: string;
  required?: boolean;
  defaultValue?: string; // "YYYY-MM-DD"
  error?: string;
}

function parseDefault(iso: string | undefined) {
  if (!iso) return { day: "", month: "", year: "" };
  const [y, m, d] = iso.split("-");
  return { day: d ?? "", month: m ?? "", year: y ?? "" };
}

export function DateInput({
  label,
  name,
  required,
  defaultValue,
  error,
}: DateInputProps) {
  const initial = parseDefault(defaultValue);
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const isoValue =
    year && month && day
      ? `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      : "";

  const inputClass = `rounded-lg border border-border bg-white px-2 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${
    error ? "border-danger" : ""
  }`;

  const handleDay = useCallback((val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 2);
    setDay(clean);
    if (clean.length === 2) monthRef.current?.focus();
  }, []);

  const handleMonth = useCallback((val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 2);
    setMonth(clean);
    if (clean.length === 2) yearRef.current?.focus();
  }, []);

  const handleYear = useCallback((val: string) => {
    setYear(val.replace(/\D/g, "").slice(0, 4));
  }, []);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium">{label}</label>
      )}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          inputMode="numeric"
          placeholder="TT"
          value={day}
          onChange={(e) => handleDay(e.target.value)}
          className={`${inputClass} w-12`}
          maxLength={2}
          aria-label="Tag"
        />
        <span className="text-muted text-sm">.</span>
        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          placeholder="MM"
          value={month}
          onChange={(e) => handleMonth(e.target.value)}
          className={`${inputClass} w-12`}
          maxLength={2}
          aria-label="Monat"
        />
        <span className="text-muted text-sm">.</span>
        <input
          ref={yearRef}
          type="text"
          inputMode="numeric"
          placeholder="JJJJ"
          value={year}
          onChange={(e) => handleYear(e.target.value)}
          className={`${inputClass} w-20`}
          maxLength={4}
          aria-label="Jahr"
        />
      </div>
      <input
        type="hidden"
        name={name}
        value={isoValue}
        required={required}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
