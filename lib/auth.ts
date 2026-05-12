export const TOKEN_KEY = "ubl_bulk_user_creation_token";
export const USER_KEY = "ubl_bulk_user_creation_user";
export const REQUIRED_ROLE_TYPE = 28;

const LOGIN_URL =
  "https://prod.univision.solutions/login-manager/api/v1/auth/signin-web";

export interface LoginUser {
  id: number;
  username: string;
  user_type: string;
  reset_stts: boolean;
  top_mgt: boolean;
  agency_id: number | null;
  org_info: { id: number; name: string; tag: string } | null;
  role: number;
  role_name: string;
  role_type: number;
  role_access: number[];
  resource_access: number[];
}

interface LoginResponse {
  status: string;
  data: LoginUser & { token: string };
  message?: string;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginUser> {
  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  let body: LoginResponse | null = null;
  try {
    body = (await res.json()) as LoginResponse;
  } catch {
    body = null;
  }

  if (!res.ok || !body || body.status !== "ok" || !body.data?.token) {
    const msg = body?.message || `Login failed (HTTP ${res.status})`;
    throw new Error(msg);
  }

  const { token, ...user } = body.data;

  if (user.role_type !== REQUIRED_ROLE_TYPE) {
    throw new Error(
      "You do not have permission to access this application.",
    );
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): LoginUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  const user = getUser();
  if (!user) return false;
  return user.role_type === REQUIRED_ROLE_TYPE;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
