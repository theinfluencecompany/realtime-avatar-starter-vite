import { createProxyClient } from "realtime-avatar/react";

// The browser never holds the Realtime Avatar API key. It talks to YOUR server route, which
// holds the key and starts the call. Which route depends on where you host the server half:
//
//   1. VITE_REALTIME_AVATAR_PROXY_URL, if set (any host, absolute or relative).
//   2. The Supabase Edge Function, when VITE_SUPABASE_URL is set (Lovable Cloud, Bolt + Supabase).
//   3. Otherwise /api/realtime-avatar on this origin (the Node/Hono server in server/).

const env = import.meta.env;
const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/\/+$/, "");
// Lovable names it VITE_SUPABASE_PUBLISHABLE_KEY; older Supabase templates use the anon key.
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY;

function supabaseFetch(key: string): typeof fetch {
  // Supabase's gateway wants the project's public key on every request. It is public by design
  // (it already ships in your page); it is NOT the Realtime Avatar key.
  return (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("apikey", key);
    if (!headers.has("authorization")) headers.set("authorization", `Bearer ${key}`);
    return fetch(input, { ...init, headers });
  };
}

export const avatarClient = env.VITE_REALTIME_AVATAR_PROXY_URL
  ? createProxyClient({ proxyUrl: env.VITE_REALTIME_AVATAR_PROXY_URL })
  : supabaseUrl && supabaseKey
    ? createProxyClient({
        proxyUrl: `${supabaseUrl}/functions/v1/realtime-avatar`,
        fetch: supabaseFetch(supabaseKey),
      })
    : createProxyClient({ proxyUrl: "/api/realtime-avatar" });
