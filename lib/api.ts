export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "https://prod.univision.solutions/bulk-user-creation";

export function apiUrl(path: string): string {
  const base = BACKEND_URL.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function wsUrl(path: string): string {
  const http = apiUrl(path);
  return http.replace(/^http/i, "ws");
}
