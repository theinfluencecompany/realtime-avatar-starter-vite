# Realtime Avatar starter (Vite + React)

A live AI avatar call in a Vite + React + TypeScript + Tailwind app, built on the
[`realtime-avatar`](https://www.npmjs.com/package/realtime-avatar) SDK. Press **Call**, allow the
microphone, and talk: the avatar listens the whole time and stops when you interrupt.

It runs on a public example avatar (`seed-rin-ashfall`), so a fresh API key is all you need.

[Open in Bolt](https://bolt.new/~/github.com/theinfluencecompany/realtime-avatar-starter-vite) ·
[Import to Replit](https://replit.com/github.com/theinfluencecompany/realtime-avatar-starter-vite) ·
[Guide for Lovable, Bolt, v0 and Replit](https://realtimeavatar.ai/docs/ai-app-builders)

## How it works

Two halves, and the API key only ever lives in one of them:

```
browser (src/)  ──POST /connect──▶  your server route  ──▶  Realtime Avatar API
  <AvatarCall>                       holds the API key,
                ◀── session grant ──  decides the call
        ◀────────────── live audio + video (WebRTC) ──────────────▶
```

- **Page** (`src/`): `<AvatarCall>` from `realtime-avatar/react`. It asks your route to start a
  call, joins the room, and handles the queue, microphone and autoplay states.
- **Server route**: `realtimeAvatarHono` from `realtime-avatar/hono` holds the key, starts the call
  and relays the session grant back unchanged. Two ready-made hosts, pick one:

| Host | File | Used by |
| --- | --- | --- |
| Supabase Edge Function (Deno) | `supabase/functions/realtime-avatar/index.ts` | Lovable Cloud, Bolt + Supabase, any Supabase project |
| Node (Hono), same port as the page | `server/app.ts` (dev: inside Vite; prod: `server/node.ts`) | Bolt, Replit, local, any Node host |

Both read the same policy from `supabase/functions/_shared/policy.ts`: which avatars may be called,
the character's instructions, and a 120 second cap per call.

The page picks the route automatically: `VITE_REALTIME_AVATAR_PROXY_URL` if set, else the
Supabase function if `VITE_SUPABASE_URL` is set, else `/api/realtime-avatar` on the same origin.

## Run it locally

```bash
cp .env.example .env        # then paste your key into REALTIME_AVATAR_API_KEY
npm install
npm run dev                 # page + API route on http://localhost:5173
```

Get a key at [Settings, API keys](https://realtimeavatar.ai/platform/settings#api-keys). The
microphone needs `https` or `http://localhost`.

Production: `npm run build && npm start` serves `dist/` and the API route from one Node process
(port `$PORT`, default 5173).

## Environment variables

| Name | Where | Required | What |
| --- | --- | --- | --- |
| `REALTIME_AVATAR_API_KEY` | server only | yes | Your API key. Never prefix it with `VITE_`, which would ship it to the browser. |
| `REALTIME_AVATAR_IDS` | server | no | Comma separated avatar ids the server may call. Default: the example avatar only. |
| `VITE_REALTIME_AVATAR_ID` | page | no | The avatar the page calls (must also be in `REALTIME_AVATAR_IDS`). |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | page | no | Use the Supabase Edge Function. Lovable sets these for you. |
| `VITE_REALTIME_AVATAR_PROXY_URL` | page | no | Use a route hosted anywhere else. |

## Per builder

**Bolt.new.** [Open this repo in Bolt](https://bolt.new/~/github.com/theinfluencecompany/realtime-avatar-starter-vite),
create a `.env` file with `REALTIME_AVATAR_API_KEY=...`, and restart the dev server. Bolt's preview
runs Node inside your browser tab; if **Call** fails with a network error there, connect Supabase in
Bolt and use the Edge Function below instead.

**Replit.** [Import this repo](https://replit.com/github.com/theinfluencecompany/realtime-avatar-starter-vite),
add `REALTIME_AVATAR_API_KEY` in the **Secrets** tool, and press **Run**. To publish, deploy with
build `npm run build` and run `npm start` (already set in `.replit`).

**Lovable.** Lovable cannot import a GitHub repo, so it builds the same thing from a prompt. The
copy-paste prompt and the secret steps are in the
[guide](https://realtimeavatar.ai/docs/ai-app-builders#lovable). This repo's Edge Function is the
reference for a Vite project on Lovable Cloud.

**v0.** v0 builds Next.js apps; use the Next.js prompt in the
[guide](https://realtimeavatar.ai/docs/ai-app-builders#v0) and set `REALTIME_AVATAR_API_KEY` in the
**Vars** panel.

### Supabase Edge Function

```bash
supabase functions deploy realtime-avatar
supabase secrets set REALTIME_AVATAR_API_KEY=your_key
```

Then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`) for
the page. `supabase/config.toml` turns off JWT verification for this one function, because the
gateway would otherwise reject the browser's CORS preflight; the function runs its own checks.

## Before you go public

This starter lets anyone who can open the page start a call (each capped at 120 seconds, only on
allowlisted avatars). Every call spends your balance, so before you share the link:

1. Require a signed-in user in `authorize` (both servers have a comment showing where).
2. Set `maxSeconds` in `policy.ts` to what you are willing to pay for per call.
3. Put your own avatar ids in `REALTIME_AVATAR_IDS`.

Pricing: the free Sandbox plan includes 17 minutes of realtime; paid plans start at $9/month
for 120 minutes. See [realtimeavatar.ai/pricing](https://realtimeavatar.ai/pricing).

## Your own character

Create an avatar from one portrait at [realtimeavatar.ai/platform/avatars](https://realtimeavatar.ai/platform/avatars),
then put its `ava_...` id in `VITE_REALTIME_AVATAR_ID` and `REALTIME_AVATAR_IDS`, and swap the
`poster` and `idleVideoUrl` in `src/avatar.ts` for your avatar's own (or remove them).

## Learn more

- [Quickstart](https://realtimeavatar.ai/docs/quickstart) and [Authentication](https://realtimeavatar.ai/docs/authentication)
- [SDK on GitHub](https://github.com/theinfluencecompany/realtime-avatar-sdk) and its [AGENTS.md](https://github.com/theinfluencecompany/realtime-avatar-sdk/blob/main/AGENTS.md)
- [llms.txt](https://realtimeavatar.ai/llms.txt) for coding agents

## License

MIT
