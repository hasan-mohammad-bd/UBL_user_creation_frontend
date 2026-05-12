import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "UBL BP/Supervisor Creation Tool",
  description: "Upload, validate, and push BP/Supervisor user accounts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <ToastProvider>
          <AuthGuard>{children}</AuthGuard>
        </ToastProvider>
      </body>
    </html>
  );
}
