import { describe, it, expect } from "vitest";
import {
  calculateIndexAdjustment,
  contractDateToPeriod,
} from "../calculation";

describe("calculateIndexAdjustment", () => {
  it("calculates correctly when index increases", () => {
    const result = calculateIndexAdjustment({
      initialValue: 1000,
      baseIndex: 100,
      currentIndex: 110,
    });
    expect(result.newValue).toBe(1100);
    expect(result.absoluteChange).toBe(100);
    expect(result.percentageChange).toBe(10);
    expect(result.factor).toBeCloseTo(1.1);
  });

  it("calculates correctly when index decreases", () => {
    const result = calculateIndexAdjustment({
      initialValue: 1000,
      baseIndex: 110,
      currentIndex: 100,
    });
    // pct = round((100/110 - 1) * 100, 1) = -9.1%
    // newValue = 1000 × 0.909 = 909.00
    expect(result.newValue).toBe(909);
    expect(result.absoluteChange).toBe(-91);
    expect(result.percentageChange).toBe(-9.1);
  });

  it("returns same value when indices are equal", () => {
    const result = calculateIndexAdjustment({
      initialValue: 2500,
      baseIndex: 100,
      currentIndex: 100,
    });
    expect(result.newValue).toBe(2500);
    expect(result.absoluteChange).toBe(0);
    expect(result.percentageChange).toBe(0);
  });

  it("uses realistic VPI values", () => {
    const result = calculateIndexAdjustment({
      initialValue: 2500,
      baseIndex: 100.0,
      currentIndex: 116.8,
    });
    expect(result.newValue).toBe(2920);
    expect(result.absoluteChange).toBe(420);
    expect(result.percentageChange).toBe(16.8);
  });

  it("respects custom decimal places for monetary values", () => {
    const result = calculateIndexAdjustment({
      initialValue: 1000,
      baseIndex: 100,
      currentIndex: 113.456,
      decimals: 4,
    });
    // pct always rounded to 1dp: round(13.456, 1) = 13.5%
    // newValue = 1000 × 1.135 = 1135.0000
    expect(result.percentageChange).toBe(13.5);
    expect(result.newValue).toBe(1135);
  });

  it("throws on zero base index", () => {
    expect(() =>
      calculateIndexAdjustment({
        initialValue: 1000,
        baseIndex: 0,
        currentIndex: 110,
      })
    ).toThrow("Basisindex muss größer als 0 sein");
  });

  it("throws on negative base index", () => {
    expect(() =>
      calculateIndexAdjustment({
        initialValue: 1000,
        baseIndex: -5,
        currentIndex: 110,
      })
    ).toThrow("Basisindex muss größer als 0 sein");
  });

  it("throws on negative initial value", () => {
    expect(() =>
      calculateIndexAdjustment({
        initialValue: -100,
        baseIndex: 100,
        currentIndex: 110,
      })
    ).toThrow("Anfangswert darf nicht negativ sein");
  });

  it("handles zero initial value", () => {
    const result = calculateIndexAdjustment({
      initialValue: 0,
      baseIndex: 100,
      currentIndex: 120,
    });
    expect(result.newValue).toBe(0);
    expect(result.absoluteChange).toBe(0);
  });

  it("applies kaufmännisches Runden — rounds .005 up, not down", () => {
    // 46.505 must round to 46.51, not 46.50 (IEEE 754 trap: 46.505*100 = 4650.4999...)
    const result = calculateIndexAdjustment({
      initialValue: 46.505,
      baseIndex: 100,
      currentIndex: 100,
    });
    expect(result.newValue).toBe(46.51);
  });

  it("applies kaufmännisches Runden on negative changes (rounds away from zero)", () => {
    const result = calculateIndexAdjustment({
      initialValue: 1000,
      baseIndex: 110,
      currentIndex: 100,
    });
    expect(result.absoluteChange).toBe(-91);
    expect(result.percentageChange).toBe(-9.1);
  });

  it("matches Statistik Austria Wertsicherungsrechner", () => {
    // Real case: VPI 2015, Jan 2020 (107.6) → Dec 2025 (140.4), €35.64
    // Statistik Austria result: 30.5% change, €46.51
    const result = calculateIndexAdjustment({
      initialValue: 35.64,
      baseIndex: 107.6,
      currentIndex: 140.4,
    });
    expect(result.percentageChange).toBe(30.5);
    expect(result.newValue).toBe(46.51);
    expect(result.absoluteChange).toBe(10.87);
  });
});

describe("contractDateToPeriod", () => {
  it("converts date to YYYY-MM format", () => {
    expect(contractDateToPeriod(new Date("2020-03-15"))).toBe("2020-03");
  });

  it("converts string date to YYYY-MM format", () => {
    expect(contractDateToPeriod("2021-07-01")).toBe("2021-07");
  });

  it("pads single-digit months", () => {
    expect(contractDateToPeriod(new Date("2019-01-10"))).toBe("2019-01");
  });

  it("handles end of year", () => {
    expect(contractDateToPeriod("2023-12-31")).toBe("2023-12");
  });
});
