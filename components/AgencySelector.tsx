"use client";

const agencies = [
  { id: 1, name: "Asiatic" },
  { id: 3, name: "HVL" },
  { id: 4, name: "Pixel" },
  { id: 5, name: "SC" },
  { id: 6, name: "MAPL" },
  { id: 7, name: "IAL" },
  { id: 8, name: "VTWO" },
  { id: 9, name: "PH" },
];

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
}

export default function AgencySelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Agency
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v ? Number(v) : null);
        }}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select an agency...</option>
        {agencies.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.id})
          </option>
        ))}
      </select>
    </div>
  );
}
