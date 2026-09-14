export type ImpactLevel = "high" | "medium" | "low" | "none";

export type TestCase = {
  id: string;
  title: string;
  preconditions: string;
  steps: string;
  expectedResult: string;
};

export type AnalysisResult = TestCase & {
  impact: ImpactLevel;
  reason: string;
  suggestedModification: string;
};
