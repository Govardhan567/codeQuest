import { createBrowserClient } from "@supabase/ssr";

// These are public Supabase client identifiers, not server secrets. The
// fallback keeps browser authentication available on Render, where .env files
// are not included in the deployed source bundle.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ldcukldezlbjiqhkocud.supabase.co";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_eylWqxr0BDymmpPSLqd0fA_lgTTote1";
const authRequestTimeoutMs = 15_000;

export const hasSupabaseAuth = Boolean(supabaseUrl && supabasePublishableKey);

async function fetchWithAuthTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const cancelFromCaller = () => controller.abort();
  init?.signal?.addEventListener("abort", cancelFromCaller, { once: true });
  const timeout = globalThis.setTimeout(() => controller.abort(), authRequestTimeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    globalThis.clearTimeout(timeout);
    init?.signal?.removeEventListener("abort", cancelFromCaller);
  }
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabasePublishableKey,
    { global: { fetch: fetchWithAuthTimeout } },
  );
}
