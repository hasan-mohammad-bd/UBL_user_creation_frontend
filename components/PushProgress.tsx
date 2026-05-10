"use client";

interface Props {
  processed: number;
  total: number;
  successful: number;
  failed: number;
  alreadyExists: number;
}

export default function PushProgress({
  processed,
  total,
  successful,
  failed,
  alreadyExists,
}: Props) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600">
            {processed} / {total}
          </span>
          <span className="font-medium text-slate-900">{pct}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
          <p className="text-2xl font-bold text-green-700">{successful}</p>
          <p className="text-xs text-green-600">Successful</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
          <p className="text-2xl font-bold text-yellow-700">{alreadyExists}</p>
          <p className="text-xs text-yellow-600">Already Exists</p>
        </div>
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
          <p className="text-2xl font-bold text-red-700">{failed}</p>
          <p className="text-xs text-red-600">Failed</p>
        </div>
      </div>
    </div>
  );
}
