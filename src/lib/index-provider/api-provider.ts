import { IndexDataProvider, IndexDataPoint } from "./types";
import { MockIndexProvider } from "./mock-provider";

/**
 * API-based index provider that attempts to fetch from Statistik Austria
 * Open Government Data. Falls back to MockIndexProvider on failure.
 *
 * TODO: Replace ENDPOINT_URL with the actual Statistik Austria OGD API endpoint
 * once the correct URL is confirmed. Current candidates:
 * - https://data.statistik.gv.at/web/meta.jsp?dataset=OGD_vpi20_VPI_2020
 * - STATcube API: https://statcube.at/statistik.at/ext/statcube/jsf/dataCatalogueExplorer.xhtml
 */
const ENDPOINT_BASE =
  process.env.INDEX_API_BASE_URL ??
  "https://data.statistik.gv.at/web/meta.jsp";

const fallback = new MockIndexProvider();

export class ApiIndexProvider implements IndexDataProvider {
  getSupportedIndices(): string[] {
    return ["VPI_2020", "VPI_2015", "VPI_2010"];
  }

  async getIndexSeries(indexKey: string): Promise<IndexDataPoint[]> {
    try {
      const url = `${ENDPOINT_BASE}?dataset=OGD_${indexKey.toLowerCase()}&format=json`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      // TODO: Map the actual API response structure to IndexDataPoint[]
      // The exact shape depends on the Statistik Austria API format
      return this.parseApiResponse(json, indexKey);
    } catch {
      console.warn(
        `[ApiIndexProvider] Failed to fetch ${indexKey}, using fallback`
      );
      return fallback.getIndexSeries(indexKey);
    }
  }

  async getIndexValue(
    indexKey: string,
    period: string
  ): Promise<number | null> {
    const series = await this.getIndexSeries(indexKey);
    const exact = series.find((d) => d.period === period);
    if (exact) return exact.value;

    const earlier = series.filter((d) => d.period <= period);
    if (earlier.length === 0) return null;
    return earlier[earlier.length - 1].value;
  }

  async getLatestPeriod(indexKey: string): Promise<string | null> {
    const series = await this.getIndexSeries(indexKey);
    if (series.length === 0) return null;
    return series[series.length - 1].period;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseApiResponse(_json: any, _indexKey: string): IndexDataPoint[] {
    // TODO: Implement actual parsing once the API response format is known.
    // For now, this will always throw, triggering the fallback.
    throw new Error("API response parsing not yet implemented");
  }
}
