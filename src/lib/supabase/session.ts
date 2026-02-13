import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type StoredSession = {
  access_token?: string;
  expires_at?: number;
  refresh_token?: string;
};

function getProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname.split(".")[0];
  } catch {
    return null;
  }
}

function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const projectRef = getProjectRef();
  if (!projectRef) return null;
  const key = `sb-${projectRef}-auth-token`;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function getStoredAccessToken() {
  const session = getStoredSession();
  if (!session?.access_token) return null;
  if (session.expires_at && session.expires_at < Date.now() / 1000) {
    return null;
  }
  return session.access_token;
}

export async function ensureAccessToken() {
  const existing = getStoredAccessToken();
  if (existing) return existing;

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session?.access_token ?? null;
}
