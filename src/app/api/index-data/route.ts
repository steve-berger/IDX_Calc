import { NextRequest, NextResponse } from "next/server";
import { getIndexProvider } from "@/lib/index-provider";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const indexKey = searchParams.get("indexKey");
  const period = searchParams.get("period");

  if (!indexKey) {
    return NextResponse.json(
      { error: "indexKey parameter is required" },
      { status: 400 }
    );
  }

  const provider = getIndexProvider();

  try {
    if (period) {
      const value = await provider.getIndexValue(indexKey, period);
      const latestPeriod = await provider.getLatestPeriod(indexKey);
      return NextResponse.json({ indexKey, period, value, latestPeriod });
    }

    const series = await provider.getIndexSeries(indexKey);
    const latestPeriod = await provider.getLatestPeriod(indexKey);
    return NextResponse.json({ indexKey, series, latestPeriod });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch index data" },
      { status: 500 }
    );
  }
}
