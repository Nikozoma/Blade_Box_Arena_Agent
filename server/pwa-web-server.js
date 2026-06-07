"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const host = process.env.PWA_HOST || "0.0.0.0";
const port = Number(process.env.PWA_PORT || process.env.PORT) || 8000;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

if (!fs.existsSync(dist)) {
  console.error(`[pwa-web] Missing dist folder: ${dist}`);
  console.error("[pwa-web] Run npm run build:web before starting the web server.");
  process.exit(1);
}

function resolveRequestPath(requestUrl) {
  const cleanUrl = decodeURIComponent(requestUrl.split("?")[0]);
  const relativePath = cleanUrl === "/" ? "index.html" : cleanUrl.replace(/^\/+/, "");
  const requestedPath = path.resolve(dist, relativePath);
  if (!requestedPath.startsWith(dist)) return null;
  return requestedPath;
}

function sendFile(response, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }

  const requestedPath = resolveRequestPath(request.url);
  if (!requestedPath) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.stat(requestedPath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(response, requestedPath);
      return;
    }

    const hasExtension = Boolean(path.extname(requestedPath));
    if (!hasExtension) {
      sendFile(response, path.join(dist, "index.html"));
      return;
    }

    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  });
});

server.listen(port, host, () => {
  console.log(`[pwa-web] Blade Box Arena PWA serving ${dist}`);
  console.log(`[pwa-web] Listening on http://${host}:${port}`);
  console.log(`[pwa-web] LAN URL example: http://<vaio-lan-ip>:${port}`);
});
