import { createBrowserClient } from "@supabase/ssr";

// These are public Supabase client identifiers, not server secrets. The
// fallback keeps browser authentication available on Render, where .env files
// are not included in the deployed source bundle.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ldcukldezlbjiqhkocud.supabase.co";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_eylWqxr0BDymmpPSLqd0fA_lgTTote1";

export const hasSupabaseAuth = Boolean(supabaseUrl && supabasePublishableKey);

export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabasePublishableKey,
  );
}
