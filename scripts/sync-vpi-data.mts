import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { VPI_CSV_URLS } from "../src/lib/index-provider/csv-urls.ts";
import { parseVpiCsv } from "../src/lib/index-provider/csv-parser.ts";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function syncIndex(indexKey: string, csvUrl: string): Promise<number> {
  console.log(`  Fetching ${indexKey} from ${csvUrl}...`);
  const res = await fetch(csvUrl);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${csvUrl}`);
  }

  const csvText = await res.text();
  const dataPoints = parseVpiCsv(csvText);
  console.log(`  Parsed ${dataPoints.length} monthly data points`);

  if (dataPoints.length === 0) {
    throw new Error(`No data points parsed from ${indexKey}`);
  }

  let upserted = 0;
  for (const dp of dataPoints) {
    await prisma.vpiDataPoint.upsert({
      where: {
        indexKey_period: { indexKey, period: dp.period },
      },
      update: { value: dp.value },
      create: { indexKey, period: dp.period, value: dp.value },
    });
    upserted++;
  }

  await prisma.vpiSyncLog.create({
    data: { indexKey, rowCount: upserted, success: true },
  });

  return upserted;
}

async function main() {
  console.log("Starting VPI data sync from Statistik Austria OGD...\n");

  const entries = Object.entries(VPI_CSV_URLS);
  let totalRows = 0;

  for (const [indexKey, csvUrl] of entries) {
    try {
      const count = await syncIndex(indexKey, csvUrl);
      totalRows += count;
      console.log(`  ✓ ${indexKey}: ${count} rows synced\n`);
    } catch (err) {
      console.error(`  ✗ ${indexKey}: ${err}\n`);
      await prisma.vpiSyncLog.create({
        data: { indexKey, rowCount: 0, success: false },
      });
    }
  }

  console.log(`Sync complete. Total: ${totalRows} data points across ${entries.length} indices.`);
}

main()
  .catch((e) => {
    console.error("Sync failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
