"use client";

export default function HealthIndicator({ healthy }: { healthy: boolean | null }) {
  if (healthy === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="w-3 h-3 rounded-full bg-slate-300 animate-pulse" />
        Checking...
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm ${healthy ? "text-green-600" : "text-red-600"
        }`}
    >
      <span
        className={`w-3 h-3 rounded-full ${healthy ? "bg-green-500" : "bg-red-500"
          }`}
      />
      Backend {healthy ? "Connected" : "Disconnected"}
    </div>
  );
}
