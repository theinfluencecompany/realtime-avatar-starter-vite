import { getRequestListener } from "@hono/node-server";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { createApp } from "./server/app.ts";

/**
 * Serves /api/* from server/app.ts inside the Vite dev server, so `npm run dev` runs the page
 * and the API route as one process on one port (what Bolt and Replit previews expect).
 */
function realtimeAvatarApi(env: Record<string, string>): Plugin {
  return {
    name: "realtime-avatar-api",
    configureServer(server) {
      const listener = getRequestListener(createApp({ ...env, ...process.env }).fetch);
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/api/")) void listener(req, res);
        else next();
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  // "" loads every variable from .env, not only VITE_ ones. They stay on the server: only
  // VITE_-prefixed variables are ever exposed to the page.
  plugins: [react(), tailwindcss(), realtimeAvatarApi(loadEnv(mode, process.cwd(), ""))],
  server: { host: true, port: 5173 },
  preview: { host: true },
  // The lazily loaded call chunk is mostly livekit-client (WebRTC); it only loads on "Call".
  build: { chunkSizeWarningLimit: 800 },
}));
