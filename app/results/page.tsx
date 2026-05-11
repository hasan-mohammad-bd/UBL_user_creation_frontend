"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultsSummary from "@/components/ResultsSummary";
import ErrorPanel from "@/components/ErrorPanel";
import DownloadSection from "@/components/DownloadSection";
import PreviewTable from "@/components/PreviewTable";
import DetailPanel from "@/components/DetailPanel";
import { apiUrl } from "@/lib/api";

interface UploadResult {
  session_id: string;
  total_rows: number;
  valid_count: number;
  invalid_count: number;
  under_18_count: number;
  errors: Record<string, number>;
  download_links: Record<string, string>;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<UploadResult | null>(null);
  const [validUsers, setValidUsers] = useState<unknown[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("uploadResult");
    if (!stored) return;
    const data: UploadResult = JSON.parse(stored);
    setResult(data);

    // Fetch the valid users for preview
    if (data.download_links.output_file) {
      setLoadingPreview(true);
      fetch(apiUrl(data.download_links.output_file))
        .then((r) => r.json())
        .then((users) => setValidUsers(users))
        .catch(() => { })
        .finally(() => setLoadingPreview(false));
    }
  }, []);

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No upload results found.</p>
        <button
          onClick={() => router.push("/upload")}
          className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Validation Results</h1>
        <span className="text-xs text-slate-400 font-mono">
          Session: {result.session_id.slice(0, 8)}...
        </span>
      </div>

      <ResultsSummary
        totalRows={result.total_rows}
        validCount={result.valid_count}
        invalidCount={result.invalid_count}
        under18Count={result.under_18_count}
        activeDetail={activeDetail}
        onDetailToggle={(key) =>
          setActiveDetail((prev) => (prev === key ? null : key))
        }
      />

      {activeDetail === "invalid" && result.invalid_count > 0 && (
        <DetailPanel
          detailType="invalid"
          sessionId={result.session_id}
          downloadLinks={result.download_links}
        />
      )}

      {activeDetail === "under18" && result.under_18_count > 0 && (
        <DetailPanel
          detailType="under18"
          sessionId={result.session_id}
          downloadLinks={result.download_links}
        />
      )}

      <ErrorPanel errors={result.errors} />

      <DownloadSection downloadLinks={result.download_links} />

      <div>
        {loadingPreview ? (
          <p className="text-slate-500 text-sm">Loading preview...</p>
        ) : (
          <PreviewTable users={validUsers as never[]} />
        )}
      </div>

      {result.valid_count > 0 && (
        <button
          onClick={() => {
            sessionStorage.setItem("pushSessionId", result.session_id);
            sessionStorage.setItem("pushValidCount", String(result.valid_count));
            router.push("/push");
          }}
          className="w-full py-4 bg-purple-700 text-white rounded-xl font-semibold text-lg hover:bg-purple-800 transition-colors"
        >
          🚀 Push to Production ({result.valid_count} users)
        </button>
      )}
    </div>
  );
}
