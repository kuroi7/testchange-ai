import type { AnalysisResult, TestCase } from "../types";

function bigrams(input: string): Set<string> {
  const normalized = input.toLowerCase().replace(/\s+/g, "");
  const grams = new Set<string>();
  for (let i = 0; i < normalized.length - 1; i += 1) grams.add(normalized.slice(i, i + 2));
  return grams;
}

function score(change: string, testCase: TestCase): number {
  const changeGrams = bigrams(change);
  const target = bigrams(`${testCase.title}${testCase.preconditions}${testCase.steps}${testCase.expectedResult}`);
  if (changeGrams.size === 0 || target.size === 0) return 0;
  let overlap = 0;
  for (const gram of changeGrams) if (target.has(gram)) overlap += 1;
  return overlap / changeGrams.size;
}

export function mockAnalyze(change: string, testCases: TestCase[]): AnalysisResult[] {
  return testCases.map((testCase) => {
    const similarity = score(change, testCase);
    const impact = similarity >= 0.25 ? "high" : similarity >= 0.12 ? "medium" : similarity > 0 ? "low" : "none";
    const affected = impact !== "none";
    return {
      ...testCase,
      impact,
      reason: affected
        ? "仕様変更とテストケースの記述に関連語が含まれています。AI接続前のMock判定です。"
        : "仕様変更との明確な関連をMock判定では検出できませんでした。",
      suggestedModification: affected
        ? "変更仕様を反映して、前提条件・操作・期待結果を見直してください。"
        : "変更提案なし",
    };
  });
}
