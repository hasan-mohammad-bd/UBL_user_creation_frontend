"use client";

import { useState } from "react";

interface Props {
  errors: Record<string, number>;
}

const errorLabels: Record<string, string> = {
  wrong_role: "Wrong Role",
  missing_locations: "Missing Locations",
  missing_supervisors: "Missing Supervisors",
  invalid_phones: "Invalid Mobile Numbers",
};

export default function ErrorPanel({ errors }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const entries = Object.entries(errors);
  if (entries.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
        No validation errors found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-slate-900">Validation Errors</h3>
      {entries.map(([key, count]) => (
        <div key={key} className="border border-slate-200 rounded-lg bg-white">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left"
            onClick={() => setExpanded(expanded === key ? null : key)}
          >
            <span className="font-medium text-slate-900">
              {errorLabels[key] || key}
            </span>
            <span className="flex items-center gap-2">
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                {count}
              </span>
              <span className="text-slate-400">
                {expanded === key ? "▲" : "▼"}
              </span>
            </span>
          </button>
          {expanded === key && (
            <div className="px-4 pb-3 text-sm text-slate-600">
              {count} row(s) affected. Download the error files for details.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
