import { NextResponse } from "next/server";
import { z } from "zod";
import { AnalyzerError, analyzeChange } from "@/lib/analyzers";

const testCaseSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().max(1_000).default(""),
  preconditions: z.string().max(10_000).default(""),
  steps: z.string().max(20_000).default(""),
  expectedResult: z.string().max(10_000).default(""),
});

const requestSchema = z.object({
  change: z.string().min(1).max(20_000),
  testCases: z
    .array(testCaseSchema)
    .min(1)
    .max(5_000)
    .refine(
      (testCases) => new Set(testCases.map((testCase) => testCase.id)).size === testCases.length,
      { message: "Test case IDs must be unique" },
    ),
});

function statusForAnalyzerError(error: AnalyzerError): number {
  switch (error.code) {
    case "input":
      return 400;
    case "configuration":
      return 503;
    case "timeout":
      return 504;
    case "provider":
    case "invalid_output":
      return 502;
  }
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const analysis = await analyzeChange(body.change, body.testCases);
    return NextResponse.json(analysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "入力内容を確認してください。", details: error.issues }, { status: 400 });
    }
    if (error instanceof AnalyzerError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusForAnalyzerError(error) },
      );
    }
    return NextResponse.json({ error: "解析に失敗しました。" }, { status: 500 });
  }
}
