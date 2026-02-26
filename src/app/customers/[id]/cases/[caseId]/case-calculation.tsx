"use client";

import { useCallback, useEffect, useState } from "react";
import { calculateIndexAdjustment } from "@/lib/calculation";
import { getIndexLabel } from "@/lib/index-provider/types";
import { Select } from "@/components/ui/select";

interface CaseCalculationProps {
  initialValue: number;
  indexKey: string;
  basePeriod: string;
}

interface IndexState {
  baseValue: number | null;
  currentValue: number | null;
  latestPeriod: string | null;
  earliestPeriod: string | null;
  selectedPeriod: string;
  availablePeriods: { value: string; label: string }[];
  loading: boolean;
  error: string | null;
}

export function CaseCalculation({
  initialValue,
  indexKey,
  basePeriod,
}: CaseCalculationProps) {
  const [state, setState] = useState<IndexState>({
    baseValue: null,
    currentValue: null,
    latestPeriod: null,
    earliestPeriod: null,
    selectedPeriod: "",
    availablePeriods: [],
    loading: true,
    error: null,
  });

  const fetchIndexData = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const seriesRes = await fetch(
        `/api/index-data?indexKey=${encodeURIComponent(indexKey)}`
      );
      if (!seriesRes.ok) throw new Error("Indexdaten konnten nicht geladen werden");
      const seriesData = await seriesRes.json();

      const series: { period: string; value: number }[] = seriesData.series ?? [];
      const latestPeriod: string | null = seriesData.latestPeriod ?? null;

      const baseEntry = series.find((s: { period: string }) => s.period === basePeriod);
      let baseValue = baseEntry?.value ?? null;

      if (!baseValue && series.length > 0) {
        const earlier = series.filter((s: { period: string }) => s.period <= basePeriod);
        if (earlier.length > 0) {
          baseValue = earlier[earlier.length - 1].value;
        }
      }

      const earliestPeriod = series.length > 0 ? series[0].period : null;
      const targetPeriod = latestPeriod ?? "";
      const currentEntry = series.find((s: { period: string }) => s.period === targetPeriod);
      const currentValue = currentEntry?.value ?? null;

      const availablePeriods = series.map((s: { period: string }) => ({
        value: s.period,
        label: formatPeriodLabel(s.period),
      }));

      setState({
        baseValue,
        currentValue,
        latestPeriod,
        earliestPeriod,
        selectedPeriod: targetPeriod,
        availablePeriods,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Unbekannter Fehler",
      }));
    }
  }, [indexKey, basePeriod]);

  useEffect(() => {
    fetchIndexData();
  }, [fetchIndexData]);

  const handlePeriodChange = useCallback(
    async (period: string) => {
      setState((s) => ({ ...s, selectedPeriod: period, loading: true }));
      try {
        const res = await fetch(
          `/api/index-data?indexKey=${encodeURIComponent(indexKey)}&period=${encodeURIComponent(period)}`
        );
        if (!res.ok) throw new Error("Indexwert konnte nicht geladen werden");
        const data = await res.json();
        setState((s) => ({
          ...s,
          currentValue: data.value ?? null,
          loading: false,
        }));
      } catch {
        setState((s) => ({ ...s, loading: false }));
      }
    },
    [indexKey]
  );

  if (state.loading && state.baseValue === null) {
    return (
      <div className="flex items-center gap-2 text-muted py-8">
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        Indexdaten werden geladen…
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-lg">
        {state.error}
      </div>
    );
  }

  const canCalculate =
    state.baseValue !== null &&
    state.baseValue > 0 &&
    state.currentValue !== null;

  const result = canCalculate
    ? calculateIndexAdjustment({
        initialValue,
        baseIndex: state.baseValue!,
        currentIndex: state.currentValue!,
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs text-muted uppercase tracking-wide mb-1">
            Basisperiode
          </div>
          <div className="font-semibold">{formatPeriodLabel(basePeriod)}</div>
          <div className="text-sm text-muted mt-1">
            {getIndexLabel(indexKey)}:{" "}
            {state.baseValue !== null ? (
              <span className="font-mono">{state.baseValue}</span>
            ) : (
              <span className="text-danger">nicht verfügbar</span>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs text-muted uppercase tracking-wide mb-1">
            Aktuelle Periode
          </div>
          {state.availablePeriods.length > 0 ? (
            <Select
              options={[...state.availablePeriods].reverse()}
              value={state.selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
            />
          ) : (
            <div className="text-muted text-sm">Keine Perioden verfügbar</div>
          )}
          <div className="text-sm text-muted mt-1">
            {getIndexLabel(indexKey)}:{" "}
            {state.currentValue !== null ? (
              <span className="font-mono">{state.currentValue}</span>
            ) : (
              <span className="text-danger">nicht verfügbar</span>
            )}
            {state.loading && (
              <span className="ml-2 inline-block w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            )}
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
            Ergebnis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-muted mb-1">Neuer Wert</div>
              <div className="text-2xl font-bold">
                € {result.newValue.toLocaleString("de-AT", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Absolute Änderung</div>
              <div
                className={`text-2xl font-bold ${
                  result.absoluteChange >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {result.absoluteChange >= 0 ? "+" : ""}€{" "}
                {result.absoluteChange.toLocaleString("de-AT", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Prozentuale Änderung</div>
              <div
                className={`text-2xl font-bold ${
                  result.percentageChange >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {result.percentageChange >= 0 ? "+" : ""}
                {result.percentageChange.toLocaleString("de-AT", {
                  minimumFractionDigits: 2,
                })}
                %
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted font-mono">
            Veränderung: ({state.currentValue} / {state.baseValue} − 1) × 100 ={" "}
            {result.percentageChange.toLocaleString("de-AT", { minimumFractionDigits: 1 })}%
            <br />
            Neuer Wert: €{" "}
            {initialValue.toLocaleString("de-AT", { minimumFractionDigits: 2 })} × (1 +{" "}
            {result.percentageChange.toLocaleString("de-AT", { minimumFractionDigits: 1 })}%) = €{" "}
            {result.newValue.toLocaleString("de-AT", { minimumFractionDigits: 2 })}
          </div>
        </div>
      )}

      {!canCalculate && !state.loading && (
        <div className="bg-yellow-50 text-yellow-800 text-sm px-4 py-3 rounded-lg space-y-1">
          {state.baseValue === null && state.earliestPeriod && basePeriod < state.earliestPeriod ? (
            <>
              <p className="font-semibold">
                Basisperiode {formatPeriodLabel(basePeriod)} liegt vor dem verfügbaren Datenbereich.
              </p>
              <p>
                {getIndexLabel(indexKey)} enthält Daten ab{" "}
                <span className="font-semibold">{formatPeriodLabel(state.earliestPeriod)}</span>.
                Bitte wählen Sie einen Index mit längerem Datenbereich
                (z.B. VPI 2015 oder VPI 2010) oder passen Sie das Vertragsdatum an.
              </p>
            </>
          ) : (
            <p>
              Berechnung nicht möglich: Basisindex oder aktueller Index nicht
              verfügbar für den gewählten Zeitraum.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function formatPeriodLabel(period: string): string {
  const [year, month] = period.split("-");
  const months = [
    "Jänner", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}
