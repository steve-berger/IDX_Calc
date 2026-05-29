import { prisma } from "@/lib/db";
import { IndexDataProvider, IndexDataPoint } from "./types";
import { VPI_CSV_URLS } from "./csv-urls";
import { parseVpiCsv } from "./csv-parser";

const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

export class DbIndexProvider implements IndexDataProvider {
  private readonly refreshingKeys = new Set<string>();
  getSupportedIndices(): string[] {
    return Object.keys(VPI_CSV_URLS);
  }

  async getIndexSeries(indexKey: string): Promise<IndexDataPoint[]> {
    this.triggerRefreshIfStale(indexKey);

    const rows = await prisma.vpiDataPoint.findMany({
      where: { indexKey },
      orderBy: { period: "asc" },
      select: { period: true, value: true },
    });

    return rows;
  }

  async getIndexValue(
    indexKey: string,
    period: string
  ): Promise<number | null> {
    this.triggerRefreshIfStale(indexKey);

    const exact = await prisma.vpiDataPoint.findUnique({
      where: { indexKey_period: { indexKey, period } },
    });
    if (exact) return exact.value;

    const earlier = await prisma.vpiDataPoint.findFirst({
      where: { indexKey, period: { lte: period } },
      orderBy: { period: "desc" },
    });
    return earlier?.value ?? null;
  }

  async getLatestPeriod(indexKey: string): Promise<string | null> {
    this.triggerRefreshIfStale(indexKey);

    const latest = await prisma.vpiDataPoint.findFirst({
      where: { indexKey },
      orderBy: { period: "desc" },
    });
    return latest?.period ?? null;
  }

  /**
   * Fire-and-forget background refresh. Checks the last sync time and
   * re-fetches from Statistik Austria if data is older than 24 hours.
   * Serves stale data immediately — the user never waits.
   * A per-key lock prevents duplicate concurrent fetches.
   */
  private triggerRefreshIfStale(indexKey: string): void {
    if (this.refreshingKeys.has(indexKey)) return;
    void this.refreshIfStale(indexKey);
  }

  private async refreshIfStale(indexKey: string): Promise<void> {
    this.refreshingKeys.add(indexKey);
    try {
      const lastSync = await prisma.vpiSyncLog.findFirst({
        where: { indexKey, success: true },
        orderBy: { syncedAt: "desc" },
      });

      if (lastSync && Date.now() - lastSync.syncedAt.getTime() < STALE_AFTER_MS) {
        return;
      }

      const csvUrl = VPI_CSV_URLS[indexKey];
      if (!csvUrl) return;

      console.log(`[DbIndexProvider] Background refresh for ${indexKey}...`);
      const res = await fetch(csvUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const csvText = await res.text();
      const dataPoints = parseVpiCsv(csvText);

      for (const dp of dataPoints) {
        await prisma.vpiDataPoint.upsert({
          where: { indexKey_period: { indexKey, period: dp.period } },
          update: { value: dp.value },
          create: { indexKey, period: dp.period, value: dp.value },
        });
      }

      await prisma.vpiSyncLog.create({
        data: { indexKey, rowCount: dataPoints.length, success: true },
      });

      console.log(`[DbIndexProvider] Refreshed ${indexKey}: ${dataPoints.length} rows`);
    } catch (err) {
      console.warn(`[DbIndexProvider] Background refresh failed for ${indexKey}:`, err);
    } finally {
      this.refreshingKeys.delete(indexKey);
    }
  }
}
