/**
 * Mapping of internal index keys to Statistik Austria OGD CSV download URLs.
 * All datasets are CC BY 4.0 licensed and updated monthly.
 * Source: https://data.statistik.gv.at/web/catalog.jsp
 *
 * When Statistik Austria publishes VPI_2025, add it here AND to INDEX_LABELS in types.ts.
 */
export const VPI_CSV_URLS: Record<string, string> = {
  VPI_2000: "https://data.statistik.gv.at/data/OGD_vpi00_VPI_2000_1.csv",
  VPI_2005: "https://data.statistik.gv.at/data/OGD_vpi05_VPI_2005_1.csv",
  VPI_2010: "https://data.statistik.gv.at/data/OGD_vpi10_VPI_2010_1.csv",
  VPI_2015: "https://data.statistik.gv.at/data/OGD_vpi15_VPI_2015_1.csv",
  VPI_2020: "https://data.statistik.gv.at/data/OGD_vpi20_VPI_2020_1.csv",
  // VPI_2025: URL not yet available (returns 404 as of early 2026)
};
