import { IndexDataProvider, IndexDataPoint } from "./types";
import { MOCK_INDEX_DATA } from "./mock-data";

export class MockIndexProvider implements IndexDataProvider {
  getSupportedIndices(): string[] {
    return Object.keys(MOCK_INDEX_DATA);
  }

  async getIndexSeries(indexKey: string): Promise<IndexDataPoint[]> {
    const data = MOCK_INDEX_DATA[indexKey];
    if (!data) return [];
    return [...data].sort((a, b) => a.period.localeCompare(b.period));
  }

  async getIndexValue(
    indexKey: string,
    period: string
  ): Promise<number | null> {
    const data = MOCK_INDEX_DATA[indexKey];
    if (!data) return null;

    const exact = data.find((d) => d.period === period);
    if (exact) return exact.value;

    // Interpolate: find closest earlier period
    const sorted = [...data].sort((a, b) =>
      a.period.localeCompare(b.period)
    );
    const earlier = sorted.filter((d) => d.period <= period);
    if (earlier.length === 0) return null;
    return earlier[earlier.length - 1].value;
  }

  async getLatestPeriod(indexKey: string): Promise<string | null> {
    const data = MOCK_INDEX_DATA[indexKey];
    if (!data || data.length === 0) return null;
    const sorted = [...data].sort((a, b) =>
      b.period.localeCompare(a.period)
    );
    return sorted[0].period;
  }
}
