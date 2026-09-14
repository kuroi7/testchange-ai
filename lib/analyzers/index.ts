import type { AnalysisResult, TestCase } from "../types";
import { mockAnalyze } from "./mock";
import { AnalyzerError, openAIAnalyze } from "./openai";

export type AnalyzerResponse = {
  analyzer: "mock" | "openai";
  model?: string;
  results: AnalysisResult[];
};

function readPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function analyzeChange(change: string, testCases: TestCase[]): Promise<AnalyzerResponse> {
  const provider = (process.env.ANALYZER_PROVIDER ?? "mock").trim().toLowerCase();

  if (provider === "mock") {
    return {
      analyzer: "mock",
      results: mockAnalyze(change, testCases),
    };
  }

  if (provider === "openai") {
    const model = (process.env.OPENAI_MODEL ?? "gpt-5").trim();
    const results = await openAIAnalyze(change, testCases, {
      apiKey: process.env.OPENAI_API_KEY,
      model,
      timeoutMs: readPositiveInt(process.env.OPENAI_ANALYSIS_TIMEOUT_MS, 45_000),
      maxCases: readPositiveInt(process.env.OPENAI_MAX_TEST_CASES, 200),
    });

    return {
      analyzer: "openai",
      model,
      results,
    };
  }

  throw new AnalyzerError(
    "configuration",
    "ANALYZER_PROVIDER は mock または openai を指定してください。",
  );
}

export { AnalyzerError } from "./openai";
