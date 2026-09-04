import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize } from "node:path";
import { pathToFileURL } from "node:url";

import { executiveRequirements, rafaelProfile } from "./domain/demo-scenario.js";
import { evaluateTalent } from "./domain/evidence-engine.js";

const PORT = Number(process.env.PORT ?? 3000);
const PUBLIC_ROOT = join(process.cwd(), "public");
const MIME_TYPES: Readonly<Record<string, string>> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function safePublicPath(urlPath: string): string | null {
  const requested = urlPath === "/" ? "index.html" : urlPath.replace(/^\//, "");
  const normalizedPath = normalize(requested);
  if (normalizedPath.startsWith("..")) return null;
  return join(PUBLIC_ROOT, normalizedPath);
}

function servePublicFile(response: ServerResponse, urlPath: string): void {
  const filePath = safePublicPath(urlPath);
  if (!filePath || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    sendJson(response, 404, { error: "Recurso não encontrado", path: urlPath });
    return;
  }

  response.writeHead(200, {
    "Content-Type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
    "Cache-Control": "public, max-age=300",
  });
  createReadStream(filePath).pipe(response);
}

export function routeRequest(request: IncomingMessage, response: ServerResponse): void {
  const url = new URL(request.url ?? "/", "http://localhost");
  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { status: "ready", product: "Seekerh Signal" });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/demo") {
    sendJson(response, 200, evaluateTalent(rafaelProfile, executiveRequirements));
    return;
  }
  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Método não permitido", method: request.method });
    return;
  }
  servePublicFile(response, url.pathname);
}

export function startServer(): void {
  createServer(routeRequest).listen(PORT, "0.0.0.0", () => {
    console.log(JSON.stringify({ event: "server.started", port: PORT }));
  });
}

const entryPoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryPoint) startServer();
