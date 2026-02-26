import { IndexDataProvider } from "./types";
import { MockIndexProvider } from "./mock-provider";
import { DbIndexProvider } from "./db-provider";

export type { IndexDataProvider, IndexDataPoint } from "./types";
export { INDEX_LABELS, getIndexLabel } from "./types";

const providerType = process.env.INDEX_PROVIDER ?? "db";

let _provider: IndexDataProvider | null = null;

export function getIndexProvider(): IndexDataProvider {
  if (!_provider) {
    _provider =
      providerType === "mock" ? new MockIndexProvider() : new DbIndexProvider();
  }
  return _provider;
}
