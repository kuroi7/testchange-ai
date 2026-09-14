import type { AnalysisResult } from "./types";

export function sanitizeSpreadsheetCell(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function quote(value: string): string {
  const safe = sanitizeSpreadsheetCell(value);
  return `"${safe.replaceAll('"', '""')}"`;
}

export function resultsToCsv(results: AnalysisResult[]): string {
  const header = [
    "ID",
    "Title",
    "Preconditions",
    "Steps",
    "Expected Result",
    "Impact",
    "Reason",
    "Suggested Modification",
  ];

  const rows = results.map((result) => [
    result.id,
    result.title,
    result.preconditions,
    result.steps,
    result.expectedResult,
    result.impact,
    result.reason,
    result.suggestedModification,
  ]);

  return [header, ...rows].map((row) => row.map((value) => quote(String(value))).join(",")).join("\n");
}
