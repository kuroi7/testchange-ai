"use client";

import Papa from "papaparse";
import { useMemo, useState } from "react";
import { resultsToCsv } from "@/lib/csv";
import type { AnalysisResult, TestCase } from "@/lib/types";

const aliases: Record<keyof TestCase, string[]> = {
  id: ["id", "test case id", "case id"],
  title: ["title", "name", "test case title"],
  preconditions: ["preconditions", "precondition"],
  steps: ["steps", "step", "test steps"],
  expectedResult: ["expected result", "expected", "expected_result"],
};

function normalizeKey(key: string) {
  return key.trim().toLowerCase();
}

function valueFor(row: Record<string, unknown>, field: keyof TestCase): string {
  const entries = Object.entries(row);
  for (const alias of aliases[field]) {
    const found = entries.find(([key]) => normalizeKey(key) === alias);
    if (found) return String(found[1] ?? "").trim();
  }
  return "";
}

export default function Home() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [change, setChange] = useState("");
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const summary = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0, none: 0 };
    results.forEach((result) => { counts[result.impact] += 1; });
    return counts;
  }, [results]);

  async function onFile(file?: File) {
    setError("");
    setResults([]);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("CSVは5MB以下にしてください。");
      return;
    }

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length > 0) {
          setError("CSVを読み取れませんでした。サンプル形式を確認してください。");
          return;
        }
        const parsed = data.slice(0, 5000).map((row) => ({
          id: valueFor(row, "id"),
          title: valueFor(row, "title"),
          preconditions: valueFor(row, "preconditions"),
          steps: valueFor(row, "steps"),
          expectedResult: valueFor(row, "expectedResult"),
        })).filter((row) => row.id);
        if (parsed.length === 0) {
          setError("ID列を含むテストケースが見つかりませんでした。");
          return;
        }
        setTestCases(parsed);
      },
    });
  }

  async function analyze() {
    setError("");
    if (!change.trim() || testCases.length === 0) {
      setError("CSVと仕様変更内容の両方を入力してください。");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ change, testCases }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Analysis failed");
      setResults(data.results);
    } catch {
      setError("解析に失敗しました。入力を確認して再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    const blob = new Blob(["\uFEFF", resultsToCsv(results)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "testchange-results.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Change-aware QA Agent</span>
        <h1>仕様変更で、どのテストを直すべきかを見つける。</h1>
        <p>既存テストケースのCSVと仕様変更を入力すると、影響度と修正案を提示します。</p>
      </section>

      <section className="panel">
        <label>
          <strong>1. テストケースCSV</strong>
          <input type="file" accept=".csv,text/csv" onChange={(event) => onFile(event.target.files?.[0])} />
        </label>
        <small>{testCases.length > 0 ? `${testCases.length}件を読み込みました` : "最大5MB / 5,000件"}</small>

        <label>
          <strong>2. 仕様変更</strong>
          <textarea value={change} onChange={(event) => setChange(event.target.value)} rows={8} placeholder="例：クーポン利用時でもポイントを併用できるように変更する。" />
        </label>

        <button onClick={analyze} disabled={loading}>{loading ? "解析中…" : "影響を分析する"}</button>
        {error && <p className="error">{error}</p>}
      </section>

      {results.length > 0 && (
        <section className="panel results">
          <div className="resultHeader">
            <h2>解析結果</h2>
            <button className="secondary" onClick={exportCsv}>CSV出力</button>
          </div>
          <div className="summary">
            <span>High <b>{summary.high}</b></span>
            <span>Medium <b>{summary.medium}</b></span>
            <span>Low <b>{summary.low}</b></span>
            <span>No impact <b>{summary.none}</b></span>
          </div>
          <div className="tableWrap">
            <table>
              <thead><tr><th>ID</th><th>Title</th><th>Impact</th><th>Reason</th><th>Suggested modification</th></tr></thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.id}</td><td>{result.title}</td><td><span className={`impact ${result.impact}`}>{result.impact}</span></td><td>{result.reason}</td><td>{result.suggestedModification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="notice">現在はMock解析です。AIプロバイダ接続は次のIssueで実装します。</p>
        </section>
      )}
    </main>
  );
}
