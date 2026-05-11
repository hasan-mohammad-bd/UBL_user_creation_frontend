"use client";

import { useCallback, useState } from "react";
import { apiUrl } from "@/lib/api";

interface PushResult {
  successful: number;
  failed: number;
  alreadyExists: number;
  total: number;
  errors: { index: number; name: string; error: string }[];
  alreadyExistsRecords: { index: number; name: string; message: string }[];
  credentialReportUrl: string;
}

interface Props {
  result: PushResult;
}

function formatTable(headers: string[], rows: string[][], title: string): string {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || "").length))
  );
  const pad = (s: string, w: number) => s + " ".repeat(Math.max(0, w - s.length));
  const sep = colWidths.map((w) => "-".repeat(w)).join("-+-");
  const fmtRow = (r: string[]) => r.map((c, i) => pad(c, colWidths[i])).join(" | ");
  return [
    title,
    "=".repeat(title.length),
    "",
    fmtRow(headers),
    sep,
    ...rows.map((r) => fmtRow(r)),
    "",
    `Total: ${rows.length}`,
  ].join("\n");
}

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = getText();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [getText]);

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
        copied
          ? "bg-green-100 text-green-700 border-green-300"
          : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
      }`}
    >
      {copied ? "✓ Copied!" : "📋 Copy All"}
    </button>
  );
}

export default function PushSummary({ result }: Props) {
  const getAlreadyExistsText = useCallback(() => {
    const headers = ["#", "Index", "Name", "Message"];
    const rows = result.alreadyExistsRecords.map((r, i) => [
      String(i + 1),
      String(r.index),
      r.name,
      r.message || "—",
    ]);
    return formatTable(headers, rows, `Already Existed Users (${result.alreadyExistsRecords.length})`);
  }, [result.alreadyExistsRecords]);

  const getFailedText = useCallback(() => {
    const headers = ["#", "Index", "Name", "Error"];
    const rows = result.errors.map((e, i) => [
      String(i + 1),
      String(e.index),
      e.name,
      e.error,
    ]);
    return formatTable(headers, rows, `Failed Records (${result.errors.length})`);
  }, [result.errors]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Push Summary</h3>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-100 text-center">
          <p className="text-xl font-bold text-slate-800">{result.total}</p>
          <p className="text-xs text-slate-500">Total Processed</p>
        </div>
        <div className="p-3 rounded-lg bg-green-100 text-center">
          <p className="text-xl font-bold text-green-800">{result.successful}</p>
          <p className="text-xs text-green-600">Created</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-100 text-center">
          <p className="text-xl font-bold text-yellow-800">{result.alreadyExists}</p>
          <p className="text-xs text-yellow-600">Already Existed</p>
        </div>
        <div className="p-3 rounded-lg bg-red-100 text-center">
          <p className="text-xl font-bold text-red-800">{result.failed}</p>
          <p className="text-xs text-red-600">Failed</p>
        </div>
      </div>

      {/* Already existed records table */}
      {result.alreadyExistsRecords.length > 0 && (
        <div className="bg-white border border-yellow-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-yellow-800">
                Already Existed ({result.alreadyExistsRecords.length})
              </h4>
              <p className="text-xs text-yellow-600 mt-1">
                These users already exist in the system and were skipped.
              </p>
            </div>
            <CopyButton getText={getAlreadyExistsText} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-yellow-50/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">#</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Index</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-yellow-700">Message</th>
                </tr>
              </thead>
              <tbody>
                {result.alreadyExistsRecords.map((r, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-yellow-50/30">
                    <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-2 text-slate-500">{r.index}</td>
                    <td className="px-4 py-2 font-medium">{r.name}</td>
                    <td className="px-4 py-2 text-yellow-700">{r.message || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Failed records table */}
      {result.errors.length > 0 && (
        <div className="bg-white border border-red-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-red-800">
                Failed Records ({result.errors.length})
              </h4>
              <p className="text-xs text-red-600 mt-1">
                These records failed to be created. See the error column for details.
              </p>
            </div>
            <CopyButton getText={getFailedText} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-red-50/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">#</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Index</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-red-700">Error</th>
                </tr>
              </thead>
              <tbody>
                {result.errors.map((e, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-red-50/30">
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2 text-slate-500">{e.index}</td>
                    <td className="px-3 py-2 font-medium">{e.name}</td>
                    <td className="px-3 py-2 text-red-600 font-medium">{e.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Credential download */}
      {result.credentialReportUrl && (
        <a
          href={apiUrl(result.credentialReportUrl)}
          download
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          📥 Download Credential Report
        </a>
      )}
    </div>
  );
}
