"use client";

import { useState } from "react";

interface UserRecord {
  full_name: string;
  username: string;
  designation: string;
  assigned_role: number;
  location: number[];
  reportto_id: number;
  dob: string;
  gender: string;
}

interface Props {
  users: UserRecord[];
}

const PAGE_SIZE = 50;

export default function PreviewTable({ users }: Props) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const slice = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (users.length === 0) {
    return (
      <p className="text-slate-500 text-sm">No valid users to preview.</p>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-3">
        Valid Users Preview
      </h3>
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-600">#</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Name</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Username</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Designation</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Role</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Location</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Report To</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">DOB</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Gender</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((u, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 text-slate-500">{page * PAGE_SIZE + i + 1}</td>
                <td className="px-4 py-2">{u.full_name}</td>
                <td className="px-4 py-2 font-mono text-xs">{u.username}</td>
                <td className="px-4 py-2">{u.designation}</td>
                <td className="px-4 py-2">{u.assigned_role === 4 ? "BP" : u.assigned_role === 3 ? "SUP" : u.assigned_role}</td>
                <td className="px-4 py-2">{u.location?.join(", ")}</td>
                <td className="px-4 py-2">{u.reportto_id}</td>
                <td className="px-4 py-2">{u.dob}</td>
                <td className="px-4 py-2">{u.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-slate-500">
            Page {page + 1} of {totalPages} ({users.length} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
