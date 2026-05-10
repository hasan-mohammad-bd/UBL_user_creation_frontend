"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HealthIndicator from "@/components/HealthIndicator";

export default function HomePage() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/health/");
        setHealthy(res.ok);
      } catch {
        setHealthy(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">
          UBL BP/Supervisor Creation Tool
        </h1>
        <HealthIndicator healthy={healthy} />
      </div>

      <p className="text-slate-600 text-lg">
        Upload Excel files containing Brand Promoter or Supervisor data, validate
        against the database, and push to the Univision production API.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link
          href="/upload"
          className="block p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="text-3xl mb-3">📤</div>
          <h2 className="text-xl font-semibold text-slate-900">Upload & Validate</h2>
          <p className="text-slate-500 mt-2">
            Upload an Excel file and validate BP/Supervisor data against the database.
          </p>
        </Link>

        <Link
          href="/results"
          className="block p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-green-300 transition-all"
        >
          <div className="text-3xl mb-3">📊</div>
          <h2 className="text-xl font-semibold text-slate-900">View Results</h2>
          <p className="text-slate-500 mt-2">
            Review validation results, download files, and preview valid users.
          </p>
        </Link>

        <Link
          href="/push"
          className="block p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-300 transition-all"
        >
          <div className="text-3xl mb-3">🚀</div>
          <h2 className="text-xl font-semibold text-slate-900">Push to Production</h2>
          <p className="text-slate-500 mt-2">
            Create user accounts in the live Univision system with real-time tracking.
          </p>
        </Link>
      </div>
    </div>
  );
}
