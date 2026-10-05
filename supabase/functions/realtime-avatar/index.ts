// Supabase Edge Function: the server half of a Realtime Avatar call.
//
// The browser calls https://<project>.supabase.co/functions/v1/realtime-avatar/connect, this
// function starts the call with YOUR key and relays the session grant back. The key never
// reaches the browser.
//
// Secrets (Supabase dashboard > Edge Functions > Secrets, or `supabase secrets set`):
//   REALTIME_AVATAR_API_KEY   required, from https://realtimeavatar.ai/platform/settings#api-keys
//   REALTIME_AVATAR_IDS       optional, comma separated avatar ids this function may call

import { realtimeAvatarHono } from "realtime-avatar/hono";
import { allowedAvatarIds, callPolicy, refuseMissingKey, refuseUnknownAvatar, refuseUnusedOperation } from "../_shared/policy.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const allowed = allowedAvatarIds(Deno.env.get("REALTIME_AVATAR_IDS"));

// `realtimeAvatarHono` is a plain Fetch handler wrapped for Hono; Deno.serve speaks Fetch too,
// so it is called directly here with no Hono app.
const route = realtimeAvatarHono({
  apiKey: () => Deno.env.get("REALTIME_AVATAR_API_KEY") ?? "",

  // Who may start a call. This starter lets anyone who can load your app start a call capped
  // at callPolicy.maxSeconds. Before you go public, require a signed-in user here, e.g. with
  // supabase-js: `const { data } = await supabase.auth.getUser(token)` and return a 401
  // Response when there is no user.
  authorize: ({ operation }) =>
    refuseUnusedOperation(operation) ?? refuseMissingKey(Deno.env.get("REALTIME_AVATAR_API_KEY")),

  // Hang-ups (POST /end) are honoured only for calls this instance started. An Edge Function can
  // land on a different instance; then the platform's join/idle timeout frees the slot instead.
  session: ({ avatarId }) => refuseUnknownAvatar(avatarId, allowed) ?? callPolicy,
});

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  const response = await route({ req: { raw: req } });
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(corsHeaders)) headers.set(name, value);
  return new Response(response.body, { status: response.status, headers });
});
