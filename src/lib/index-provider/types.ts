export interface IndexDataPoint {
  period: string; // "YYYY-MM"
  value: number;
}

export interface IndexDataProvider {
  getIndexSeries(indexKey: string): Promise<IndexDataPoint[]>;
  getIndexValue(indexKey: string, period: string): Promise<number | null>;
  getLatestPeriod(indexKey: string): Promise<string | null>;
  getSupportedIndices(): string[];
}

export const INDEX_LABELS: Record<string, string> = {
  VPI_2020: "VPI 2020 (Basis 2020=100)",
  VPI_2015: "VPI 2015 (Basis 2015=100)",
  VPI_2010: "VPI 2010 (Basis 2010=100)",
  VPI_2005: "VPI 2005 (Basis 2005=100)",
  VPI_2000: "VPI 2000 (Basis 2000=100)",
};

export function getIndexLabel(key: string): string {
  return INDEX_LABELS[key] ?? key;
}
