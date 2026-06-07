"use strict";

const { spawn } = require("child_process");

const port = Number(process.env.RELAY_SMOKE_PORT) || 8790;
const externalRelayUrl = String(process.env.RELAY_SMOKE_URL || "").trim();
const relayUrl = externalRelayUrl || `ws://127.0.0.1:${port}`;
const healthUrl = relayUrl.replace(/^ws:/, "http:").replace(/^wss:/, "https:").replace(/\/$/, "") + "/health";
const env = {
  ...process.env,
  RELAY_HOST: "127.0.0.1",
  RELAY_PORT: String(port)
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(healthUrl);
      const body = await response.json();
      if (body.ok) return body;
    } catch (error) {
      await wait(150);
    }
  }
  throw new Error("Relay health endpoint did not become ready");
}

function waitForMessage(socket, expectedType) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${expectedType}`)), 4000);
    socket.addEventListener("message", function onMessage(event) {
      const message = JSON.parse(String(event.data));
      if (message.type === expectedType) {
        clearTimeout(timer);
        socket.removeEventListener("message", onMessage);
        resolve(message);
      }
    });
  });
}

async function main() {
  const child = externalRelayUrl
    ? null
    : spawn(process.execPath, ["server/relay-server.js"], {
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });
  child?.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child?.stderr.on("data", (chunk) => process.stderr.write(chunk));

  try {
    await waitForHealth();
    const host = new WebSocket(relayUrl);
    await new Promise((resolve, reject) => {
      host.addEventListener("open", resolve, { once: true });
      host.addEventListener("error", reject, { once: true });
    });
    host.send(JSON.stringify({ type: "createRoom", mode: "arena" }));
    const created = await waitForMessage(host, "roomCreated");

    const client = new WebSocket(relayUrl);
    await new Promise((resolve, reject) => {
      client.addEventListener("open", resolve, { once: true });
      client.addEventListener("error", reject, { once: true });
    });
    const relayToHost = waitForMessage(host, "relay");
    client.send(JSON.stringify({
      type: "joinRoom",
      roomCode: created.roomCode,
      hello: { type: "hello", name: "Smoke" }
    }));
    await waitForMessage(client, "roomJoined");
    const relayedHello = await relayToHost;
    if (relayedHello.message?.type !== "hello") {
      throw new Error("Relay did not forward hello to host");
    }
    host.close();
    client.close();
    console.log(`[relay-smoke] ok relay=${relayUrl} room=${created.roomCode}`);
  } finally {
    child?.kill();
  }
}

main().catch((error) => {
  console.error(`[relay-smoke] failed: ${error.message}`);
  process.exit(1);
});
