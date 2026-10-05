// The server half on Node, as a Hono app. Used two ways:
//   - in development, mounted inside the Vite dev server (see vite.config.ts), so `npm run dev`
//     is one process on one port;
//   - in production, by server/node.ts, which also serves the built page.
//
// It mirrors supabase/functions/realtime-avatar/index.ts; pick whichever host you deploy to.

import { Hono } from "hono";
import { realtimeAvatarHono } from "realtime-avatar/hono";
import { allowedAvatarIds, callPolicy, refuseMissingKey, refuseUnknownAvatar, refuseUnusedOperation } from "../supabase/functions/_shared/policy.ts";

export type Env = Readonly<Record<string, string | undefined>>;

export function createApp(env: Env): Hono {
  const allowed = allowedAvatarIds(env.REALTIME_AVATAR_IDS);
  const app = new Hono();

  app.all(
    "/api/realtime-avatar/*",
    realtimeAvatarHono({
      apiKey: () => env.REALTIME_AVATAR_API_KEY ?? "",
      // Who may start a call. Open in this starter (capped at callPolicy.maxSeconds); put your
      // own sign-in check here before going public and return a 401 Response to refuse.
      authorize: ({ operation }) =>
        refuseUnusedOperation(operation) ?? refuseMissingKey(env.REALTIME_AVATAR_API_KEY),
      session: ({ avatarId }) => refuseUnknownAvatar(avatarId, allowed) ?? callPolicy,
    }),
  );

  return app;
}
