"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { isAuthenticated } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (isLoginRoute) {
      setReady(true);
      return;
    }
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [pathname, isLoginRoute, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </>
  );
}
