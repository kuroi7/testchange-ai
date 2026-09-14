import { describe, expect, it, vi } from "vitest";
import type { TestCase } from "../types";
import { openAIAnalyze } from "./openai";

const testCase: TestCase = {
  id: "TC-1",
  title: "Coupon and points",
  preconditions: "User has points and a coupon",
  steps: "Apply coupon, then use points",
  expectedResult: "Both discounts are applied",
};

function successResponse(results: unknown) {
  return new Response(
    JSON.stringify({ output_text: JSON.stringify({ results }) }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("openAIAnalyze", () => {
  it("returns validated results and sends structured-output configuration", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      successResponse([
        {
          testCaseId: "TC-1",
          impact: "high",
          reason: "The changed rule directly affects this expected result.",
          suggestedModification: "Update the expected result for combined usage.",
        },
      ]),
    );

    const results = await openAIAnalyze("Coupons and points can now be combined.", [testCase], {
      apiKey: "test-key",
      model: "gpt-5",
      fetchImpl: fetchMock as unknown as typeof fetch,
      retryDelayMs: 0,
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: "TC-1", impact: "high" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init).toBeDefined();
    const body = JSON.parse(String(init?.body));
    expect(body.store).toBe(false);
    expect(body.text.format.type).toBe("json_schema");
    expect(body.instructions).toContain("UNTRUSTED DATA");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer test-key");
  });

  it("rejects output that omits or invents test case IDs", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      successResponse([
        {
          testCaseId: "TC-OTHER",
          impact: "low",
          reason: "Related.",
          suggestedModification: "Review it.",
        },
      ]),
    );

    await expect(
      openAIAnalyze("Change", [testCase], {
        apiKey: "test-key",
        model: "gpt-5",
        fetchImpl: fetchMock as unknown as typeof fetch,
        retryDelayMs: 0,
      }),
    ).rejects.toMatchObject({ code: "invalid_output" });
  });

  it("returns a useful model-access message for provider 404 responses", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(
        JSON.stringify({
          error: {
            message: "The model `gpt-5.6-terra` does not exist or you do not have access to it.",
            type: "invalid_request_error",
            code: "model_not_found",
          },
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      openAIAnalyze("Change", [testCase], {
        apiKey: "test-key",
        model: "gpt-5.6-terra",
        fetchImpl: fetchMock as unknown as typeof fetch,
        retryDelayMs: 0,
      }),
    ).rejects.toMatchObject({
      code: "provider",
      message: expect.stringContaining("gpt-5.6-terra"),
    });
  });

  it("retries transient provider errors once and then fails safely", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response("temporary failure", { status: 503 }),
    );

    await expect(
      openAIAnalyze("Change", [testCase], {
        apiKey: "test-key",
        model: "gpt-5",
        fetchImpl: fetchMock as unknown as typeof fetch,
        retryDelayMs: 0,
      }),
    ).rejects.toMatchObject({ code: "provider" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("maps abort errors to a timeout error", async () => {
    const abortError = Object.assign(new Error("aborted"), { name: "AbortError" });
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
      throw abortError;
    });

    await expect(
      openAIAnalyze("Change", [testCase], {
        apiKey: "test-key",
        model: "gpt-5",
        fetchImpl: fetchMock as unknown as typeof fetch,
        retryDelayMs: 0,
      }),
    ).rejects.toMatchObject({ code: "timeout" });
  });

  it("enforces the configured maximum number of test cases", async () => {
    await expect(
      openAIAnalyze("Change", [testCase, { ...testCase, id: "TC-2" }], {
        apiKey: "test-key",
        model: "gpt-5",
        maxCases: 1,
      }),
    ).rejects.toMatchObject({ code: "input" });
  });
});
