"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

function formatTable(headers: string[], rows: string[][], title: string): string {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || "").length))
  );
  const pad = (s: string, w: number) => s + " ".repeat(Math.max(0, w - s.length));
  const sep = colWidths.map((w) => "-".repeat(w)).join("-+-");
  const fmtRow = (r: string[]) => r.map((c, i) => pad(c, colWidths[i])).join(" | ");
  const lines = [
    title,
    "=".repeat(title.length),
    "",
    fmtRow(headers),
    sep,
    ...rows.map((r) => fmtRow(r)),
    "",
    `Total: ${rows.length}`,
  ];
  return lines.join("\n");
}

interface Props {
  detailType: "invalid" | "under18";
  sessionId: string;
  downloadLinks: Record<string, string>;
}

interface InvalidRow {
  [key: string]: string | number | null;
}

interface Under18User {
  full_name: string;
  username: string;
  dob: string;
  gender: string;
  designation: string;
  personal_contact: string;
  assigned_role: number;
}

export default function DetailPanel({ detailType, sessionId, downloadLinks }: Props) {
  const [data, setData] = useState<(InvalidRow | Under18User)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const url =
      detailType === "invalid"
        ? downloadLinks.dump_data
        : downloadLinks.under_18_user;

    if (!url) {
      setError("No data file available for this category.");
      setLoading(false);
      return;
    }

    if (detailType === "under18") {
      // JSON file
      fetch(apiUrl(url))
        .then((r) => {
          if (!r.ok) throw new Error("Failed to fetch");
          return r.json();
        })
        .then((json) => setData(json))
        .catch(() => setError("Failed to load under-18 data."))
        .finally(() => setLoading(false));
    } else {
      // CSV file — parse it
      fetch(apiUrl(url))
        .then((r) => {
          if (!r.ok) throw new Error("Failed to fetch");
          return r.text();
        })
        .then((csv) => {
          const rows = parseCsv(csv);
          setData(rows);
        })
        .catch(() => setError("Failed to load rejected rows data."))
        .finally(() => setLoading(false));
    }
  }, [detailType, sessionId, downloadLinks]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-500">
        Loading details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-500 text-sm">
        No records found.
      </div>
    );
  }

  if (detailType === "under18") {
    return <Under18Table data={data as Under18User[]} />;
  }

  return <InvalidTable data={data as InvalidRow[]} />;
}

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
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
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${copied
          ? "bg-green-100 text-green-700 border-green-300"
          : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
        }`}
    >
      {copied ? "✓ Copied!" : "📋 Copy All"}
    </button>
  );
}

function Under18Table({ data }: { data: Under18User[] }) {
  const getText = useCallback(() => {
    const headers = ["#", "Name", "Contact", "Reason"];
    const rows = data.map((u, i) => [
      String(i + 1),
      u.full_name,
      u.personal_contact,
      "Under 18 years old",
    ]);
    return formatTable(headers, rows, `Under 18 Filtered Users (${data.length})`);
  }, [data]);

  return (
    <div className="bg-white border border-yellow-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-yellow-800">
            Under 18 Users ({data.length})
          </h3>
          <p className="text-xs text-yellow-600 mt-1">
            These users were filtered out because they are under 18 years old.
          </p>
        </div>
        <CopyButton getText={getText} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-yellow-50/50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-600">#</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Name</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Contact</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.map((u, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-yellow-50/30">
                <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                <td className="px-4 py-2 font-medium">{u.full_name}</td>
                <td className="px-4 py-2">{u.personal_contact}</td>
                <td className="px-4 py-2 text-yellow-700">Under 18 years old</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvalidTable({ data }: { data: InvalidRow[] }) {
  if (data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const remarkCols = columns.filter((c) => c.startsWith("remark"));
  // Find name and phone columns
  const nameCol = columns.find((c) => c.toLowerCase().includes("name")) || columns[0];
  const phoneCol = columns.find((c) => c.toLowerCase().includes("mobile") || c.toLowerCase().includes("phone") || c.toLowerCase().includes("contact")) || "";

  const getError = (row: InvalidRow) => {
    const errors = remarkCols
      .map((c) => row[c])
      .filter((v) => v != null && v !== "")
      .map(String);
    return errors.join("; ") || "—";
  };

  const getText = useCallback(() => {
    const headers = ["#", "Name", "Phone", "Error"];
    const rows = data.map((row, i) => [
      String(i + 1),
      row[nameCol] != null ? String(row[nameCol]) : "—",
      phoneCol && row[phoneCol] != null ? String(row[phoneCol]) : "—",
      getError(row),
    ]);
    return formatTable(headers, rows, `Invalid / Rejected Rows (${data.length})`);
  }, [data, nameCol, phoneCol, remarkCols]);

  return (
    <div className="bg-white border border-red-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-red-800">
            Invalid / Rejected Rows ({data.length})
          </h3>
          <p className="text-xs text-red-600 mt-1">
            These rows failed validation. See the error column for details.
          </p>
        </div>
        <CopyButton getText={getText} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-red-50/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-600">#</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Name</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Phone</th>
              <th className="px-3 py-2 text-left font-medium text-red-700 bg-red-50">Error</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-red-50/30">
                <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{row[nameCol] != null ? String(row[nameCol]) : "—"}</td>
                <td className="px-3 py-2">{phoneCol && row[phoneCol] != null ? String(row[phoneCol]) : "—"}</td>
                <td className="px-3 py-2 text-red-600 font-medium">{getError(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function parseCsv(csv: string): InvalidRow[] {
  const lines = csv.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: InvalidRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: InvalidRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? null;
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}
