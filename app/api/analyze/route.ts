import { NextResponse } from "next/server";
import { z } from "zod";
import { mockAnalyze } from "@/lib/analyzers/mock";

const testCaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().default(""),
  preconditions: z.string().default(""),
  steps: z.string().default(""),
  expectedResult: z.string().default(""),
});

const requestSchema = z.object({
  change: z.string().min(1).max(20_000),
  testCases: z.array(testCaseSchema).min(1).max(5_000),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const results = mockAnalyze(body.change, body.testCases);
    return NextResponse.json({ analyzer: "mock", results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
