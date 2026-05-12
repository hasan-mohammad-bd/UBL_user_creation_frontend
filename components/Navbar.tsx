"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, logout, type LoginUser } from "@/lib/auth";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/results", label: "Results" },
  { href: "/push", label: "Push" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<LoginUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-bold text-blue-800">
            UBL Creator
          </Link>
          <div className="flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
                    ? "bg-blue-100 text-blue-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center pl-3 ml-2 border-l border-slate-200 space-x-3">
              {user && (
                <span className="text-sm text-slate-500 hidden sm:inline">
                  {user.username}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
