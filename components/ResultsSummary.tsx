"use client";

interface Props {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  under18Count: number;
  activeDetail?: string | null;
  onDetailToggle?: (key: string) => void;
}

export default function ResultsSummary({
  totalRows,
  validCount,
  invalidCount,
  under18Count,
  activeDetail,
  onDetailToggle,
}: Props) {
  const cards = [
    { key: "total", label: "Total Rows", value: totalRows, color: "bg-blue-100 text-blue-800 border-blue-200", clickable: false },
    { key: "valid", label: "Valid Users", value: validCount, color: "bg-green-100 text-green-800 border-green-200", clickable: false },
    { key: "invalid", label: "Invalid / Rejected", value: invalidCount, color: "bg-red-100 text-red-800 border-red-200", clickable: invalidCount > 0 },
    { key: "under18", label: "Under 18 Filtered", value: under18Count, color: "bg-yellow-100 text-yellow-800 border-yellow-200", clickable: under18Count > 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          onClick={() => card.clickable && onDetailToggle?.(card.key)}
          className={`p-4 rounded-xl border ${card.color} ${card.clickable
              ? "cursor-pointer hover:shadow-md transition-shadow"
              : ""
            } ${activeDetail === card.key ? "ring-2 ring-offset-1 ring-current shadow-md" : ""}`}
        >
          <p className="text-sm font-medium opacity-80">{card.label}</p>
          <p className="text-3xl font-bold mt-1">{card.value}</p>
          {card.clickable && (
            <p className="text-xs mt-2 opacity-60">Click to view details</p>
          )}
        </div>
      ))}
    </div>
  );
}
