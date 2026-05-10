"use client";

import { useEffect, useRef } from "react";

interface LogEntry {
  index: number;
  total: number;
  name: string;
  status: string;
  message: string;
}

interface Props {
  entries: LogEntry[];
}

export default function ActivityLog({ entries }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries]);

  const statusIcon = (s: string) => {
    if (s === "success") return "✅";
    if (s === "already_exists") return "⚠️";
    return "❌";
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Activity Log</h3>
      <div
        ref={containerRef}
        className="h-64 overflow-y-auto bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300 space-y-1"
      >
        {entries.length === 0 && (
          <p className="text-slate-500">Waiting for push to start...</p>
        )}
        {entries.map((e, i) => (
          <div key={i}>
            <span className="text-slate-500">
              [{e.index + 1}/{e.total}]
            </span>{" "}
            {statusIcon(e.status)}{" "}
            <span className="text-white">{e.name}</span>{" "}
            <span className="text-slate-400">— {e.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
