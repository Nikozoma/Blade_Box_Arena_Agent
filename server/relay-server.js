"use strict";

const http = require("http");
const { WebSocketServer } = require("ws");

const host = process.env.RELAY_HOST || "0.0.0.0";
const port = Number(process.env.RELAY_PORT || process.env.PORT) || 8787;
const maxRoomSize = Math.max(2, Number(process.env.RELAY_ROOM_SIZE) || 4);
const rooms = new Map();

function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let code = "";
    for (let i = 0; i < 5; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    if (!rooms.has(code)) return code;
  }
  return String(Date.now()).slice(-5);
}

function send(socket, message) {
  if (socket?.readyState === socket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function roomSummary(room) {
  return {
    roomCode: room.code,
    clients: room.clients.size + (room.host ? 1 : 0),
    maxRoomSize,
    hasHost: Boolean(room.host)
  };
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  response.setHeader("Access-Control-Allow-Origin", process.env.RELAY_CORS_ORIGIN || "*");
  response.setHeader("Access-Control-Allow-Headers", "content-type");
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }
  if (url.pathname === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      ok: true,
      service: "blade-box-arena-relay",
      rooms: rooms.size,
      uptime: Math.round(process.uptime())
    }));
    return;
  }
  if (url.pathname === "/rooms") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ rooms: [...rooms.values()].map(roomSummary) }));
    return;
  }
  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ ok: false, error: "Not found" }));
});

const wss = new WebSocketServer({ server });
let nextClientId = 1;

function cleanupSocket(socket) {
  const room = socket.roomCode ? rooms.get(socket.roomCode) : null;
  if (!room) return;
  if (room.host === socket) {
    for (const client of room.clients.values()) {
      send(client, { type: "peerDisconnected", clientId: socket.clientId, reason: "Host disconnected" });
      client.close();
    }
    rooms.delete(room.code);
    console.log(`[relay] room ${room.code} closed; host disconnected`);
    return;
  }
  if (socket.clientId && room.clients.delete(socket.clientId)) {
    send(room.host, { type: "peerDisconnected", clientId: socket.clientId });
    console.log(`[relay] ${socket.clientId} left room ${room.code}`);
  }
  if (!room.host && room.clients.size === 0) {
    rooms.delete(room.code);
  }
}

function handleCreateRoom(socket, message) {
  const code = createRoomCode();
  socket.clientId = "host";
  socket.roomCode = code;
  socket.role = "host";
  rooms.set(code, {
    code,
    host: socket,
    clients: new Map(),
    mode: message.mode || "arena",
    createdAt: Date.now()
  });
  send(socket, { type: "roomCreated", roomCode: code, clientId: socket.clientId });
  console.log(`[relay] room ${code} created`);
}

function handleJoinRoom(socket, message) {
  const code = String(message.roomCode || "").trim().toUpperCase();
  const room = rooms.get(code);
  if (!room || !room.host || room.host.readyState !== room.host.OPEN) {
    send(socket, { type: "error", reason: "Room not found or host unavailable." });
    return;
  }
  if (room.clients.size + 1 >= maxRoomSize) {
    send(socket, { type: "error", reason: "Room is full." });
    return;
  }
  const clientId = `c${nextClientId += 1}`;
  socket.clientId = clientId;
  socket.roomCode = code;
  socket.role = "client";
  room.clients.set(clientId, socket);
  send(socket, { type: "roomJoined", roomCode: code, clientId });
  send(room.host, {
    type: "relay",
    clientId,
    message: message.hello || { type: "hello", name: message.name || "Player" }
  });
  console.log(`[relay] ${clientId} joined room ${code}`);
}

function handleRelay(socket, message) {
  const room = rooms.get(socket.roomCode || message.roomCode);
  if (!room) {
    send(socket, { type: "error", reason: "Room not found." });
    return;
  }
  if (socket.role === "host") {
    if (message.targetClientId) {
      send(room.clients.get(message.targetClientId), {
        type: "relay",
        clientId: "host",
        message: message.message
      });
      return;
    }
    for (const client of room.clients.values()) {
      send(client, { type: "relay", clientId: "host", message: message.message });
    }
    return;
  }
  send(room.host, { type: "relay", clientId: socket.clientId, message: message.message });
}

wss.on("connection", (socket) => {
  socket.isAlive = true;
  socket.on("pong", () => {
    socket.isAlive = true;
  });
  socket.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(String(data));
    } catch (error) {
      send(socket, { type: "error", reason: "Invalid JSON." });
      return;
    }
    if (message.type === "createRoom") {
      handleCreateRoom(socket, message);
    } else if (message.type === "joinRoom") {
      handleJoinRoom(socket, message);
    } else if (message.type === "relay") {
      handleRelay(socket, message);
    } else if (message.type === "disconnectPeer") {
      const room = rooms.get(socket.roomCode || message.roomCode);
      const target = room?.clients.get(message.targetClientId);
      if (target) target.close();
    } else {
      send(socket, { type: "error", reason: `Unknown message type: ${message.type || "missing"}` });
    }
  });
  socket.on("close", () => cleanupSocket(socket));
});

setInterval(() => {
  for (const socket of wss.clients) {
    if (!socket.isAlive) {
      socket.terminate();
      continue;
    }
    socket.isAlive = false;
    socket.ping();
  }
}, 30000).unref();

server.listen(port, host, () => {
  console.log(`[relay] Blade Box Arena relay listening on ws://${host}:${port}`);
  console.log(`[relay] health endpoint http://${host}:${port}/health`);
});
