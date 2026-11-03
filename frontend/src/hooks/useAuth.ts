/**
 * useAuth — JWT authentication for BusTrack.
 *
 * Storage:  localStorage keys  'bt_access'  and  'bt_refresh'
 * Endpoints:
 *   POST /api/auth/token/         { username, password }
 *   POST /api/auth/token/refresh/ { refresh }
 *   GET  /api/auth/me/
 *
 * The hook is a plain module-level singleton so the same token state
 * is shared across all components without needing a Context provider.
 */

const API = (import.meta as any).env?.VITE_API_BASE_URL || '';

const KEYS = { access: 'bt_access', refresh: 'bt_refresh' } as const;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id:       number;
  username: string;
  email:    string;
  role:     'admin' | 'driver' | 'student';
  name:     string;
}

export type LoginResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

// ── Token helpers ─────────────────────────────────────────────────────────────
export function getAccessToken(): string | null {
  return localStorage.getItem(KEYS.access);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(KEYS.refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(KEYS.access);
  localStorage.removeItem(KEYS.refresh);
}

function saveTokens(access: string, refresh: string): void {
  localStorage.setItem(KEYS.access, access);
  localStorage.setItem(KEYS.refresh, refresh);
}

// ── Auth header helper (use in fetch calls) ───────────────────────────────────
export function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(
  username: string,
  password: string
): Promise<LoginResult> {
  try {
    // Step 1 — obtain token pair
    const tokenRes = await fetch(`${API}/api/auth/token/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json().catch(() => ({}));
      return {
        ok:    false,
        error: err?.detail ?? `Login failed (${tokenRes.status})`,
      };
    }

    const { access, refresh } = await tokenRes.json();
    saveTokens(access, refresh);

    // Step 2 — fetch user profile to get role
    const meRes = await fetch(`${API}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    });

    if (!meRes.ok) {
      clearTokens();
      return { ok: false, error: 'Could not load user profile.' };
    }

    const user: AuthUser = await meRes.json();
    return { ok: true, user };
  } catch (e) {
    return {
      ok:    false,
      error: e instanceof Error ? e.message : 'Network error',
    };
  }
}

// ── Register (student only) ───────────────────────────────────────────────────
export async function register(payload: {
  username:   string;
  email:      string;
  password:   string;
  first_name: string;
  last_name:  string;
  role:       'student';
  phone_number?: string;
}): Promise<LoginResult> {
  try {
    const res = await fetch(`${API}/api/users/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const firstError = Object.values(err)[0];
      const msg = Array.isArray(firstError) ? firstError[0] : String(firstError ?? 'Registration failed');
      return { ok: false, error: msg };
    }

    // Auto-login after successful registration
    return login(payload.username, payload.password);
  } catch (e) {
    return {
      ok:    false,
      error: e instanceof Error ? e.message : 'Network error',
    };
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function logout(): void {
  clearTokens();
}

// ── Restore session on page load ──────────────────────────────────────────────
export async function restoreSession(): Promise<AuthUser | null> {
  const access = getAccessToken();
  if (!access) return null;

  try {
    const res = await fetch(`${API}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    });

    if (res.ok) return await res.json() as AuthUser;

    // Access token expired — try to refresh
    const refresh = getRefreshToken();
    if (!refresh) { clearTokens(); return null; }

    const refreshRes = await fetch(`${API}/api/auth/token/refresh/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refresh }),
    });

    if (!refreshRes.ok) { clearTokens(); return null; }

    const { access: newAccess } = await refreshRes.json();
    localStorage.setItem(KEYS.access, newAccess);

    const meRes = await fetch(`${API}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${newAccess}` },
    });

    if (meRes.ok) return await meRes.json() as AuthUser;

    clearTokens();
    return null;
  } catch {
    return null;
  }
}
