// Production server: the built page (dist/) plus the API route, on one port.
//   npm run build && npm start
import { existsSync } from "node:fs";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createApp } from "./app.ts";

// Hosts like Replit inject secrets as environment variables; locally they come from .env.
if (existsSync(".env")) process.loadEnvFile(".env");

const app = createApp(process.env);
app.use("/*", serveStatic({ root: "./dist" }));
app.get("*", serveStatic({ path: "./dist/index.html" })); // single-page app fallback

const port = Number(process.env.PORT ?? 5173) // same port as `npm run dev`, so one port mapping covers both;
serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
  console.log(`Realtime Avatar starter on http://localhost:${info.port}`);
});
