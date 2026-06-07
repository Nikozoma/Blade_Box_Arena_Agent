"use strict";

const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT) || 8000;
const host = "0.0.0.0";
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".md": "text/plain; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const cleanUrl = decodeURIComponent(request.url.split("?")[0]);
  const relativePath = cleanUrl === "/" ? "index.html" : cleanUrl.replace(/^\/+/, "");
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(data);
  });
});

function getLanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((address) => address && address.family === "IPv4" && !address.internal)
    .map((address) => address.address);
}

server.listen(port, host, () => {
  const lanAddresses = getLanAddresses();
  console.log("Blade Box Arena PWA preview running");
  console.log(`Local URL: http://127.0.0.1:${port}`);
  if (lanAddresses.length > 0) {
    for (const address of lanAddresses) {
      console.log(`LAN URL:   http://${address}:${port}`);
    }
  } else {
    console.log(`LAN URL:   http://<your-pc-lan-ip>:${port}`);
  }
});
