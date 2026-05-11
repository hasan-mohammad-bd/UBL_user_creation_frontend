"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AgencySelector from "@/components/AgencySelector";
import FileUploader from "@/components/FileUploader";
import { useToast } from "@/components/Toast";
import { apiUrl } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [agencyId, setAgencyId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const canUpload = agencyId !== null && file !== null && !loading;

  const handleUpload = async () => {
    if (!canUpload) return;

    setLoading(true);
    toast("Upload started...", "info");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(apiUrl(`/uploader/?agency_id=${agencyId}`), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail || "Upload failed");
      }

      const data = await res.json();
      toast("Processing complete!", "success");

      // Store result in sessionStorage and navigate
      sessionStorage.setItem("uploadResult", JSON.stringify(data));
      router.push("/results");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Upload & Validate</h1>
      <p className="text-slate-600">
        Upload an Excel file with BP or Supervisor data. Select the agency first.
      </p>

      <div className="space-y-5 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <AgencySelector value={agencyId} onChange={setAgencyId} />
        <FileUploader onFileSelected={setFile} />

        <button
          disabled={!canUpload}
          onClick={handleUpload}
          className="w-full py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            "Upload & Validate"
          )}
        </button>
      </div>
    </div>
  );
}
