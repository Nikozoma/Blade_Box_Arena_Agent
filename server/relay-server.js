"use strict";

const http = require("http");
const { WebSocket, WebSocketServer } = require("ws");

const host = process.env.RELAY_HOST || "0.0.0.0";
const port = Number(process.env.RELAY_PORT || process.env.PORT) || 8787;
const maxRoomSize = Math.max(2, Number(process.env.RELAY_ROOM_SIZE) || 4);
const rooms = new Map();
const allowedTickRates = new Set([50, 60, 70, 80, 90, 100]);
const defaultTickRate = 70;
const maxChatMessages = 40;
const maxChatLength = 140;

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
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function sanitizeText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

function sanitizeTickRate(value) {
  const rate = Number(value);
  return allowedTickRates.has(rate) ? rate : defaultTickRate;
}

function roomSummary(room) {
  return {
    roomCode: room.code,
    clients: room.clients.size + (room.host ? 1 : 0),
    maxRoomSize,
    hasHost: Boolean(room.host),
    mode: room.mode,
    roomName: room.roomName,
    tickRate: room.tickRate
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

function getLobbyPlayers(room) {
  const players = [];
  if (room.host) {
    players.push({
      clientId: "host",
      name: room.host.displayName || "Player 1",
      host: true
    });
  }
  for (const [clientId, client] of room.clients.entries()) {
    players.push({
      clientId,
      name: client.displayName || "Player",
      host: false
    });
  }
  return players;
}

function createLobbyState(room) {
  return {
    type: "lobbyState",
    roomCode: room.code,
    mode: room.mode,
    roomName: room.roomName,
    tickRate: room.tickRate,
    players: getLobbyPlayers(room),
    chat: room.chat.slice(-maxChatMessages),
    started: Boolean(room.started)
  };
}

function broadcastLobbyState(room) {
  const state = createLobbyState(room);
  send(room.host, state);
  for (const client of room.clients.values()) {
    send(client, state);
  }
}

function broadcastChat(room, entry) {
  send(room.host, { type: "lobbyChat", message: entry });
  for (const client of room.clients.values()) {
    send(client, { type: "lobbyChat", message: entry });
  }
}

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
    room.chat.push({ sender: "System", text: `${socket.displayName || socket.clientId} left the lobby.`, system: true, at: Date.now() });
    room.chat = room.chat.slice(-maxChatMessages);
    broadcastLobbyState(room);
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
  socket.displayName = sanitizeText(message.name, 36) || "Player 1";
  const room = {
    code,
    host: socket,
    clients: new Map(),
    mode: message.mode || "arena",
    roomName: sanitizeText(message.roomName, 40),
    tickRate: sanitizeTickRate(message.tickRate),
    chat: [],
    started: false,
    createdAt: Date.now()
  };
  room.chat.push({ sender: "System", text: "Room created.", system: true, at: Date.now() });
  rooms.set(code, room);
  send(socket, { type: "roomCreated", roomCode: code, clientId: socket.clientId, lobbyState: createLobbyState(room) });
  broadcastLobbyState(room);
  console.log(`[relay] room ${code} created`);
}

function handleJoinRoom(socket, message) {
  const code = String(message.roomCode || "").trim().toUpperCase();
  const room = rooms.get(code);
  if (!room || !room.host || room.host.readyState !== WebSocket.OPEN) {
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
  socket.displayName = sanitizeText(message.name, 36) || "Player";
  room.clients.set(clientId, socket);
  room.chat.push({ sender: "System", text: `${socket.displayName} joined the lobby.`, system: true, at: Date.now() });
  room.chat = room.chat.slice(-maxChatMessages);
  send(socket, { type: "roomJoined", roomCode: code, clientId, lobbyState: createLobbyState(room) });
  send(room.host, {
    type: "relay",
    clientId,
    message: message.hello || { type: "hello", name: message.name || "Player" }
  });
  broadcastLobbyState(room);
  console.log(`[relay] ${clientId} joined room ${code}`);
}

function handleRelay(socket, message) {
  const room = rooms.get(socket.roomCode || message.roomCode);
  if (!room) {
    send(socket, { type: "error", reason: "Room not found." });
    return;
  }
  if (socket.role === "host" && message.message?.type === "start") {
    room.started = true;
    broadcastLobbyState(room);
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

function handleChat(socket, message) {
  const room = rooms.get(socket.roomCode || message.roomCode);
  if (!room) {
    send(socket, { type: "error", reason: "Room not found." });
    return;
  }
  const text = sanitizeText(message.text, maxChatLength);
  if (!text) return;
  const entry = {
    sender: socket.role === "host" ? "Host" : socket.displayName || socket.clientId || "Player",
    text,
    at: Date.now()
  };
  room.chat.push(entry);
  room.chat = room.chat.slice(-maxChatMessages);
  broadcastChat(room, entry);
  broadcastLobbyState(room);
}

function handleUpdateLobbySettings(socket, message) {
  const room = rooms.get(socket.roomCode || message.roomCode);
  if (!room) {
    send(socket, { type: "error", reason: "Room not found." });
    return;
  }
  if (socket.role !== "host" || room.host !== socket) {
    send(socket, { type: "error", reason: "Only the host can change lobby settings." });
    return;
  }
  if (message.mode) room.mode = sanitizeText(message.mode, 24) || room.mode;
  room.roomName = sanitizeText(message.roomName, 40);
  room.tickRate = sanitizeTickRate(message.tickRate);
  broadcastLobbyState(room);
}

function handleKickClient(socket, message) {
  const room = rooms.get(socket.roomCode || message.roomCode);
  if (!room) {
    send(socket, { type: "error", reason: "Room not found." });
    return;
  }
  if (socket.role !== "host" || room.host !== socket) {
    send(socket, { type: "error", reason: "Only the host can remove players." });
    return;
  }
  const target = room.clients.get(message.targetClientId);
  if (!target) return;
  const targetName = target.displayName || target.clientId;
  send(target, { type: "kicked", reason: "Removed from room" });
  target.close();
  room.clients.delete(message.targetClientId);
  room.chat.push({ sender: "System", text: `${targetName} was removed from the lobby.`, system: true, at: Date.now() });
  room.chat = room.chat.slice(-maxChatMessages);
  broadcastLobbyState(room);
}

function handleStartMatch(socket, message) {
  const room = rooms.get(socket.roomCode || message.roomCode);
  if (!room) {
    send(socket, { type: "error", reason: "Room not found." });
    return;
  }
  if (socket.role !== "host" || room.host !== socket) {
    send(socket, { type: "error", reason: "Only the host can start the match." });
    return;
  }
  room.started = true;
  broadcastLobbyState(room);
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
    } else if (message.type === "chat") {
      handleChat(socket, message);
    } else if (message.type === "updateLobbySettings") {
      handleUpdateLobbySettings(socket, message);
    } else if (message.type === "kickClient") {
      handleKickClient(socket, message);
    } else if (message.type === "startMatch") {
      handleStartMatch(socket, message);
    } else if (message.type === "disconnectPeer") {
      const room = rooms.get(socket.roomCode || message.roomCode);
      const target = room?.clients.get(message.targetClientId);
      if (target && socket.role === "host" && room.host === socket) target.close();
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
