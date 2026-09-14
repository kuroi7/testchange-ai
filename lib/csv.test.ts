import { describe, expect, it } from "vitest";
import { resultsToCsv, sanitizeSpreadsheetCell } from "./csv";

describe("sanitizeSpreadsheetCell", () => {
  it("prefixes spreadsheet formulas", () => {
    expect(sanitizeSpreadsheetCell("=1+1")).toBe("'=1+1");
    expect(sanitizeSpreadsheetCell("+SUM(A1:A2)")).toBe("'+SUM(A1:A2)");
  });
});

describe("resultsToCsv", () => {
  it("exports analysis results", () => {
    const csv = resultsToCsv([{ id: "TC-1", title: "Coupon", preconditions: "", steps: "", expectedResult: "", impact: "high", reason: "changed", suggestedModification: "update" }]);
    expect(csv).toContain('"TC-1"');
    expect(csv).toContain('"high"');
  });
});
