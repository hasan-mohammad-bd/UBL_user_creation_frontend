"use client";

import { apiUrl } from "@/lib/api";

interface Props {
  downloadLinks: Record<string, string>;
}

const fileLabels: Record<string, { label: string; icon: string }> = {
  output_file: { label: "Valid Users JSON", icon: "📥" },
  under_18_user: { label: "Under-18 Users JSON", icon: "📥" },
  dump_data: { label: "Rejected Rows CSV", icon: "📥" },
  missing_locations: { label: "Missing Locations Excel", icon: "📥" },
  missing_supervisors: { label: "Missing Supervisors Excel", icon: "📥" },
  credentials_report: { label: "Credentials Report", icon: "📥" },
};

export default function DownloadSection({ downloadLinks }: Props) {
  const entries = Object.entries(downloadLinks);
  if (entries.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">Downloads</h3>
      <div className="flex flex-wrap gap-3">
        {entries.map(([key, url]) => {
          const meta = fileLabels[key] || { label: key, icon: "📄" };
          return (
            <a
              key={key}
              href={apiUrl(url)}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <span>{meta.icon}</span>
              {meta.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
