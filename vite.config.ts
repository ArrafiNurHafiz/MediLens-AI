// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { handleApiRequest } from "./src/server/apiHandler";

export default defineConfig({
  plugins: [
    {
      name: "medilens-api-middleware",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith("/api/")) {
            const host = req.headers.host || "localhost:3333";
            const protocol = req.headers["x-forwarded-proto"] || "http";
            const fullUrl = `${protocol}://${host}${req.url}`;

            const bodyBuffer: Buffer[] = [];
            req.on("data", (chunk: Buffer) => bodyBuffer.push(chunk));
            req.on("end", async () => {
              try {
                const body = Buffer.concat(bodyBuffer);
                const headers = new Headers();
                for (const [k, v] of Object.entries(req.headers)) {
                  if (v) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
                }
                const requestInit: RequestInit = {
                  headers,
                };
                if (req.method) {
                  requestInit.method = req.method;
                }
                if (req.method !== "GET" && req.method !== "HEAD" && body.length > 0) {
                  requestInit.body = body;
                }
                const fetchReq = new Request(fullUrl, requestInit);

                const response = await handleApiRequest(fetchReq);
                if (response) {
                  res.statusCode = response.status;
                  response.headers.forEach((val, key) => res.setHeader(key, val));
                  const respBuf = await response.arrayBuffer();
                  res.end(Buffer.from(respBuf));
                  return;
                }
              } catch (e: any) {
                console.error("Middleware error:", e);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
                return;
              }
              next();
            });
            return;
          }
          next();
        });
      },
    },
  ],
  vite: {
    server: {
      allowedHosts: true,
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
