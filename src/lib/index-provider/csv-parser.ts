import { IndexDataPoint } from "./types";

const MONTHLY_PERIOD_RE = /^VPIZR-(\d{4})(\d{2})$/;

/**
 * Parses a Statistik Austria VPI CSV string into IndexDataPoint[].
 *
 * CSV format: semicolon-delimited, German decimal commas.
 * We only keep rows where the category column = "VPI-0" (total index)
 * and the period code represents a month (not a yearly average).
 */
export function parseVpiCsv(csvText: string): IndexDataPoint[] {
  const lines = csvText.split("\n");
  const results: IndexDataPoint[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(";");
    if (cols.length < 3) continue;

    const periodCode = cols[0];
    const category = cols[1];
    const rawValue = cols[2];

    if (category !== "VPI-0") continue;

    const match = periodCode.match(MONTHLY_PERIOD_RE);
    if (!match) continue;

    const period = `${match[1]}-${match[2]}`;
    const value = parseFloat(rawValue.replace(",", "."));

    if (isNaN(value)) continue;

    results.push({ period, value });
  }

  return results.sort((a, b) => a.period.localeCompare(b.period));
}
