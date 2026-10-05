# AGENTS.md

Notes for coding agents (Bolt, Replit Agent, Cursor, Codex, Claude Code) editing this starter.

- The Realtime Avatar API key (`REALTIME_AVATAR_API_KEY`) is server-only. Never read it in `src/`,
  never prefix it with `VITE_`, never send it to the browser.
- The page (`src/`) talks to a server route through `createProxyClient`; the route
  (`server/app.ts` on Node, `supabase/functions/realtime-avatar/index.ts` on Supabase) holds the key.
  Keep both routes in step: they share `supabase/functions/_shared/policy.ts`.
- Call policy (instructions, `maxSeconds`, which avatars) is decided on the server in `policy.ts`.
  Never accept it from a request body.
- The route relays the session grant verbatim. Do not wrap or reshape it.
- `<AvatarCall>` starts a call when it mounts; mount it from a click (it is lazy-loaded in `App.tsx`).
- Do not guess avatar ids. Use `seed-rin-ashfall` (public example) or an `ava_...` id from the
  user's account.
- SDK reference: https://github.com/theinfluencecompany/realtime-avatar-sdk/blob/main/AGENTS.md and https://realtimeavatar.ai/llms.txt
