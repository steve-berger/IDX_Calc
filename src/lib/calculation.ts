export interface IndexCalculationInput {
  initialValue: number;
  baseIndex: number;
  currentIndex: number;
  decimals?: number;
}

export interface IndexCalculationResult {
  newValue: number;
  absoluteChange: number;
  percentageChange: number;
  factor: number;
}

export function calculateIndexAdjustment(
  input: IndexCalculationInput
): IndexCalculationResult {
  const { initialValue, baseIndex, currentIndex, decimals = 2 } = input;

  if (baseIndex <= 0) {
    throw new Error("Basisindex muss größer als 0 sein");
  }
  if (initialValue < 0) {
    throw new Error("Anfangswert darf nicht negativ sein");
  }

  const factor = currentIndex / baseIndex;
  // Match Statistik Austria methodology: round percentage to 1 decimal first,
  // then derive the monetary values from the rounded percentage.
  const percentageChange = round((factor - 1) * 100, 1);
  const adjustedFactor = 1 + percentageChange / 100;
  const newValue = round(initialValue * adjustedFactor, decimals);
  const absoluteChange = round(newValue - initialValue, decimals);

  return { newValue, absoluteChange, percentageChange, factor };
}

/**
 * Kaufmännisches Runden (DIN 1333): rounds half away from zero.
 * Uses exponential notation to avoid floating-point multiplication artifacts
 * (e.g. 46.505 * 100 = 4650.4999... in IEEE 754).
 */
function round(value: number, decimals: number): number {
  if (value < 0) {
    return -round(-value, decimals);
  }
  return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
}

export function formatDateAT(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function contractDateToPeriod(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
