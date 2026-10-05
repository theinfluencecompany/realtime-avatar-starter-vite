// The call policy: WHO may be called and WHAT the character knows. Server-only.
//
// Both servers in this repo import this one file:
//   - supabase/functions/realtime-avatar/index.ts  (Supabase Edge Function, Deno: Lovable, Bolt + Supabase)
//   - server/app.ts                                (Hono on Node: Bolt, Replit, local dev)
//
// It lives under supabase/functions/_shared/ because Supabase only bundles files inside
// supabase/functions/. Keep it free of runtime-specific APIs so both runtimes can load it.

import type { CallPolicy } from "realtime-avatar";

/** A public example avatar from the docs quickstart. Works on a fresh key, nothing to create. */
export const EXAMPLE_AVATAR_ID = "seed-rin-ashfall";

/**
 * Which avatars this server will start calls for. The browser sends an avatarId, and anything
 * the browser sends is untrusted, so the server checks it against this list.
 *
 * Set REALTIME_AVATAR_IDS (comma separated) to your own `ava_...` ids; unset, only the example
 * avatar is allowed.
 */
export function allowedAvatarIds(raw: string | undefined): ReadonlySet<string> {
  const ids = (raw ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  return new Set(ids.length > 0 ? ids : [EXAMPLE_AVATAR_ID]);
}

/**
 * What the character knows for every call. Decided here, never by the browser: the SDK route
 * discards any persona, memory or time limit the page tries to send.
 */
export const callPolicy = {
  instructions:
    "You are Rin, a warm and curious guide. Speak in short, specific spoken sentences. " +
    "Ask one question at a time.",
  // Hard stop for each call, in seconds (max 1800). Keeps a forgotten tab from running up a bill.
  maxSeconds: 120,
} satisfies CallPolicy;

/** Refuse avatars that are not on the allowlist. Returns a Response to refuse, else nothing. */
export function refuseUnknownAvatar(avatarId: string, allowed: ReadonlySet<string>): Response | undefined {
  if (allowed.has(avatarId)) return undefined;
  return new Response(JSON.stringify({ error: "avatar not allowed", code: "avatar_not_allowed" }), {
    status: 403,
    headers: { "content-type": "application/json" },
  });
}

/**
 * The SDK route also answers GET /avatars and GET /credits (your account's avatar list and
 * balance). This page uses neither, so they are closed rather than readable by any visitor.
 */
export function refuseUnusedOperation(operation: string): Response | undefined {
  if (operation === "connect" || operation === "end") return undefined;
  return new Response(JSON.stringify({ error: "not found" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });
}

/** A clear answer for the most common setup mistake, instead of a bare 500. */
export function refuseMissingKey(apiKey: string | undefined): Response | undefined {
  if (apiKey) return undefined;
  console.error("realtime-avatar: REALTIME_AVATAR_API_KEY is not set");
  return new Response(
    JSON.stringify({
      error: "REALTIME_AVATAR_API_KEY is not set on the server. Add it as a secret, then restart or redeploy.",
      code: "internal_error",
    }),
    { status: 500, headers: { "content-type": "application/json" } },
  );
}
