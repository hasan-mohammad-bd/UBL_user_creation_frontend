"use client";

interface Props {
  sessionId: string;
}

export default function CredentialDownload({ sessionId }: Props) {
  return (
    <a
      href={`/api/download/${sessionId}/credentials_report.xlsx`}
      download
      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
    >
      📥 Download Credential Report
    </a>
  );
}
