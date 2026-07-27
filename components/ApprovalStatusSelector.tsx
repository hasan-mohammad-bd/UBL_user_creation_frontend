"use client";

export const APPROVED_STATUS_WITH_TRAINING = 177;
export const APPROVED_STATUS_WITHOUT_TRAINING = 6;

export type ApprovedStatus =
  | typeof APPROVED_STATUS_WITH_TRAINING
  | typeof APPROVED_STATUS_WITHOUT_TRAINING;

const OPTIONS: { value: ApprovedStatus; label: string; hint: string }[] = [
  {
    value: APPROVED_STATUS_WITH_TRAINING,
    label: "With Training",
    hint: "User must complete training to enrol",
  },
  {
    value: APPROVED_STATUS_WITHOUT_TRAINING,
    label: "Without Training",
    hint: "User is enrolled directly, no training",
  },
];

interface Props {
  value: ApprovedStatus;
  onChange: (value: ApprovedStatus) => void;
  disabled?: boolean;
}

export default function ApprovalStatusSelector({ value, onChange, disabled }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Enrolment Mode
      </label>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange(opt.value)}
              className={`text-left px-4 py-3 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                selected
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-slate-300 bg-white hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    selected ? "text-blue-800" : "text-slate-800"
                  }`}
                >
                  {opt.label}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    selected
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {opt.value}
                </span>
              </span>
              <span className="block text-xs text-slate-500 mt-1">{opt.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
