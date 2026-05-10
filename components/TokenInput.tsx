"use client";

interface Props {
  token: string;
  onChange: (token: string) => void;
}

export default function TokenInput({ token, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        JWT Bearer Token
      </label>
      <textarea
        value={token}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Paste your JWT token here..."
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
      />
      <p className="text-xs text-slate-400 mt-1">
        Log in to Univision admin panel → Copy the JWT token from browser DevTools
        → Network tab → Authorization header
      </p>
    </div>
  );
}
