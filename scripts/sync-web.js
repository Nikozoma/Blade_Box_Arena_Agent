"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const entries = ["index.html", "styles.css", "manifest.webmanifest", "service-worker.js", "src", "assets"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const entry of entries) {
  const from = path.join(root, entry);
  const to = path.join(dist, entry);
  fs.cpSync(from, to, { recursive: true });
}

console.log(`Copied ${entries.join(", ")} to ${path.relative(root, dist)}`);
