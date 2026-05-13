"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 900;
let WIDTH = DESIGN_WIDTH;
let HEIGHT = DESIGN_HEIGHT;
let RENDER_SCALE = 1;
let RENDER_OFFSET_X = 0;
let RENDER_OFFSET_Y = 0;
const ARENA = {
  x: 0,
  y: 0,
  width: 3360,
  height: 2400,
  wall: 40
};

const STATE = {
  MENU: "menu",
  SHOP: "shop",
  EQUIPMENT: "equipment",
  HOST_LOBBY: "hostLobby",
  JOIN_LOBBY: "joinLobby",
  PLAYING: "playing",
  OPTIONS: "options",
  LEVEL_UP: "levelUp",
  GAME_OVER: "gameOver"
};

const SESSION = {
  SINGLE: "single",
  HOST: "host",
  CLIENT: "client"
};

const GAME_MODE = {
  ARENA: "arena",
  MAZE: "maze",
  DUNGEON: "dungeon"
};

const GAME_MODE_DEFINITIONS = [
  { id: GAME_MODE.ARENA, label: "Arena", detail: "Classic survival waves" },
  { id: GAME_MODE.MAZE, label: "Maze", detail: "Find portals, climb floors" },
  { id: GAME_MODE.DUNGEON, label: "Dungeon", detail: "Recover relic, escape" }
];

const ZOOM_OPTIONS = [
  { id: "normal", label: "Normal", scale: 1 },
  { id: "close", label: "Close 1.5x", scale: 1.5 },
  { id: "veryClose", label: "Very Close 2x", scale: 2 }
];

const SWORD_TIERS = [
  { name: "No Tier", cost: 0, damage: 1, speed: 1 },
  { name: "Sword Tier I", cost: 18, damage: 2, speed: 1 },
  { name: "Sword Tier II", cost: 55, damage: 3, speed: 2 },
  { name: "Sword Tier III", cost: 130, damage: 5, speed: 3 }
];

const WEAPON_DEFINITIONS = [
  {
    id: "balancedSword",
    name: "Balanced Sword",
    description: "Reliable starter blade with the original sword feel.",
    category: "fast",
    cost: 0,
    damageMultiplier: 1,
    cooldown: 0.38,
    range: 74,
    halfArc: Math.PI * 0.36,
    swingDuration: 0.14,
    visualReach: 74
  },
  {
    id: "quickKnife",
    name: "Quick Knife",
    description: "Very fast, very close range.",
    category: "fast",
    cost: 10,
    damageMultiplier: 0.58,
    cooldown: 0.2,
    range: 48,
    halfArc: Math.PI * 0.28,
    swingDuration: 0.08,
    visualReach: 48
  },
  {
    id: "shortSword",
    name: "Short Sword",
    description: "Fast short blade with light damage.",
    category: "fast",
    cost: 16,
    damageMultiplier: 0.75,
    cooldown: 0.27,
    range: 58,
    halfArc: Math.PI * 0.32,
    swingDuration: 0.1,
    visualReach: 58
  },
  {
    id: "duelistRapier",
    name: "Duelist Rapier",
    description: "Quick thrusts with narrow reach.",
    category: "fast",
    cost: 24,
    damageMultiplier: 0.88,
    cooldown: 0.3,
    range: 70,
    halfArc: Math.PI * 0.24,
    swingDuration: 0.11,
    visualReach: 70
  },
  {
    id: "twinDaggers",
    name: "Twin Daggers",
    description: "Short flurry weapon with wide coverage.",
    category: "fast",
    cost: 34,
    damageMultiplier: 0.68,
    cooldown: 0.22,
    range: 54,
    halfArc: Math.PI * 0.42,
    swingDuration: 0.09,
    visualReach: 54
  },
  {
    id: "longsword",
    name: "Longsword",
    description: "Slower, heavier sword with long reach.",
    category: "long",
    cost: 28,
    damageMultiplier: 1.35,
    cooldown: 0.52,
    range: 96,
    halfArc: Math.PI * 0.4,
    swingDuration: 0.18,
    visualReach: 96
  },
  {
    id: "spear",
    name: "Spear",
    description: "Long narrow poke for controlled spacing.",
    category: "long",
    cost: 40,
    damageMultiplier: 1.18,
    cooldown: 0.46,
    range: 112,
    halfArc: Math.PI * 0.22,
    swingDuration: 0.16,
    visualReach: 112
  },
  {
    id: "battleAxe",
    name: "Battle Axe",
    description: "Heavy sweeping hits with high damage.",
    category: "long",
    cost: 62,
    damageMultiplier: 1.62,
    cooldown: 0.68,
    range: 92,
    halfArc: Math.PI * 0.46,
    swingDuration: 0.22,
    visualReach: 92
  },
  {
    id: "warHammer",
    name: "War Hammer",
    description: "Slow crushing blow with the highest damage.",
    category: "long",
    cost: 82,
    damageMultiplier: 2,
    cooldown: 0.86,
    range: 84,
    halfArc: Math.PI * 0.34,
    swingDuration: 0.26,
    visualReach: 84
  },
  {
    id: "halberd",
    name: "Halberd",
    description: "Long heavy weapon with a broad cleave.",
    category: "long",
    cost: 100,
    damageMultiplier: 1.55,
    cooldown: 0.62,
    range: 118,
    halfArc: Math.PI * 0.36,
    swingDuration: 0.22,
    visualReach: 118
  }
];
const DEFAULT_WEAPON_ID = WEAPON_DEFINITIONS[0].id;

const MAGIC_DEFINITIONS = [
  {
    id: "fire",
    name: "Fire",
    shortName: "FIRE",
    description: "Burns enemies over time.",
    cost: 22,
    cooldown: 10,
    range: 118,
    radius: 82,
    color: "#ff6b35",
    effect: "burn",
    duration: 3,
    tickDamage: 0.7
  },
  {
    id: "water",
    name: "Water",
    shortName: "WATER",
    description: "Slows enemy movement.",
    cost: 26,
    cooldown: 10,
    range: 116,
    radius: 88,
    color: "#75d7ff",
    effect: "slow",
    duration: 4,
    slowMultiplier: 0.45
  },
  {
    id: "electric",
    name: "Electric",
    shortName: "VOLT",
    description: "Briefly stuns enemies.",
    cost: 34,
    cooldown: 10,
    range: 110,
    radius: 78,
    color: "#f7e967",
    effect: "stun",
    duration: 1.25
  },
  {
    id: "ground",
    name: "Ground",
    shortName: "ROOT",
    description: "Roots enemies in place.",
    cost: 38,
    cooldown: 10,
    range: 102,
    radius: 92,
    color: "#9f7a46",
    effect: "root",
    duration: 1.9
  }
];

const NETWORK_PORT = 7777;
const DISCOVERY_PORT = 7778;
const MAX_COOP_PLAYERS = 4;
const SNAPSHOT_RATE_OPTIONS = [45, 60];
const DEFAULT_HOST_SNAPSHOT_RATE = 45;
const INPUT_SEND_INTERVAL = 1 / 30;
const REMOTE_ENTITY_SMOOTHING = 18;
const LOCAL_CORRECTION_THRESHOLD = 52;
const LOCAL_HARD_CORRECTION_THRESHOLD = 180;
const CHEST_OPEN_DISTANCE = 46;
const CHEST_REWARD_XP = 4;
const PLAYER_COLORS = ["#75d7ff", "#ff9f1c", "#8de85c", "#ef476f"];
const PLAYER_SPAWNS = [
  { col: 42, row: 30 },
  { col: 40, row: 31 },
  { col: 44, row: 31 },
  { col: 42, row: 33 }
];

const SPRITES = {
  adventurer: {
    frameWidth: 96,
    frameHeight: 80,
    scale: 1.45,
    idle: loadDirectionalImages("assets/adventurer/idle"),
    run: loadDirectionalImages("assets/adventurer/run"),
    attack: loadDirectionalImages("assets/adventurer/attack")
  },
  enemies: {
    skeleton1: {
      image: loadImage("assets/enemies/skeleton1_movement.png"),
      frameWidth: 32,
      frameHeight: 32,
      frames: 10,
      scale: 1.75
    },
    skeleton2: {
      image: loadImage("assets/enemies/skeleton2_movement.png"),
      frameWidth: 32,
      frameHeight: 32,
      frames: 10,
      scale: 1.75
    },
    vampire: {
      image: loadImage("assets/enemies/vampire_movement.png"),
      frameWidth: 32,
      frameHeight: 32,
      frames: 8,
      scale: 1.75
    }
  },
  dungeon: {
    tileset: loadImage("assets/dungeon/tileset.png"),
    torchFrames: [
      loadImage("assets/dungeon/props/torch_1.png"),
      loadImage("assets/dungeon/props/torch_2.png"),
      loadImage("assets/dungeon/props/torch_3.png"),
      loadImage("assets/dungeon/props/torch_4.png")
    ],
    chest: loadImage("assets/dungeon/props/chest.png")
  },
  bitlands: {
    tileset: loadImage("assets/bitlands/tileset.png"),
    torch: loadImage("assets/bitlands/objects/torch.png"),
    chest: loadImage("assets/bitlands/objects/chest_1.png"),
    chestOpen: loadImage("assets/bitlands/objects/chest_2.png"),
    barrel: loadImage("assets/bitlands/objects/barrel_1.png"),
    banner: loadImage("assets/bitlands/objects/banner_1.png")
  },
  vfx: {
    electricShield: {
      image: loadImage("assets/vfx/electric_shield.png"),
      frameWidth: 265,
      frameHeight: 265,
      columns: 6,
      frames: 30,
      scale: 0.34
    }
  }
};

const TILE = {
  sourceSize: 16,
  drawSize: 40,
  floor: [
    { col: 20, row: 3, name: "floor_plain" },
    { col: 21, row: 3, name: "floor_plain_alt" },
    { col: 22, row: 3, name: "floor_smooth" },
    { col: 19, row: 4, name: "floor_edge_worn" },
    { col: 20, row: 4, name: "floor_crack_small" },
    { col: 21, row: 4, name: "floor_crack_tall" }
  ],
  wall: {
    top: { col: 19, row: 1, name: "wall_top" },
    bottom: { col: 19, row: 6, name: "wall_bottom" },
    left: { col: 18, row: 3, name: "wall_left" },
    right: { col: 24, row: 3, name: "wall_right" },
    corner: { col: 18, row: 2, name: "wall_corner" },
    fill: [
      { col: 19, row: 2, name: "wall_fill_a" },
      { col: 20, row: 2, name: "wall_fill_b" },
      { col: 21, row: 2, name: "wall_fill_c" },
      { col: 22, row: 2, name: "wall_fill_d" }
    ]
  },
  voidColor: "#111721"
};

let DUNGEON_MAP = createDungeonMap();

const MAP = {
  cols: DUNGEON_MAP[0].length,
  rows: DUNGEON_MAP.length,
  tileSize: TILE.drawSize
};

const ENVIRONMENT_PROPS = [
  { type: "torch", col: 35, row: 27, scale: 2.0 },
  { type: "torch", col: 48, row: 27, scale: 2.0 },
  { type: "torch", col: 35, row: 36, scale: 2.0 },
  { type: "torch", col: 48, row: 36, scale: 2.0 },
  { type: "torch", col: 11, row: 7, scale: 2.0 },
  { type: "torch", col: 70, row: 9, scale: 2.0 },
  { type: "torch", col: 12, row: 50, scale: 2.0 },
  { type: "torch", col: 72, row: 51, scale: 2.0 },
  { type: "barrel", col: 13, row: 25, scale: 2.0 },
  { type: "barrel", col: 61, row: 29, scale: 2.0 },
  { type: "banner", col: 41, row: 26, scale: 2.0 },
  { type: "banner", col: 43, row: 26, scale: 2.0 }
];

const CHEST_SPAWN_CANDIDATES = [
  { col: 8, row: 8 },
  { col: 74, row: 10 },
  { col: 8, row: 31 },
  { col: 50, row: 52 }
];

const UPGRADE_POOL = [
  {
    id: "maxHp",
    title: "+20% Max HP",
    detail: "Raise max HP now.",
    apply: () => {
      applyUpgradeToPlayer(player, "maxHp");
    }
  },
  {
    id: "heal",
    title: "Heal 20% HP",
    detail: "Recover health now.",
    apply: () => {
      applyUpgradeToPlayer(player, "heal");
    }
  },
  {
    id: "damage",
    title: "+20% Sword Damage",
    detail: "Every hit hurts more.",
    apply: () => {
      applyUpgradeToPlayer(player, "damage");
    }
  },
  {
    id: "attackSpeed",
    title: "+20% Attack Speed",
    detail: "Recover between swings faster.",
    apply: () => {
      applyUpgradeToPlayer(player, "attackSpeed");
    }
  },
  {
    id: "moveSpeed",
    title: "+20% Move Speed",
    detail: "Move faster.",
    apply: () => {
      applyUpgradeToPlayer(player, "moveSpeed");
    }
  }
];

const keys = new Set();
const mouse = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  down: false
};
const MOBILE_JOYSTICK_MAX_RADIUS = 37;
const MOBILE_JOYSTICK_DEAD_ZONE = 16;
const MOBILE_DEBUG_OVERLAY = typeof window !== "undefined"
  && window.location
  && typeof URLSearchParams !== "undefined"
  && new URLSearchParams(window.location.search).has("debugTouch");
const mobileInput = {
  move: createJoystickState(),
  aim: createJoystickState(),
  attackActive: false
};
const NativeLocalNetwork = getNativeLocalNetworkPlugin();
const settings = {
  zoom: loadSavedZoom()
};

const permanent = loadPermanentProgress();

let gameState = STATE.MENU;
let player;
let players = [];
let enemies = [];
let xpOrbs = [];
let pickups = [];
let chests = [];
let effects = [];
let wave = 1;
let finalWave = 1;
let nextWaveTimer = 0;
let levelUpChoices = [];
let coopLevelMenuOpen = false;
let activeCoopLevelOfferId = null;
let lastTime = 0;
let flowField = [];
let flowFieldsByPlayer = new Map();
let flowFieldTimer = 0;
let enemyIdCounter = 0;
let camera = { x: 0, y: 0 };
let menuButton;
let shopButton;
let equipmentButton;
let hostButton;
let joinButton;
let modeButtons = [];
let shopBackButton;
let shopPurchaseButtons = [];
let weaponSelectButtons = [];
let magicPurchaseButtons = [];
let equipmentWeaponButtons = [];
let equipmentMagicButtons = [];
let equipmentBackButton;
let levelUpButtons = [];
let gameOverButton;
let settingsButton;
let magicButtons = [];
let optionsButtons = [];
let hostLobbyButtons = {};
let joinLobbyButtons = {};
let levelUpButton;
let touchInputSeen = false;
let previousGameState = STATE.MENU;
let sessionMode = SESSION.SINGLE;
let localPlayerId = "p1";
let lobbyPlayers = [];
let pendingClientIds = new Set();
let remoteInputs = new Map();
let clientIdToPlayerId = new Map();
let hostIpAddress = "Unavailable";
let networkStatus = NativeLocalNetwork ? "Ready" : "Android APK required for local WiFi co-op";
let joinHostAddress = loadLastHostAddress();
let joinPort = NETWORK_PORT;
let discoveredLobbies = [];
let snapshotTimer = 0;
let hostSnapshotRate = DEFAULT_HOST_SNAPSHOT_RATE;
let inputSendTimer = 0;
let rewardEventCounter = 0;
let levelOfferCounter = 0;
let inputSequence = 0;
let selectedGameMode = GAME_MODE.ARENA;
let currentGameMode = GAME_MODE.ARENA;
let modeState = createModeState(GAME_MODE.ARENA, { seed: 1 });
let modeChoiceButtons = [];
let lastAppliedMapKey = "";
const appliedRewardEvents = new Set();
const appliedUnlockEvents = new Set();
const networkDebug = {
  timer: 0,
  snapshotsIn: 0,
  snapshotsOut: 0,
  snapshotInRate: 0,
  snapshotOutRate: 0,
  bytesIn: 0,
  bytesOut: 0,
  lastBytesIn: 0,
  lastBytesOut: 0
};

resizeCanvasToDisplaySize(true);

function createPlayer(id = "p1", name = "Player 1", spawnIndex = 0, swordTier = permanent.swordTier, weaponId = permanent.weaponId, magicIds = permanent.equippedMagicIds) {
  const spawn = getPlayerSpawnTile(spawnIndex);
  const start = tileToWorld(spawn.col, spawn.row);
  const equippedMagicIds = sanitizeEquippedMagicIds(magicIds);
  return {
    id,
    name,
    x: start.x,
    y: start.y,
    size: 28,
    speed: 235,
    maxHealth: 100,
    health: 100,
    angle: 0,
    level: 1,
    xp: 0,
    xpToNext: 6,
    damageMultiplier: 1,
    attackSpeedMultiplier: 1,
    attackCooldown: 0,
    attackTimer: 0,
    attackDuration: 0.14,
    invulnerableTimer: 0,
    shieldActive: false,
    dualSwordTimer: 0,
    moving: false,
    connected: true,
    color: PLAYER_COLORS[spawnIndex % PLAYER_COLORS.length],
    swordTier: clamp(Math.round(swordTier || 0), 0, SWORD_TIERS.length - 1),
    weaponId: getWeaponById(weaponId).id,
    equippedMagicIds,
    magicCooldowns: Object.fromEntries(equippedMagicIds.map((magicId) => [magicId, 0])),
    pendingLevelUps: 0,
    activeLevelOffer: null
  };
}

function createJoystickState() {
  return {
    pointerId: null,
    originX: 0,
    originY: 0,
    thumbX: 0,
    thumbY: 0,
    vectorX: 0,
    vectorY: 0,
    active: false
  };
}

function resizeCanvasToDisplaySize(force = false) {
  const rect = canvas.getBoundingClientRect();
  const displayWidth = Math.max(320, Math.round(rect.width || canvas.clientWidth || DESIGN_WIDTH));
  const displayHeight = Math.max(240, Math.round(rect.height || canvas.clientHeight || DESIGN_HEIGHT));
  const aspect = displayWidth / displayHeight;
  const designAspect = DESIGN_WIDTH / DESIGN_HEIGHT;
  const nextScale = aspect >= designAspect ? displayHeight / DESIGN_HEIGHT : displayWidth / DESIGN_WIDTH;
  const nextWidth = displayWidth / nextScale;
  const nextHeight = displayHeight / nextScale;
  const changed = canvas.width !== displayWidth
    || canvas.height !== displayHeight
    || Math.abs(WIDTH - nextWidth) > 0.5
    || Math.abs(HEIGHT - nextHeight) > 0.5
    || Math.abs(RENDER_SCALE - nextScale) > 0.0001;

  if (!force && !changed) return false;

  canvas.width = displayWidth;
  canvas.height = displayHeight;
  WIDTH = nextWidth;
  HEIGHT = nextHeight;
  RENDER_SCALE = nextScale;
  RENDER_OFFSET_X = 0;
  RENDER_OFFSET_Y = 0;
  ctx.imageSmoothingEnabled = false;

  if (player) {
    updateCamera();
  }

  return true;
}

function startGame() {
  stopNetworkSession(false);
  sessionMode = SESSION.SINGLE;
  localPlayerId = "p1";
  resetMobileControls();
  prepareModeRun(selectedGameMode);
  player = createPlayer("p1", "Player 1", 0, permanent.swordTier);
  players = [player];
  resetRunState();
  gameState = STATE.PLAYING;
  startModeCombat();
}

function resetRunState() {
  enemies = [];
  xpOrbs = [];
  pickups = [];
  chests = createChests();
  effects = [];
  wave = getModeDepth();
  finalWave = Math.max(1, wave);
  nextWaveTimer = 0;
  flowFieldTimer = 0;
  enemyIdCounter = 0;
  snapshotTimer = 0;
  inputSendTimer = 0;
  levelOfferCounter = 0;
  coopLevelMenuOpen = false;
  activeCoopLevelOfferId = null;
  modeChoiceButtons = [];
  rebuildFlowField();
  updateCamera();
}

function returnToMenu() {
  stopNetworkSession(true);
  resetMobileControls();
  mouse.down = false;
  gameState = STATE.MENU;
  sessionMode = SESSION.SINGLE;
  localPlayerId = "p1";
  player = undefined;
  players = [];
  enemies = [];
  xpOrbs = [];
  pickups = [];
  chests = [];
  effects = [];
  levelUpChoices = [];
  coopLevelMenuOpen = false;
  activeCoopLevelOfferId = null;
  modeChoiceButtons = [];
  optionsButtons = [];
  lobbyPlayers = [];
  pendingClientIds.clear();
  remoteInputs.clear();
  clientIdToPlayerId.clear();
  savePermanentProgress();
}

function spawnWave() {
  const count = 5 + Math.floor(wave * 1.55);
  for (let i = 0; i < count; i += 1) {
    enemies.push(createEnemy(i));
  }
}

function startModeCombat() {
  if (currentGameMode === GAME_MODE.ARENA) {
    spawnWave();
    return;
  }
  const startingCount = currentGameMode === GAME_MODE.MAZE
    ? 3 + Math.floor(getModeDepth() * 0.8)
    : 6;
  for (let i = 0; i < startingCount; i += 1) {
    enemies.push(createEnemy(i));
  }
}

function createEnemy(index) {
  const size = 24;
  const position = getSpawnPosition(size, index);
  const modeDepth = getModeDepth();
  const maxHealth = currentGameMode === GAME_MODE.ARENA
    ? 1 + Math.floor((wave - 1) / 3)
    : 1 + Math.floor(Math.max(0, modeDepth - 1) / 3);

  return {
    id: `e${enemyIdCounter += 1}`,
    x: position.x,
    y: position.y,
    size,
    kind: chooseEnemyKind(index),
    animOffset: Math.random() * 1000,
    speed: currentGameMode === GAME_MODE.ARENA ? 58 + wave * 5 + Math.random() * 18 : 52 + modeDepth * 3 + Math.random() * 12,
    health: maxHealth,
    maxHealth,
    damage: currentGameMode === GAME_MODE.ARENA ? 10 + Math.floor(wave / 3) * 2 : 8 + Math.floor(modeDepth / 3) * 2,
    touchTimer: 0,
    hitFlash: 0
  };
}

function chooseEnemyKind(index) {
  const kinds = ["skeleton1", "skeleton2", "vampire"];
  return kinds[(wave + index) % kinds.length];
}

function getSpawnPosition(size, index) {
  const floorTiles = getWalkableTiles();
  const preferred = floorTiles.filter((tile) => {
    const world = tileToWorld(tile.col, tile.row);
    const farFromPlayers = getLivingPlayers().every((activePlayer) => distance(world.x, world.y, activePlayer.x, activePlayer.y) > 310);
    return farFromPlayers && isActorPositionWalkable(world.x, world.y, size);
  });
  const choices = preferred.length > 0 ? preferred : floorTiles;
  const tile = choices[(index * 7 + Math.floor(Math.random() * choices.length)) % choices.length];
  return tileToWorld(tile.col, tile.row);
}

function update(dt) {
  if (gameState === STATE.OPTIONS) return;

  updateEffects(dt);
  updateNetworkDebug(dt);

  if (gameState !== STATE.PLAYING) return;

  if (modeState.choicePending) {
    if (sessionMode === SESSION.HOST) {
      updateHostSnapshots(dt);
    }
    return;
  }

  if (sessionMode === SESSION.CLIENT) {
    updateClientSession(dt);
    return;
  }

  flowFieldTimer -= dt;
  if (flowFieldTimer <= 0) {
    rebuildFlowField();
    flowFieldTimer = 0.18;
  }

  updatePlayers(dt);
  updateChestTimers(dt);
  updateEnemies(dt);
  updateDrops(dt);
  updateModeObjectives(dt);

  if (currentGameMode === GAME_MODE.ARENA && enemies.length === 0) {
    nextWaveTimer -= dt;
    if (nextWaveTimer <= 0) {
      wave += 1;
      finalWave = Math.max(finalWave, wave);
      spawnWave();
      nextWaveTimer = 0;
    }
  }

  if (sessionMode === SESSION.HOST) {
    updateHostSnapshots(dt);
  }

  if (getLivingPlayers().length === 0 && players.length > 0) {
    failCurrentRun();
  } else if (sessionMode === SESSION.SINGLE && player.health <= 0) {
    failCurrentRun();
  }
}

function updateEffects(dt) {
  effects = effects.filter((effect) => {
    effect.life -= dt;
    effect.x += effect.vx * dt;
    effect.y += effect.vy * dt;
    return effect.life > 0;
  });
}

function updatePlayers(dt) {
  for (const activePlayer of players) {
    if (!activePlayer || activePlayer.health <= 0) continue;
    const input = activePlayer.id === localPlayerId
      ? getLocalPlayerInput()
      : remoteInputs.get(activePlayer.id) || createNeutralInput();
    updateControlledPlayer(activePlayer, input, dt);
  }
  updateCamera();
}

function updateControlledPlayer(activePlayer, input, dt) {
  let moveX = 0;
  let moveY = 0;
  moveX += input.moveX;
  moveY += input.moveY;

  if (moveX !== 0 || moveY !== 0) {
    const length = Math.max(1, Math.hypot(moveX, moveY));
    moveActor(activePlayer, (moveX / length) * activePlayer.speed * dt, (moveY / length) * activePlayer.speed * dt);
  }
  activePlayer.moving = moveX !== 0 || moveY !== 0;
  updatePlayerAim(activePlayer, input);

  activePlayer.attackCooldown = Math.max(0, activePlayer.attackCooldown - dt);
  activePlayer.attackTimer = Math.max(0, activePlayer.attackTimer - dt);
  activePlayer.invulnerableTimer = Math.max(0, activePlayer.invulnerableTimer - dt);
  activePlayer.dualSwordTimer = Math.max(0, activePlayer.dualSwordTimer - dt);
  updateMagicCooldowns(activePlayer, dt);

  if (input.attackActive) {
    tryAttack(activePlayer);
  }
}

function updatePlayerAim(activePlayer = player, input = getLocalPlayerInput()) {
  if (!activePlayer) return;
  if (input.aimActive) {
    activePlayer.angle = Math.atan2(input.aimY, input.aimX);
    return;
  }

  if (input.moveActive) {
    activePlayer.angle = Math.atan2(input.moveY, input.moveX);
    return;
  }

  if (touchInputSeen) return;

  const mouseWorld = screenToWorld(mouse.x, mouse.y);
  const aimX = mouseWorld.x - activePlayer.x;
  const aimY = mouseWorld.y - activePlayer.y;
  activePlayer.angle = Math.atan2(aimY, aimX);
}

function tryAttack(attacker = player) {
  if (!attacker || attacker.health <= 0 || attacker.attackCooldown > 0) return;
  if (attacker === player) {
    updatePlayerAim(attacker);
  }

  const swordStats = getSwordStats(attacker);
  const weapon = getWeaponDefinition(attacker);
  const speedMultiplier = attacker.attackSpeedMultiplier * swordStats.speed;
  attacker.attackCooldown = weapon.cooldown / speedMultiplier;
  attacker.attackDuration = weapon.swingDuration / Math.sqrt(speedMultiplier);
  attacker.attackTimer = attacker.attackDuration;

  const attackAngles = [attacker.angle];
  if (attacker.dualSwordTimer > 0) {
    attackAngles.push(attacker.angle + Math.PI);
  }

  const hitEnemies = new Set();
  for (const attackAngle of attackAngles) {
    damageEnemiesInArc(attacker, attackAngle, hitEnemies);
    damageChestsInArc(attacker, attackAngle);
  }

  removeDefeatedEnemies();
}

function damageEnemiesInArc(attacker, attackAngle, hitEnemies) {
  const swordStats = getSwordStats(attacker);
  const weapon = getWeaponDefinition(attacker);
  const damage = attacker.damageMultiplier * swordStats.damage * weapon.damageMultiplier;
  const reach = weapon.range;
  const halfArc = weapon.halfArc;

  for (const enemy of enemies) {
    if (hitEnemies.has(enemy)) continue;

    const dx = enemy.x - attacker.x;
    const dy = enemy.y - attacker.y;
    const enemyDistance = Math.hypot(dx, dy);
    const angleToEnemy = Math.atan2(dy, dx);
    const inArc = Math.abs(shortestAngle(attackAngle, angleToEnemy)) <= halfArc;

    if (inArc && enemyDistance <= reach + enemy.size * 0.7) {
      enemy.health -= damage;
      enemy.hitFlash = 0.14;
      hitEnemies.add(enemy);
      burst(enemy.x, enemy.y, "#ffd166", 7);
    }
  }
}

function removeDefeatedEnemies() {
  enemies = enemies.filter((enemy) => {
    const alive = enemy.health > 0;
    if (!alive) {
      handleEnemyKilled(enemy);
    }
    return alive;
  });

  if (currentGameMode === GAME_MODE.ARENA && enemies.length === 0) {
    nextWaveTimer = 1.1;
  }
}

function handleEnemyKilled(enemy) {
  awardModeKillPoint();
  dropXpOrb(enemy.x, enemy.y, 2 + Math.floor(wave / 3));
  maybeDropPickup(enemy.x, enemy.y);
  burst(enemy.x, enemy.y, "#ef476f", 12);
}

function dropXpOrb(x, y, value) {
  const position = getNearestWalkableWorld(x, y);
  xpOrbs.push({
    x: position.x,
    y: position.y,
    value,
    size: 10,
    bob: Math.random() * Math.PI * 2
  });
}

function maybeDropPickup(x, y) {
  const position = getNearestWalkableWorld(x, y);
  const roll = Math.random();
  if (roll < 0.08) {
    pickups.push({ type: "shield", x: position.x, y: position.y, size: 18, life: 18 });
  } else if (roll < 0.14) {
    pickups.push({ type: "dual", x: position.x, y: position.y, size: 18, life: 18 });
  }
}

function createChests() {
  const candidates = currentGameMode === GAME_MODE.ARENA ? CHEST_SPAWN_CANDIDATES : getModeChestCandidates();
  return candidates
    .filter((tile) => isChestSpawnTileValid(tile.col, tile.row))
    .map((tile, index) => {
      const position = tileToWorld(tile.col, tile.row);
      return {
        id: `c${index + 1}`,
        col: tile.col,
        row: tile.row,
        x: position.x,
        y: position.y,
        opened: false,
        health: 2,
        maxHealth: 2,
        rewardXp: CHEST_REWARD_XP,
        rewardClaimed: false
      };
    });
}

function getModeChestCandidates() {
  const tiles = getWalkableTiles().filter((tile) => {
    const world = tileToWorld(tile.col, tile.row);
    const farFromSpawns = (modeState.spawnTiles || PLAYER_SPAWNS).every((spawn) => Math.abs(spawn.col - tile.col) + Math.abs(spawn.row - tile.row) > 10);
    const farFromPortal = !modeState.portal || distance(world.x, world.y, modeState.portal.x, modeState.portal.y) > 220;
    const farFromRelic = !modeState.relic || distance(world.x, world.y, modeState.relic.x, modeState.relic.y) > 180;
    return farFromSpawns && farFromPortal && farFromRelic;
  });
  const rng = createSeededRandom((modeState.seed || 1) + (modeState.floor || 1) * 1297);
  const chestsForMode = [];
  while (chestsForMode.length < 4 && tiles.length > 0) {
    const index = Math.floor(rng() * tiles.length);
    chestsForMode.push(tiles.splice(index, 1)[0]);
  }
  return chestsForMode;
}

function isChestSpawnTileValid(col, row) {
  if (!isWalkableTile(col, row)) return false;
  const spawns = modeState.spawnTiles || PLAYER_SPAWNS;
  return spawns.every((spawn) => Math.abs(spawn.col - col) + Math.abs(spawn.row - row) > 5);
}

function updateChests() {
  for (const chest of chests) {
    if (chest.opened) continue;
    const opener = getNearestLivingPlayer(chest.x, chest.y);
    if (!opener) continue;
    if (distance(opener.x, opener.y, chest.x, chest.y) <= CHEST_OPEN_DISTANCE) {
      openChest(chest);
    }
  }
}

function updateChestTimers(dt) {
  for (const chest of chests) {
    chest.hitFlash = Math.max(0, (chest.hitFlash || 0) - dt);
  }
}

function damageChestsInArc(attacker, attackAngle) {
  const weapon = getWeaponDefinition(attacker);
  const reach = weapon.range;
  const halfArc = weapon.halfArc;
  for (const chest of chests) {
    if (chest.opened) continue;
    const dx = chest.x - attacker.x;
    const dy = chest.y - attacker.y;
    const chestDistance = Math.hypot(dx, dy);
    const angleToChest = Math.atan2(dy, dx);
    const inArc = Math.abs(shortestAngle(attackAngle, angleToChest)) <= halfArc;
    if (!inArc || chestDistance > reach + 24) continue;
    chest.health = Math.max(0, (chest.health ?? 2) - 1);
    chest.hitFlash = 0.18;
    burst(chest.x, chest.y, "#ffd166", 5);
    if (chest.health <= 0) {
      openChest(chest, attacker);
    }
  }
}

function openChest(chest, opener = player) {
  if (!chest || chest.opened || chest.rewardClaimed) return;
  chest.opened = true;
  chest.rewardClaimed = true;
  const unlock = chooseChestUnlockReward();
  if (unlock) {
    applyItemUnlock(unlock.kind, unlock.id, `chest-${chest.id}-${Date.now()}-${rewardEventCounter += 1}`);
    chest.rewardType = unlock.kind;
    chest.rewardId = unlock.id;
  } else {
    dropXpOrb(chest.x, chest.y, chest.rewardXp || CHEST_REWARD_XP);
    if (currentGameMode !== GAME_MODE.ARENA) {
      addRunPoints(getRunPointReward());
    }
    chest.rewardType = "xp";
  }
  burst(chest.x, chest.y, "#ffd166", 10);
}

function chooseChestUnlockReward() {
  if (Math.random() >= 0.1) return null;
  const lockedWeapons = WEAPON_DEFINITIONS
    .filter((weaponDefinition) => !isWeaponOwned(weaponDefinition.id))
    .map((weaponDefinition) => ({ kind: "weapon", id: weaponDefinition.id }));
  const lockedMagic = MAGIC_DEFINITIONS
    .filter((magicDefinition) => !isMagicOwned(magicDefinition.id))
    .map((magicDefinition) => ({ kind: "magic", id: magicDefinition.id }));
  const choices = [...lockedWeapons, ...lockedMagic];
  if (choices.length === 0) return null;
  return choices[Math.floor(Math.random() * choices.length)];
}

function updateEnemies(dt) {
  let defeatedByStatus = false;
  for (const enemy of enemies) {
    updateEnemyStatusEffects(enemy, dt);
    if (enemy.health <= 0) {
      defeatedByStatus = true;
      continue;
    }
    const chase = getEnemyChaseVector(enemy);
    const movementScale = getEnemyMovementScale(enemy);
    moveActor(enemy, chase.x * enemy.speed * movementScale * dt, chase.y * enemy.speed * movementScale * dt);

    enemy.touchTimer = Math.max(0, enemy.touchTimer - dt);
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    enemy.magicFlash = Math.max(0, (enemy.magicFlash || 0) - dt);

    for (const activePlayer of getLivingPlayers()) {
      const contactDistance = activePlayer.size * 0.48 + enemy.size * 0.55;
      if (distance(activePlayer.x, activePlayer.y, enemy.x, enemy.y) < contactDistance && enemy.touchTimer <= 0) {
        enemy.touchTimer = 0.72;
        damagePlayer(enemy.damage, activePlayer);
        break;
      }
    }
  }
  if (defeatedByStatus) {
    removeDefeatedEnemies();
  }
}

function updateEnemyStatusEffects(enemy, dt) {
  enemy.burnTimer = Math.max(0, (enemy.burnTimer || 0) - dt);
  enemy.slowTimer = Math.max(0, (enemy.slowTimer || 0) - dt);
  enemy.stunTimer = Math.max(0, (enemy.stunTimer || 0) - dt);
  enemy.rootTimer = Math.max(0, (enemy.rootTimer || 0) - dt);
  if (enemy.burnTimer > 0) {
    enemy.burnTick = (enemy.burnTick || 0) + dt;
    if (enemy.burnTick >= 0.5) {
      enemy.burnTick -= 0.5;
      enemy.health -= enemy.burnDamage || 0.7;
      enemy.hitFlash = 0.12;
      burst(enemy.x, enemy.y, "#ff6b35", 3);
    }
  } else {
    enemy.burnTick = 0;
  }
}

function getEnemyMovementScale(enemy) {
  if ((enemy.stunTimer || 0) > 0 || (enemy.rootTimer || 0) > 0) return 0;
  if ((enemy.slowTimer || 0) > 0) return enemy.slowMultiplier || 0.45;
  return 1;
}

function updateDrops(dt) {
  xpOrbs = xpOrbs.filter((orb) => {
    if (gameState !== STATE.PLAYING) return true;

    orb.bob += dt * 7;
    const nearestPlayer = getNearestLivingPlayer(orb.x, orb.y);
    if (!nearestPlayer) return true;

    const playerDistance = distance(nearestPlayer.x, nearestPlayer.y, orb.x, orb.y);
    if (playerDistance < 150 && hasLineOfSight(orb.x, orb.y, nearestPlayer.x, nearestPlayer.y)) {
      const pull = 330 * dt;
      orb.x += ((nearestPlayer.x - orb.x) / (playerDistance || 1)) * pull;
      orb.y += ((nearestPlayer.y - orb.y) / (playerDistance || 1)) * pull;
    }

    if (playerDistance < 28) {
      gainXp(orb.value, nearestPlayer);
      burst(orb.x, orb.y, "#8de85c", 5);
      return false;
    }

    return true;
  });

  pickups = pickups.filter((pickup) => {
    if (gameState !== STATE.PLAYING) return true;

    pickup.life -= dt;
    const nearestPlayer = getNearestLivingPlayer(pickup.x, pickup.y);
    if (nearestPlayer && distance(nearestPlayer.x, nearestPlayer.y, pickup.x, pickup.y) < 32) {
      collectPickup(pickup, nearestPlayer);
      return false;
    }
    return pickup.life > 0;
  });
}

function gainXp(amount, activePlayer = player) {
  if (!activePlayer) return;
  activePlayer.xp += amount;
  if (activePlayer.xp >= activePlayer.xpToNext) {
    activePlayer.xp -= activePlayer.xpToNext;
    activePlayer.level += 1;
    activePlayer.xpToNext = Math.ceil(activePlayer.xpToNext * 1.32 + 3);
    if (sessionMode === SESSION.SINGLE && activePlayer === player) {
      levelUpChoices = chooseLevelUpOptions();
      gameState = STATE.LEVEL_UP;
      mouse.down = false;
    } else {
      queueCoopLevelUp(activePlayer);
    }
  }
}

function chooseLevelUpOptions() {
  const pool = [...UPGRADE_POOL];
  const choices = [];
  while (choices.length < 3 && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    choices.push(pool.splice(index, 1)[0]);
  }
  return choices;
}

function applyLevelUp(upgrade) {
  upgrade.apply();
  levelUpChoices = [];
  gameState = STATE.PLAYING;
}

function applyUpgradeToPlayer(activePlayer, upgradeId) {
  if (!activePlayer) return;
  if (upgradeId === "maxHp") {
    const oldMax = activePlayer.maxHealth;
    activePlayer.maxHealth = Math.round(activePlayer.maxHealth * 1.2);
    activePlayer.health = Math.min(activePlayer.maxHealth, activePlayer.health + (activePlayer.maxHealth - oldMax));
    return;
  }
  if (upgradeId === "heal") {
    activePlayer.health = Math.min(activePlayer.maxHealth, activePlayer.health + activePlayer.maxHealth * 0.2);
    return;
  }
  if (upgradeId === "damage") {
    activePlayer.damageMultiplier *= 1.2;
    return;
  }
  if (upgradeId === "attackSpeed") {
    activePlayer.attackSpeedMultiplier *= 1.2;
    return;
  }
  if (upgradeId === "moveSpeed") {
    activePlayer.speed *= 1.2;
  }
}

function applyRandomCoopUpgrade(activePlayer) {
  const upgrade = UPGRADE_POOL[Math.floor(Math.random() * UPGRADE_POOL.length)];
  applyUpgradeToPlayer(activePlayer, upgrade.id);
  burst(activePlayer.x, activePlayer.y, "#8de85c", 14);
}

function queueCoopLevelUp(activePlayer) {
  if (!activePlayer) return;
  activePlayer.pendingLevelUps = (activePlayer.pendingLevelUps || 0) + 1;
  ensureCoopLevelOffer(activePlayer);
}

function ensureCoopLevelOffer(activePlayer) {
  if (!activePlayer || sessionMode === SESSION.SINGLE) return;
  if (activePlayer.activeLevelOffer || (activePlayer.pendingLevelUps || 0) <= 0) return;

  const choices = chooseLevelUpOptions().map((upgrade) => ({
    id: upgrade.id,
    title: upgrade.title,
    detail: upgrade.detail
  }));
  activePlayer.activeLevelOffer = {
    id: `level-${Date.now()}-${levelOfferCounter += 1}`,
    choices
  };
  notifyLevelOffer(activePlayer);
}

function notifyLevelOffer(activePlayer) {
  if (sessionMode !== SESSION.HOST || !activePlayer.activeLevelOffer) return;
  if (activePlayer.id === localPlayerId) return;

  const lobbyPlayer = lobbyPlayers.find((candidate) => candidate.id === activePlayer.id);
  if (!lobbyPlayer?.clientId) return;
  sendNetworkMessage({
    type: "levelUpOffer",
    playerId: activePlayer.id,
    offer: activePlayer.activeLevelOffer,
    pending: activePlayer.pendingLevelUps || 0
  }, lobbyPlayer.clientId);
}

function applyHostLevelChoice(playerId, offerId, upgradeId) {
  if (sessionMode !== SESSION.HOST) return false;
  const targetPlayer = players.find((candidate) => candidate.id === playerId);
  if (!targetPlayer || !targetPlayer.activeLevelOffer) return false;
  if (targetPlayer.activeLevelOffer.id !== offerId) return false;
  if (!targetPlayer.activeLevelOffer.choices.some((choice) => choice.id === upgradeId)) return false;

  applyUpgradeToPlayer(targetPlayer, upgradeId);
  targetPlayer.pendingLevelUps = Math.max(0, (targetPlayer.pendingLevelUps || 0) - 1);
  targetPlayer.activeLevelOffer = null;
  burst(targetPlayer.x, targetPlayer.y, "#8de85c", 14);
  ensureCoopLevelOffer(targetPlayer);
  return true;
}

function collectPickup(pickup, activePlayer = player) {
  if (pickup.type === "shield") {
    activePlayer.shieldActive = true;
    burst(activePlayer.x, activePlayer.y, "#75d7ff", 12);
    return;
  }

  if (pickup.type === "dual") {
    activePlayer.dualSwordTimer = 30;
    burst(activePlayer.x, activePlayer.y, "#ff9f1c", 12);
  }
}

function useMagicSlot(slot) {
  if (!player || player.health <= 0) return;
  const equipped = getEquippedMagicDefinitions(player);
  const magic = equipped[slot];
  if (!magic || (player.magicCooldowns?.[magic.id] || 0) > 0) return;
  updatePlayerAim(player);
  const request = {
    slot,
    angle: player.angle
  };
  if (sessionMode === SESSION.CLIENT) {
    player.magicCooldowns = player.magicCooldowns || {};
    player.magicCooldowns[magic.id] = magic.cooldown;
    sendNetworkMessage({ type: "magicUse", request });
    burst(player.x + Math.cos(player.angle) * 58, player.y + Math.sin(player.angle) * 58, magic.color, 6);
    return;
  }
  applyMagicUse(player, request);
}

function applyMagicUse(caster, request = {}) {
  if (!caster || caster.health <= 0) return false;
  const equipped = getEquippedMagicDefinitions(caster);
  const magic = equipped[clamp(Math.round(Number(request.slot) || 0), 0, 1)];
  if (!magic) return false;
  caster.magicCooldowns = caster.magicCooldowns || {};
  if ((caster.magicCooldowns[magic.id] || 0) > 0) return false;
  const angle = Number.isFinite(request.angle) ? request.angle : caster.angle;
  caster.magicCooldowns[magic.id] = magic.cooldown;
  const targetX = caster.x + Math.cos(angle) * magic.range;
  const targetY = caster.y + Math.sin(angle) * magic.range;
  let hitCount = 0;
  for (const enemy of enemies) {
    if (enemy.health <= 0) continue;
    if (distance(enemy.x, enemy.y, targetX, targetY) > magic.radius) continue;
    applyMagicEffectToEnemy(enemy, magic);
    hitCount += 1;
  }
  burst(targetX, targetY, magic.color, hitCount > 0 ? 16 : 8);
  removeDefeatedEnemies();
  return true;
}

function applyMagicEffectToEnemy(enemy, magic) {
  enemy.magicFlash = 0.4;
  enemy.magicColor = magic.color;
  if (magic.effect === "burn") {
    enemy.burnTimer = Math.max(enemy.burnTimer || 0, magic.duration);
    enemy.burnDamage = magic.tickDamage;
    enemy.health -= 0.4;
  } else if (magic.effect === "slow") {
    enemy.slowTimer = Math.max(enemy.slowTimer || 0, magic.duration);
    enemy.slowMultiplier = magic.slowMultiplier;
  } else if (magic.effect === "stun") {
    enemy.stunTimer = Math.max(enemy.stunTimer || 0, magic.duration);
  } else if (magic.effect === "root") {
    enemy.rootTimer = Math.max(enemy.rootTimer || 0, magic.duration);
  }
}

function damagePlayer(amount, activePlayer = player) {
  if (!activePlayer || activePlayer.invulnerableTimer > 0) return;

  if (activePlayer.shieldActive) {
    activePlayer.shieldActive = false;
    activePlayer.invulnerableTimer = 0.35;
    burst(activePlayer.x, activePlayer.y, "#75d7ff", 18);
    return;
  }

  activePlayer.health = Math.max(0, activePlayer.health - amount);
  activePlayer.invulnerableTimer = 0.48;
  burst(activePlayer.x, activePlayer.y, "#75d7ff", 9);
}

function getSwordStats(activePlayer = player) {
  return SWORD_TIERS[activePlayer?.swordTier ?? permanent.swordTier] || SWORD_TIERS[0];
}

function getWeaponById(weaponId) {
  return WEAPON_DEFINITIONS.find((weapon) => weapon.id === weaponId) || WEAPON_DEFINITIONS[0];
}

function getWeaponDefinition(activePlayer = player) {
  return getWeaponById(activePlayer?.weaponId || permanent.weaponId);
}

function getSelectedWeapon() {
  return getWeaponById(permanent.weaponId);
}

function selectWeapon(weaponId) {
  if (!isWeaponOwned(weaponId)) return;
  permanent.weaponId = getWeaponById(weaponId).id;
  if (sessionMode === SESSION.SINGLE && player) {
    player.weaponId = permanent.weaponId;
  }
  savePermanentProgress();
}

function getMagicById(magicId) {
  return MAGIC_DEFINITIONS.find((magic) => magic.id === magicId) || null;
}

function getOwnedWeaponIds() {
  const ids = Array.isArray(permanent.ownedWeaponIds) ? permanent.ownedWeaponIds : [];
  return [...new Set([DEFAULT_WEAPON_ID, ...ids].filter((weaponId) => getWeaponById(weaponId).id === weaponId))];
}

function getOwnedMagicIds() {
  const ids = Array.isArray(permanent.ownedMagicIds) ? permanent.ownedMagicIds : [];
  return [...new Set(ids.filter((magicId) => Boolean(getMagicById(magicId))))];
}

function isWeaponOwned(weaponId) {
  return getOwnedWeaponIds().includes(getWeaponById(weaponId).id);
}

function isMagicOwned(magicId) {
  return getOwnedMagicIds().includes(magicId);
}

function sanitizeEquippedMagicIds(magicIds, allowedIds = MAGIC_DEFINITIONS.map((magic) => magic.id)) {
  const source = Array.isArray(magicIds) ? magicIds : [];
  const allowed = new Set(allowedIds);
  const equipped = [];
  for (const magicId of source) {
    if (equipped.length >= 2) break;
    if (!allowed.has(magicId) || !getMagicById(magicId) || equipped.includes(magicId)) continue;
    equipped.push(magicId);
  }
  return equipped;
}

function getEquippedMagicDefinitions(activePlayer = player) {
  return sanitizeEquippedMagicIds(activePlayer?.equippedMagicIds || permanent.equippedMagicIds)
    .map(getMagicById)
    .filter(Boolean);
}

function updateMagicCooldowns(activePlayer, dt) {
  if (!activePlayer.magicCooldowns) activePlayer.magicCooldowns = {};
  for (const magicId of activePlayer.equippedMagicIds || []) {
    activePlayer.magicCooldowns[magicId] = Math.max(0, (activePlayer.magicCooldowns[magicId] || 0) - dt);
  }
}

function buyWeapon(weaponId) {
  const weapon = getWeaponById(weaponId);
  if (isWeaponOwned(weapon.id) || permanent.killPoints < weapon.cost) return;
  permanent.killPoints -= weapon.cost;
  permanent.ownedWeaponIds = getOwnedWeaponIds();
  permanent.ownedWeaponIds.push(weapon.id);
  savePermanentProgress();
  burst(WIDTH / 2, 220, "#8de85c", 18);
}

function buyMagic(magicId) {
  const magic = getMagicById(magicId);
  if (!magic || isMagicOwned(magic.id) || permanent.killPoints < magic.cost) return;
  permanent.killPoints -= magic.cost;
  permanent.ownedMagicIds = getOwnedMagicIds();
  permanent.ownedMagicIds.push(magic.id);
  permanent.equippedMagicIds = sanitizeEquippedMagicIds(permanent.equippedMagicIds, getOwnedMagicIds());
  if (permanent.equippedMagicIds.length < 2 && !permanent.equippedMagicIds.includes(magic.id)) {
    permanent.equippedMagicIds.push(magic.id);
  }
  savePermanentProgress();
  burst(WIDTH / 2, 220, magic.color, 18);
}

function toggleEquipMagic(magicId) {
  if (!isMagicOwned(magicId)) return;
  const equipped = sanitizeEquippedMagicIds(permanent.equippedMagicIds, getOwnedMagicIds());
  if (equipped.includes(magicId)) {
    permanent.equippedMagicIds = equipped.filter((id) => id !== magicId);
  } else {
    permanent.equippedMagicIds = [...equipped.slice(-1), magicId];
  }
  savePermanentProgress();
}

function applyItemUnlock(kind, itemId, eventId) {
  if (eventId && appliedUnlockEvents.has(eventId)) return;
  if (eventId) appliedUnlockEvents.add(eventId);
  if (kind === "weapon") {
    const weapon = getWeaponById(itemId);
    if (!isWeaponOwned(weapon.id)) {
      permanent.ownedWeaponIds = getOwnedWeaponIds();
      permanent.ownedWeaponIds.push(weapon.id);
    }
  } else if (kind === "magic") {
    const magic = getMagicById(itemId);
    if (magic && !isMagicOwned(magic.id)) {
      permanent.ownedMagicIds = getOwnedMagicIds();
      permanent.ownedMagicIds.push(magic.id);
      if ((permanent.equippedMagicIds || []).length < 2) {
        permanent.equippedMagicIds = sanitizeEquippedMagicIds([...(permanent.equippedMagicIds || []), magic.id], getOwnedMagicIds());
      }
    }
  }
  permanent.equippedMagicIds = sanitizeEquippedMagicIds(permanent.equippedMagicIds, getOwnedMagicIds());
  savePermanentProgress();
  if (sessionMode === SESSION.HOST && eventId) {
    broadcastNetworkMessage({ type: "itemUnlock", eventId, kind, itemId });
  }
}

function moveActor(actor, dx, dy) {
  const nextX = actor.x + dx;
  if (isActorPositionWalkable(nextX, actor.y, actor.size)) {
    actor.x = nextX;
  }

  const nextY = actor.y + dy;
  if (isActorPositionWalkable(actor.x, nextY, actor.size)) {
    actor.y = nextY;
  }
}

function isActorPositionWalkable(x, y, size) {
  const radius = Math.max(8, size * 0.38);
  const samples = [
    { x, y },
    { x: x - radius, y: y - radius },
    { x: x + radius, y: y - radius },
    { x: x - radius, y: y + radius },
    { x: x + radius, y: y + radius }
  ];
  return samples.every((sample) => {
    const tile = worldToTile(sample.x, sample.y);
    return isWalkableTile(tile.col, tile.row);
  });
}

function getEnemyChaseVector(enemy) {
  const targetPlayer = getNearestLivingPlayer(enemy.x, enemy.y);
  if (!targetPlayer) return { x: 0, y: 0 };

  if (hasLineOfSight(enemy.x, enemy.y, targetPlayer.x, targetPlayer.y)) {
    const dx = targetPlayer.x - enemy.x;
    const dy = targetPlayer.y - enemy.y;
    const length = Math.hypot(dx, dy) || 1;
    return { x: dx / length, y: dy / length };
  }

  const tile = worldToTile(enemy.x, enemy.y);
  const targetFlowField = flowFieldsByPlayer.get(targetPlayer.id) || flowField;
  const next = getNextFlowTile(tile.col, tile.row, targetFlowField);
  if (next) {
    const target = tileToWorld(next.col, next.row);
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const length = Math.hypot(dx, dy) || 1;
    return { x: dx / length, y: dy / length };
  }

  return { x: 0, y: 0 };
}

function getNextFlowTile(col, row, targetFlowField = flowField) {
  const currentDistance = getFlowDistance(col, row, targetFlowField);
  let best = null;
  let bestDistance = currentDistance;
  for (const neighbor of getNeighborTiles(col, row)) {
    const distanceValue = getFlowDistance(neighbor.col, neighbor.row, targetFlowField);
    if (distanceValue < bestDistance) {
      bestDistance = distanceValue;
      best = neighbor;
    }
  }
  return best;
}

function rebuildFlowField() {
  flowFieldsByPlayer = new Map();
  for (const activePlayer of getLivingPlayers()) {
    const built = buildFlowFieldForPlayer(activePlayer);
    flowFieldsByPlayer.set(activePlayer.id, built);
    if (activePlayer === player) {
      flowField = built;
    }
  }
  if (!flowField.length && player) {
    flowField = buildFlowFieldForPlayer(player);
  }
}

function buildFlowFieldForPlayer(activePlayer) {
  const builtFlowField = Array.from({ length: MAP.rows }, () => Array(MAP.cols).fill(Infinity));
  const playerTile = worldToTile(activePlayer.x, activePlayer.y);
  if (!isWalkableTile(playerTile.col, playerTile.row)) return builtFlowField;

  const queue = [playerTile];
  builtFlowField[playerTile.row][playerTile.col] = 0;
  for (let index = 0; index < queue.length; index += 1) {
    const tile = queue[index];
    const nextDistance = builtFlowField[tile.row][tile.col] + 1;
    for (const neighbor of getNeighborTiles(tile.col, tile.row)) {
      if (nextDistance < builtFlowField[neighbor.row][neighbor.col]) {
        builtFlowField[neighbor.row][neighbor.col] = nextDistance;
        queue.push(neighbor);
      }
    }
  }
  return builtFlowField;
}

function getFlowDistance(col, row, targetFlowField = flowField) {
  if (!isInsideMap(col, row)) return Infinity;
  return targetFlowField[row]?.[col] ?? Infinity;
}

function getNeighborTiles(col, row) {
  return [
    { col: col + 1, row },
    { col: col - 1, row },
    { col, row: row + 1 },
    { col, row: row - 1 }
  ].filter((tile) => isWalkableTile(tile.col, tile.row));
}

function hasLineOfSight(x1, y1, x2, y2) {
  const steps = Math.ceil(distance(x1, y1, x2, y2) / 18);
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = lerp(x1, x2, t);
    const y = lerp(y1, y2, t);
    const tile = worldToTile(x, y);
    if (!isWalkableTile(tile.col, tile.row)) return false;
  }
  return true;
}

function getNearestWalkableWorld(x, y) {
  const tile = worldToTile(x, y);
  if (isWalkableTile(tile.col, tile.row)) return tileToWorld(tile.col, tile.row);

  for (let radius = 1; radius < Math.max(MAP.cols, MAP.rows); radius += 1) {
    for (let row = tile.row - radius; row <= tile.row + radius; row += 1) {
      for (let col = tile.col - radius; col <= tile.col + radius; col += 1) {
        if (isWalkableTile(col, row)) return tileToWorld(col, row);
      }
    }
  }
  return tileToWorld(42, 30);
}

function getWalkableTiles() {
  const tiles = [];
  for (let row = 0; row < MAP.rows; row += 1) {
    for (let col = 0; col < MAP.cols; col += 1) {
      if (isWalkableTile(col, row)) tiles.push({ col, row });
    }
  }
  return tiles;
}

function isWalkableTile(col, row) {
  return isInsideMap(col, row) && DUNGEON_MAP[row][col] === ".";
}

function isInsideMap(col, row) {
  return col >= 0 && col < MAP.cols && row >= 0 && row < MAP.rows;
}

function getLivingPlayers() {
  return players.filter((activePlayer) => activePlayer && activePlayer.health > 0 && activePlayer.connected !== false);
}

function getNearestLivingPlayer(x, y) {
  let best = null;
  let bestDistance = Infinity;
  for (const activePlayer of getLivingPlayers()) {
    const playerDistance = distance(x, y, activePlayer.x, activePlayer.y);
    if (playerDistance < bestDistance) {
      best = activePlayer;
      bestDistance = playerDistance;
    }
  }
  return best;
}

function worldToTile(x, y) {
  return {
    col: Math.floor((x - ARENA.x) / MAP.tileSize),
    row: Math.floor((y - ARENA.y) / MAP.tileSize)
  };
}

function tileToWorld(col, row) {
  return {
    x: ARENA.x + col * MAP.tileSize + MAP.tileSize / 2,
    y: ARENA.y + row * MAP.tileSize + MAP.tileSize / 2
  };
}

function updateCamera() {
  if (!player) return;
  camera = getCameraForPosition(player.x, player.y);
}

function getCameraForPosition(x, y) {
  const zoom = getCameraZoom();
  const viewportWidth = WIDTH / zoom;
  const viewportHeight = HEIGHT / zoom;
  return {
    x: clamp(x - viewportWidth / 2, ARENA.x, Math.max(ARENA.x, ARENA.x + ARENA.width - viewportWidth)),
    y: clamp(y - viewportHeight / 2, ARENA.y, Math.max(ARENA.y, ARENA.y + ARENA.height - viewportHeight))
  };
}

function screenToWorld(x, y) {
  const zoom = getCameraZoom();
  return {
    x: x / zoom + camera.x,
    y: y / zoom + camera.y
  };
}

function getCameraZoom() {
  return getZoomOption(settings.zoom).scale;
}

function getZoomOption(id) {
  return ZOOM_OPTIONS.find((option) => option.id === id) || ZOOM_OPTIONS[0];
}

function prepareModeRun(modeId, options = {}) {
  currentGameMode = getGameModeDefinition(modeId).id;
  modeState = createModeState(currentGameMode, options);
  applyModeMap(modeState);
  wave = currentGameMode === GAME_MODE.ARENA ? 1 : getModeDepth();
  finalWave = Math.max(finalWave, wave);
}

function createModeState(modeId, options = {}) {
  const mode = getGameModeDefinition(modeId).id;
  const seed = Number.isFinite(options.seed) ? Math.round(options.seed) : Math.floor(Math.random() * 1_000_000_000);
  if (mode === GAME_MODE.MAZE) {
    const floor = clamp(Math.round(Number(options.floor) || 1), 1, 10);
    const generated = createMazeModeMap(seed, floor);
    return {
      mode,
      seed,
      mapKey: `${mode}-${seed}-${floor}`,
      floor,
      runPoints: Math.max(0, Math.round(Number(options.runPoints) || 0)),
      choicePending: Boolean(options.choicePending),
      continued: Boolean(options.continued),
      extracted: false,
      failed: false,
      spawnTimer: 2,
      spawnTiles: generated.spawnTiles,
      portal: generated.portal,
      map: generated.map
    };
  }
  if (mode === GAME_MODE.DUNGEON) {
    const generated = createRelicDungeonModeMap(seed);
    return {
      mode,
      seed,
      mapKey: `${mode}-${seed}`,
      floor: 1,
      runPoints: Math.max(0, Math.round(Number(options.runPoints) || 0)),
      hasRelic: Boolean(options.hasRelic),
      extracted: false,
      failed: false,
      spawnTimer: 2,
      spawnTiles: generated.spawnTiles,
      exit: generated.exit,
      relic: generated.relic,
      map: generated.map
    };
  }
  return {
    mode: GAME_MODE.ARENA,
    seed,
    mapKey: `${GAME_MODE.ARENA}`,
    floor: 1,
    runPoints: 0,
    spawnTiles: PLAYER_SPAWNS,
    map: createDungeonMap()
  };
}

function getGameModeDefinition(modeId) {
  return GAME_MODE_DEFINITIONS.find((definition) => definition.id === modeId) || GAME_MODE_DEFINITIONS[0];
}

function applyModeMap(nextModeState) {
  if (!nextModeState?.map || lastAppliedMapKey === nextModeState.mapKey) return;
  DUNGEON_MAP = nextModeState.map;
  lastAppliedMapKey = nextModeState.mapKey;
  flowField = [];
  flowFieldsByPlayer = new Map();
}

function getPlayerSpawnTile(spawnIndex = 0) {
  if (currentGameMode === GAME_MODE.ARENA) {
    return PLAYER_SPAWNS[spawnIndex % PLAYER_SPAWNS.length] || PLAYER_SPAWNS[0];
  }
  const safeSpawns = getSafeModeSpawnTiles();
  if (safeSpawns.length > 0) {
    return safeSpawns[spawnIndex % safeSpawns.length];
  }
  const spawns = Array.isArray(modeState.spawnTiles) && modeState.spawnTiles.length > 0 ? modeState.spawnTiles : PLAYER_SPAWNS;
  return spawns[spawnIndex % spawns.length] || PLAYER_SPAWNS[0];
}

function getSafeModeSpawnTiles() {
  const baseSpawns = Array.isArray(modeState.spawnTiles) && modeState.spawnTiles.length > 0 ? modeState.spawnTiles : PLAYER_SPAWNS;
  const searchOrigin = baseSpawns[0] || PLAYER_SPAWNS[0];
  const candidates = [];
  for (let radius = 0; radius <= 10; radius += 1) {
    for (let row = searchOrigin.row - radius; row <= searchOrigin.row + radius; row += 1) {
      for (let col = searchOrigin.col - radius; col <= searchOrigin.col + radius; col += 1) {
        if (Math.max(Math.abs(col - searchOrigin.col), Math.abs(row - searchOrigin.row)) !== radius) continue;
        if (!isSpawnTileClear(col, row)) continue;
        candidates.push({
          col,
          row,
          distance: Math.abs(col - searchOrigin.col) + Math.abs(row - searchOrigin.row)
        });
      }
    }
    if (candidates.length >= MAX_COOP_PLAYERS * 3) break;
  }

  candidates.sort((a, b) => a.distance - b.distance || a.row - b.row || a.col - b.col);
  const selected = [];
  for (const candidate of candidates) {
    const spaced = selected.every((spawn) => Math.abs(spawn.col - candidate.col) + Math.abs(spawn.row - candidate.row) >= 2);
    if (!spaced && selected.length < MAX_COOP_PLAYERS) continue;
    selected.push({ col: candidate.col, row: candidate.row });
    if (selected.length >= MAX_COOP_PLAYERS) break;
  }
  return selected.length > 0 ? selected : candidates.map((candidate) => ({ col: candidate.col, row: candidate.row })).slice(0, MAX_COOP_PLAYERS);
}

function isSpawnTileClear(col, row, actorSize = 28) {
  if (!isWalkableTile(col, row)) return false;
  const world = tileToWorld(col, row);
  return isActorPositionWalkable(world.x, world.y, actorSize);
}

function getModeDepth() {
  if (currentGameMode === GAME_MODE.MAZE) return Math.max(1, modeState.floor || 1);
  if (currentGameMode === GAME_MODE.DUNGEON) return 3;
  return wave;
}

function getRunPointReward() {
  if (currentGameMode === GAME_MODE.MAZE) return modeState.floor >= 6 ? 3 : 1;
  if (currentGameMode === GAME_MODE.DUNGEON) return 2;
  return 1;
}

function addRunPoints(amount) {
  modeState.runPoints = Math.max(0, Math.round((modeState.runPoints || 0) + amount));
}

function updateModeObjectives(dt) {
  if (currentGameMode === GAME_MODE.ARENA || !modeState || modeState.choicePending) return;
  updateExplorationEnemyPressure(dt);
  if (currentGameMode === GAME_MODE.MAZE) {
    updateMazeObjective();
  } else if (currentGameMode === GAME_MODE.DUNGEON) {
    updateDungeonObjective();
  }
}

function updateExplorationEnemyPressure(dt) {
  modeState.spawnTimer = Math.max(0, (modeState.spawnTimer || 0) - dt);
  const depth = getModeDepth();
  const maxEnemies = currentGameMode === GAME_MODE.MAZE ? clamp(4 + Math.floor(depth * 0.9), 5, 13) : 8;
  if (modeState.spawnTimer > 0 || enemies.length >= maxEnemies) return;
  enemies.push(createEnemy(enemyIdCounter + 1));
  modeState.spawnTimer = currentGameMode === GAME_MODE.MAZE ? Math.max(1.2, 4.2 - depth * 0.18) : 3.4;
}

function updateMazeObjective() {
  if (!modeState.portal) return;
  const activatingPlayer = getLivingPlayers().find((activePlayer) => distance(activePlayer.x, activePlayer.y, modeState.portal.x, modeState.portal.y) < 38);
  if (!activatingPlayer) return;
  if (modeState.floor === 5 && !modeState.continued) {
    modeState.choicePending = true;
    resetMobileControls();
    mouse.down = false;
    return;
  }
  if (modeState.floor >= 10) {
    completeCurrentRun("Maze cleared");
    return;
  }
  advanceMazeFloor(modeState.floor + 1);
}

function advanceMazeFloor(nextFloor) {
  const runPoints = modeState.runPoints || 0;
  const continued = modeState.continued || nextFloor > 5;
  const seed = (modeState.seed || 1) + nextFloor * 7919;
  prepareModeRun(GAME_MODE.MAZE, { floor: nextFloor, seed, runPoints, continued });
  movePlayersToModeSpawns();
  enemies = [];
  xpOrbs = [];
  pickups = [];
  chests = createChests();
  startModeCombat();
  rebuildFlowField();
  updateCamera();
}

function updateDungeonObjective() {
  if (!modeState.hasRelic && modeState.relic) {
    const finder = getLivingPlayers().find((activePlayer) => distance(activePlayer.x, activePlayer.y, modeState.relic.x, modeState.relic.y) < 36);
    if (finder) {
      modeState.hasRelic = true;
      addRunPoints(8);
      burst(modeState.relic.x, modeState.relic.y, "#f7e967", 18);
    }
  }
  if (modeState.hasRelic && modeState.exit) {
    const escapingPlayer = getLivingPlayers().find((activePlayer) => distance(activePlayer.x, activePlayer.y, modeState.exit.x, modeState.exit.y) < 42);
    if (escapingPlayer) {
      completeCurrentRun("Relic extracted");
    }
  }
}

function movePlayersToModeSpawns() {
  for (let i = 0; i < players.length; i += 1) {
    const spawn = getPlayerSpawnTile(i);
    const position = tileToWorld(spawn.col, spawn.row);
    players[i].x = position.x;
    players[i].y = position.y;
    players[i].health = Math.max(1, players[i].health);
    players[i].attackCooldown = 0;
    players[i].attackTimer = 0;
  }
  player = players.find((activePlayer) => activePlayer.id === localPlayerId) || players[0];
}

function chooseMazeContinue() {
  if (currentGameMode !== GAME_MODE.MAZE || !modeState.choicePending) return;
  modeState.choicePending = false;
  modeState.continued = true;
  advanceMazeFloor(6);
}

function chooseMazeExit() {
  if (currentGameMode !== GAME_MODE.MAZE || !modeState.choicePending) return;
  completeCurrentRun("Escaped the maze");
}

function completeCurrentRun(reason) {
  const amount = Math.max(0, Math.round(modeState.runPoints || 0));
  if (amount > 0) {
    permanent.killPoints += amount;
    savePermanentProgress();
    if (sessionMode === SESSION.HOST) {
      const eventId = `extract-${Date.now()}-${rewardEventCounter += 1}`;
      broadcastNetworkMessage({ type: "rewardDelta", eventId, amount });
    }
  }
  modeState.extracted = true;
  modeState.completeReason = reason;
  resetMobileControls();
  mouse.down = false;
  if (sessionMode === SESSION.HOST) {
    broadcastNetworkMessage({ type: "hostEnded" });
  }
  returnToMenu();
}

function failCurrentRun() {
  if (player) player.health = 0;
  if (currentGameMode !== GAME_MODE.ARENA) {
    modeState.failed = true;
    modeState.lostRunPoints = modeState.runPoints || 0;
    modeState.runPoints = 0;
  }
  gameState = STATE.GAME_OVER;
  mouse.down = false;
  resetMobileControls();
  if (sessionMode === SESSION.HOST) {
    broadcastNetworkMessage({ type: "snapshot", snapshot: createSnapshot() });
  }
}

function serializeModeState() {
  return {
    mode: currentGameMode,
    seed: modeState.seed || 0,
    mapKey: modeState.mapKey || "",
    floor: modeState.floor || 1,
    runPoints: modeState.runPoints || 0,
    choicePending: Boolean(modeState.choicePending),
    continued: Boolean(modeState.continued),
    hasRelic: Boolean(modeState.hasRelic),
    failed: Boolean(modeState.failed),
    lostRunPoints: modeState.lostRunPoints || 0,
    portal: modeState.portal ? { col: modeState.portal.col, row: modeState.portal.row, x: roundNet(modeState.portal.x), y: roundNet(modeState.portal.y) } : null,
    relic: modeState.relic ? { col: modeState.relic.col, row: modeState.relic.row, x: roundNet(modeState.relic.x), y: roundNet(modeState.relic.y) } : null,
    exit: modeState.exit ? { col: modeState.exit.col, row: modeState.exit.row, x: roundNet(modeState.exit.x), y: roundNet(modeState.exit.y) } : null
  };
}

function applyModeSnapshot(snapshotModeState) {
  if (!snapshotModeState) return;
  const incomingMode = getGameModeDefinition(snapshotModeState.mode).id;
  const incomingKey = snapshotModeState.mapKey || `${incomingMode}-${snapshotModeState.seed || 0}-${snapshotModeState.floor || 1}`;
  if (currentGameMode !== incomingMode || modeState.mapKey !== incomingKey) {
    modeState = createModeState(incomingMode, snapshotModeState);
    currentGameMode = incomingMode;
    applyModeMap(modeState);
  }
  Object.assign(modeState, {
    runPoints: snapshotModeState.runPoints || 0,
    choicePending: Boolean(snapshotModeState.choicePending),
    continued: Boolean(snapshotModeState.continued),
    hasRelic: Boolean(snapshotModeState.hasRelic),
    failed: Boolean(snapshotModeState.failed),
    lostRunPoints: snapshotModeState.lostRunPoints || 0,
    portal: snapshotModeState.portal || modeState.portal,
    relic: snapshotModeState.relic || modeState.relic,
    exit: snapshotModeState.exit || modeState.exit
  });
}

function createMazeModeMap(seed, floor) {
  const cols = 84;
  const rows = 60;
  const rng = createSeededRandom(seed + floor * 997);
  const grid = Array.from({ length: rows }, () => Array(cols).fill(" "));
  const start = { col: 5, row: 5 };
  carveRect(grid, 3, 3, 7, 7);
  const stack = [start];
  grid[start.row][start.col] = ".";
  const visited = new Set([`${start.col},${start.row}`]);
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const directions = shuffleDirections(rng);
    let carved = false;
    for (const direction of directions) {
      const next = { col: current.col + direction.x * 4, row: current.row + direction.y * 4 };
      if (next.col < 5 || next.col > cols - 6 || next.row < 5 || next.row > rows - 6) continue;
      const key = `${next.col},${next.row}`;
      if (visited.has(key)) continue;
      carveCorridor(grid, current, next, 3);
      grid[next.row][next.col] = ".";
      visited.add(key);
      stack.push(next);
      carved = true;
      break;
    }
    if (!carved) stack.pop();
  }
  for (let i = 0; i < 10 + floor; i += 1) {
    const roomCol = 8 + Math.floor(rng() * (cols - 18));
    const roomRow = 8 + Math.floor(rng() * (rows - 18));
    carveRect(grid, roomCol, roomRow, 5 + Math.floor(rng() * 5), 4 + Math.floor(rng() * 4));
  }
  addWallBorders(grid);
  const spawnTiles = [
    start,
    { col: start.col + 2, row: start.row },
    { col: start.col, row: start.row + 2 },
    { col: start.col + 2, row: start.row + 2 }
  ];
  const portalTile = findFarthestWalkableTile(grid, start);
  const portalWorld = tileToWorld(portalTile.col, portalTile.row);
  return {
    map: grid.map((row) => row.join("")),
    spawnTiles,
    portal: { ...portalTile, x: portalWorld.x, y: portalWorld.y }
  };
}

function createRelicDungeonModeMap(seed) {
  const cols = 84;
  const rows = 60;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(" "));
  const rooms = [
    { x: 5, y: 24, w: 14, h: 12 },
    { x: 26, y: 8, w: 15, h: 12 },
    { x: 27, y: 39, w: 16, h: 12 },
    { x: 56, y: 8, w: 19, h: 13 },
    { x: 56, y: 38, w: 19, h: 13 },
    { x: 42, y: 25, w: 14, h: 10 }
  ];
  for (const room of rooms) carveRect(grid, room.x, room.y, room.w, room.h);
  const centers = rooms.map((room) => ({ col: Math.floor(room.x + room.w / 2), row: Math.floor(room.y + room.h / 2) }));
  carveCorridor(grid, centers[0], centers[5], 3);
  carveCorridor(grid, centers[1], centers[5], 3);
  carveCorridor(grid, centers[2], centers[5], 3);
  carveCorridor(grid, centers[3], centers[5], 3);
  carveCorridor(grid, centers[4], centers[5], 3);
  carveCorridor(grid, centers[3], centers[4], 3);
  addWallBorders(grid);
  const exit = centers[0];
  const relic = centers[4];
  const exitWorld = tileToWorld(exit.col, exit.row);
  const relicWorld = tileToWorld(relic.col, relic.row);
  return {
    map: grid.map((row) => row.join("")),
    spawnTiles: [
      exit,
      { col: exit.col + 2, row: exit.row },
      { col: exit.col, row: exit.row + 2 },
      { col: exit.col + 2, row: exit.row + 2 }
    ],
    exit: { ...exit, x: exitWorld.x, y: exitWorld.y },
    relic: { ...relic, x: relicWorld.x, y: relicWorld.y }
  };
}

function findFarthestWalkableTile(grid, start) {
  const queue = [{ ...start, distance: 0 }];
  const seen = new Set([`${start.col},${start.row}`]);
  let farthest = start;
  for (let index = 0; index < queue.length; index += 1) {
    const tile = queue[index];
    if (tile.distance > (farthest.distance || 0)) farthest = tile;
    for (const neighbor of [
      { col: tile.col + 1, row: tile.row },
      { col: tile.col - 1, row: tile.row },
      { col: tile.col, row: tile.row + 1 },
      { col: tile.col, row: tile.row - 1 }
    ]) {
      const key = `${neighbor.col},${neighbor.row}`;
      if (seen.has(key) || grid[neighbor.row]?.[neighbor.col] !== ".") continue;
      seen.add(key);
      queue.push({ ...neighbor, distance: tile.distance + 1 });
    }
  }
  return { col: farthest.col, row: farthest.row };
}

function shuffleDirections(rng) {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];
  for (let i = directions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [directions[i], directions[j]] = [directions[j], directions[i]];
  }
  return directions;
}

function createSeededRandom(seed) {
  let state = (Math.round(seed) || 1) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createDungeonMap() {
  const cols = 84;
  const rows = 60;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(" "));
  const rooms = [
    { name: "northWestCombat", x: 4, y: 4, w: 16, h: 11 },
    { name: "northLibrary", x: 32, y: 4, w: 19, h: 10 },
    { name: "northEastVault", x: 64, y: 5, w: 16, h: 12 },
    { name: "westBarracks", x: 4, y: 23, w: 19, h: 14 },
    { name: "centralHub", x: 32, y: 24, w: 20, h: 15 },
    { name: "eastHall", x: 61, y: 23, w: 19, h: 15 },
    { name: "southWestCrypt", x: 7, y: 45, w: 19, h: 10 },
    { name: "southGallery", x: 34, y: 45, w: 20, h: 10 },
    { name: "southEastShrine", x: 64, y: 45, w: 16, h: 10 },
    { name: "westConnector", x: 24, y: 17, w: 8, h: 8 },
    { name: "eastConnector", x: 53, y: 17, w: 8, h: 8 },
    { name: "lowerWestConnector", x: 25, y: 38, w: 8, h: 6 },
    { name: "lowerEastConnector", x: 53, y: 38, w: 8, h: 6 }
  ];

  for (const room of rooms) {
    carveRect(grid, room.x, room.y, room.w, room.h);
  }

  const centers = rooms.map((room) => ({
    col: Math.floor(room.x + room.w / 2),
    row: Math.floor(room.y + room.h / 2)
  }));

  const links = [
    [0, 9], [9, 1], [1, 10], [10, 2],
    [0, 3], [3, 4], [4, 5], [5, 2],
    [3, 11], [11, 6], [4, 7], [5, 12], [12, 8],
    [6, 7], [7, 8],
    [9, 4], [10, 4], [11, 4], [12, 4]
  ];

  for (const [from, to] of links) {
    carveCorridor(grid, centers[from], centers[to], 3);
  }

  carveRect(grid, 38, 18, 8, 5);
  carveRect(grid, 38, 40, 8, 4);
  carveCorridor(grid, { col: 42, row: 20 }, { col: 42, row: 47 }, 3);
  carveCorridor(grid, { col: 13, row: 30 }, { col: 70, row: 30 }, 3);
  addWallBorders(grid);

  return grid.map((row) => row.join(""));
}

function carveRect(grid, x, y, width, height) {
  for (let row = y; row < y + height; row += 1) {
    for (let col = x; col < x + width; col += 1) {
      if (grid[row]?.[col] !== undefined) grid[row][col] = ".";
    }
  }
}

function carveCorridor(grid, from, to, width) {
  const half = Math.floor(width / 2);
  for (let col = Math.min(from.col, to.col); col <= Math.max(from.col, to.col); col += 1) {
    carveRect(grid, col - half, from.row - half, width, width);
  }
  for (let row = Math.min(from.row, to.row); row <= Math.max(from.row, to.row); row += 1) {
    carveRect(grid, to.col - half, row - half, width, width);
  }
}

function addWallBorders(grid) {
  const wallCandidates = [];
  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      if (grid[row][col] !== " ") continue;
      if (hasNeighborFloor(grid, col, row)) {
        wallCandidates.push({ col, row });
      }
    }
  }

  for (const tile of wallCandidates) {
    grid[tile.row][tile.col] = "#";
  }
}

function hasNeighborFloor(grid, col, row) {
  for (let y = row - 1; y <= row + 1; y += 1) {
    for (let x = col - 1; x <= col + 1; x += 1) {
      if (grid[y]?.[x] === ".") return true;
    }
  }
  return false;
}

function draw() {
  resizeCanvasToDisplaySize();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, RENDER_OFFSET_X, RENDER_OFFSET_Y);
  drawBackground();

  if (gameState === STATE.MENU) {
    drawMenu();
    drawSettingsButton();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return;
  }

  if (gameState === STATE.OPTIONS && previousGameState === STATE.MENU) {
    drawMenu();
    drawOptionsMenu();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return;
  }

  if (gameState === STATE.HOST_LOBBY) {
    drawHostLobby();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return;
  }

  if (gameState === STATE.JOIN_LOBBY) {
    drawJoinLobby();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return;
  }

  if (gameState === STATE.SHOP) {
    drawShop();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return;
  }

  if (gameState === STATE.EQUIPMENT) {
    drawEquipment();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return;
  }

  if (gameState === STATE.OPTIONS && (!player || previousGameState !== STATE.PLAYING)) {
    drawMenu();
    drawOptionsMenu();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return;
  }

  ctx.save();
  const zoom = getCameraZoom();
  ctx.scale(zoom, zoom);
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
  drawArena();
  drawEnvironmentProps(false);
  drawChests(false);
  drawXpOrbs();
  drawPickups();
  drawEffects();
  drawEnemies();
  drawModeObjects();
  drawPlayers();
  drawEnvironmentProps(true);
  drawChests(true);
  ctx.restore();
  drawHud();
  drawModeChoiceOverlay();
  if (gameState === STATE.PLAYING && sessionMode !== SESSION.SINGLE && getLocalPendingLevelUps() > 0 && !coopLevelMenuOpen) {
    drawCoopLevelUpButton();
  }

  if (gameState === STATE.LEVEL_UP) {
    drawLevelUp();
  }

  if (gameState === STATE.GAME_OVER) {
    drawGameOver();
  }

  if (gameState === STATE.OPTIONS) {
    drawOptionsMenu();
  } else if (coopLevelMenuOpen) {
    drawLevelUp();
  } else if (gameState === STATE.PLAYING) {
    drawSettingsButton();
    drawMagicButtons();
    drawMobileControls();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawBackground() {
  ctx.fillStyle = "#111418";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawArena() {
  ctx.fillStyle = TILE.voidColor;
  ctx.fillRect(ARENA.x, ARENA.y, ARENA.width, ARENA.height);

  const zoom = getCameraZoom();
  const viewportWidth = WIDTH / zoom;
  const viewportHeight = HEIGHT / zoom;
  const startCol = clamp(Math.floor(camera.x / MAP.tileSize) - 2, 0, MAP.cols - 1);
  const endCol = clamp(Math.ceil((camera.x + viewportWidth) / MAP.tileSize) + 2, 0, MAP.cols);
  const startRow = clamp(Math.floor(camera.y / MAP.tileSize) - 2, 0, MAP.rows - 1);
  const endRow = clamp(Math.ceil((camera.y + viewportHeight) / MAP.tileSize) + 2, 0, MAP.rows);

  for (let row = startRow; row < endRow; row += 1) {
    for (let col = startCol; col < endCol; col += 1) {
      const x = ARENA.x + col * MAP.tileSize;
      const y = ARENA.y + row * MAP.tileSize;
      const cell = getMapCell(col, row);

      if (cell === ".") {
        drawFloorTile(col, row, x, y);
      } else if (cell === "#") {
        drawBitlandsTile(getWallTileDefinition(col, row), x, y, MAP.tileSize, MAP.tileSize);
      } else {
        ctx.fillStyle = TILE.voidColor;
        ctx.fillRect(x, y, MAP.tileSize, MAP.tileSize);
      }
    }
  }

  ctx.strokeStyle = "#6d536f";
  ctx.lineWidth = 3;
  ctx.strokeRect(ARENA.x + ARENA.wall, ARENA.y + ARENA.wall, ARENA.width - ARENA.wall * 2, ARENA.height - ARENA.wall * 2);
  ctx.strokeStyle = "#120d18";
  ctx.lineWidth = 4;
  ctx.strokeRect(ARENA.x, ARENA.y, ARENA.width, ARENA.height);
}

function drawFloorTile(col, row, x, y) {
  ctx.fillStyle = "#2b3040";
  ctx.fillRect(x, y, MAP.tileSize, MAP.tileSize);

  const detailSeed = Math.abs(col * 13 + row * 17);
  if (detailSeed % 4 !== 0) return;

  const tile = TILE.floor[detailSeed % TILE.floor.length];
  drawBitlandsTile(tile, x, y, MAP.tileSize, MAP.tileSize);
}

function drawBitlandsTile(tile, dx, dy, dw, dh) {
  const image = SPRITES.bitlands.tileset;
  if (!isImageReady(image)) {
    ctx.fillStyle = tile === TILE.wall.fill[0] ? "#5f7594" : "#272d40";
    ctx.fillRect(dx, dy, dw, dh);
    return;
  }

  ctx.drawImage(
    image,
    tile.col * TILE.sourceSize,
    tile.row * TILE.sourceSize,
    TILE.sourceSize,
    TILE.sourceSize,
    dx,
    dy,
    dw,
    dh
  );
}

function getWallTileDefinition(col, row) {
  const floorUp = isWalkableTile(col, row - 1);
  const floorDown = isWalkableTile(col, row + 1);
  const floorLeft = isWalkableTile(col - 1, row);
  const floorRight = isWalkableTile(col + 1, row);

  if ((floorDown && floorRight) || (floorDown && floorLeft) || (floorUp && floorRight) || (floorUp && floorLeft)) {
    return TILE.wall.corner;
  }
  if (floorDown) return TILE.wall.top;
  if (floorUp) return TILE.wall.bottom;
  if (floorRight) return TILE.wall.left;
  if (floorLeft) return TILE.wall.right;
  return TILE.wall.fill[Math.abs(col + row) % TILE.wall.fill.length];
}

function getMapCell(col, row) {
  if (!isInsideMap(col, row)) return " ";
  return DUNGEON_MAP[row][col];
}

function drawEnvironmentProps(foreground) {
  for (const prop of ENVIRONMENT_PROPS) {
    const position = tileToWorld(prop.col, prop.row);
    const isForeground = prop.row > worldToTile(player?.x ?? position.x, player?.y ?? position.y).row;
    if (isForeground !== foreground) continue;

    if (prop.type === "torch") {
      drawSpriteFrame(SPRITES.bitlands.torch, 16, 16, getLoopFrame(4, 0.14), position.x, position.y, 16 * prop.scale / 16);
    } else if (prop.type === "barrel") {
      drawCenteredImage(SPRITES.bitlands.barrel, position.x, position.y, 16 * prop.scale, 16 * prop.scale);
    } else if (prop.type === "banner") {
      drawCenteredImage(SPRITES.bitlands.banner, position.x, position.y, 16 * prop.scale, 16 * prop.scale);
    }
  }
}

function drawChests(foreground) {
  for (const chest of chests) {
    const isForeground = chest.row > worldToTile(player?.x ?? chest.x, player?.y ?? chest.y).row;
    if (isForeground !== foreground) continue;
    drawChest(chest);
  }
}

function drawChest(chest) {
  const image = chest.opened ? SPRITES.bitlands.chestOpen : SPRITES.bitlands.chest;
  const width = 70;
  const height = 36;

  ctx.save();
  ctx.globalAlpha = chest.opened ? 0.86 : 1;
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(chest.x - 28, chest.y + 10, 56, 10);
  if ((chest.hitFlash || 0) > 0) {
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(chest.x - 31, chest.y - 18, 62, 34);
  }
  if (isImageReady(image)) {
    drawCenteredImage(image, chest.x, chest.y, width, height);
  } else {
    ctx.fillStyle = chest.opened ? "#8a5a37" : "#b47a3c";
    ctx.fillRect(chest.x - 25, chest.y - 12, 50, 24);
    ctx.fillStyle = chest.opened ? "#4f3124" : "#f7c66a";
    ctx.fillRect(chest.x - 21, chest.y - 7, 42, 6);
    ctx.strokeStyle = "#2b1c17";
    ctx.lineWidth = 3;
    ctx.strokeRect(chest.x - 25, chest.y - 12, 50, 24);
  }
  ctx.restore();
}

function drawPlayers() {
  for (const activePlayer of players) {
    if (!activePlayer || activePlayer.connected === false) continue;
    drawPlayer(activePlayer);
  }
}

function drawPlayer(activePlayer = player) {
  if (!activePlayer) return;
  if (activePlayer.shieldActive) {
    drawShieldVfx(activePlayer);
  }

  ctx.save();
  ctx.strokeStyle = activePlayer.color || "#75d7ff";
  ctx.lineWidth = activePlayer.id === localPlayerId ? 4 : 3;
  ctx.globalAlpha = activePlayer.health > 0 ? 0.85 : 0.35;
  ctx.beginPath();
  ctx.ellipse(activePlayer.x, activePlayer.y + 18, 20, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  const direction = getDirectionFromAngle(activePlayer.angle);
  const attacking = activePlayer.attackTimer > 0;
  const animation = attacking ? "attack" : activePlayer.moving ? "run" : "idle";
  const frame = attacking
    ? Math.min(7, Math.floor((1 - activePlayer.attackTimer / activePlayer.attackDuration) * 8))
    : getLoopFrame(8, activePlayer.moving ? 0.08 : 0.14);

  if (attacking && activePlayer.dualSwordTimer > 0) {
    drawRearAttackSprite(activePlayer, frame);
  }

  if (activePlayer.invulnerableTimer > 0 || activePlayer.health <= 0) {
    ctx.globalAlpha = activePlayer.health <= 0 ? 0.45 : 0.72;
  }

  drawSpriteFrame(
    SPRITES.adventurer[animation][direction],
    SPRITES.adventurer.frameWidth,
    SPRITES.adventurer.frameHeight,
    frame,
    activePlayer.x,
    activePlayer.y + 2,
    SPRITES.adventurer.scale
  );
  ctx.globalAlpha = 1;

  if (sessionMode !== SESSION.SINGLE) {
    ctx.fillStyle = activePlayer.color || "#f4f6f8";
    ctx.font = "800 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(activePlayer.name || activePlayer.id, activePlayer.x, activePlayer.y - 44);
    ctx.textAlign = "left";
  }
}

function drawRearAttackSprite(activePlayer, frame) {
  const direction = getDirectionFromAngle(activePlayer.angle + Math.PI);
  const image = SPRITES.adventurer.attack[direction];
  const frameWidth = SPRITES.adventurer.frameWidth;
  const frameHeight = SPRITES.adventurer.frameHeight;
  const scale = SPRITES.adventurer.scale;
  const drawWidth = frameWidth * scale;
  const drawHeight = frameHeight * scale;
  const left = Math.round(activePlayer.x - drawWidth / 2);
  const top = Math.round(activePlayer.y + 2 - drawHeight / 2);
  const clipPadding = 14;

  ctx.save();
  ctx.beginPath();
  if (direction === "left") {
    ctx.rect(left, top, drawWidth / 2 - clipPadding, drawHeight);
  } else if (direction === "right") {
    ctx.rect(activePlayer.x + clipPadding, top, drawWidth / 2 - clipPadding, drawHeight);
  } else if (direction === "up") {
    ctx.rect(left, top, drawWidth, drawHeight / 2 - clipPadding);
  } else {
    ctx.rect(left, activePlayer.y + clipPadding, drawWidth, drawHeight / 2 - clipPadding);
  }
  ctx.clip();
  drawSpriteFrame(image, frameWidth, frameHeight, frame, activePlayer.x, activePlayer.y + 2, scale);
  ctx.restore();
}

function drawShieldVfx(activePlayer = player) {
  const shield = SPRITES.vfx.electricShield;
  const frame = getLoopFrame(shield.frames, 0.033);
  ctx.save();
  ctx.globalAlpha = 0.9;
  drawSpriteSheetGridFrame(
    shield.image,
    shield.frameWidth,
    shield.frameHeight,
    shield.columns,
    frame,
    activePlayer.x,
    activePlayer.y - 2,
    shield.scale
  );
  ctx.restore();
}

function drawEnemies() {
  for (const enemy of enemies) {
    const sprite = SPRITES.enemies[enemy.kind] || SPRITES.enemies.skeleton1;
    const frame = Math.floor((performance.now() / 95 + enemy.animOffset) % sprite.frames);
    if (enemy.hitFlash > 0) {
      ctx.globalAlpha = 0.58;
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(enemy.x - 22, enemy.y - 28, 44, 48);
      ctx.globalAlpha = 1;
    }
    if ((enemy.magicFlash || 0) > 0 || (enemy.burnTimer || enemy.slowTimer || enemy.stunTimer || enemy.rootTimer) > 0) {
      ctx.globalAlpha = 0.36;
      ctx.fillStyle = enemy.magicColor || "#75d7ff";
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y + 4, enemy.size * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    drawSpriteFrame(sprite.image, sprite.frameWidth, sprite.frameHeight, frame, enemy.x, enemy.y - 4, sprite.scale);

    if (enemy.maxHealth > 1) {
      const barWidth = enemy.size + 8;
      const healthRatio = clamp(enemy.health / enemy.maxHealth, 0, 1);
      ctx.fillStyle = "#2b3138";
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size / 2 - 9, barWidth, 4);
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size / 2 - 9, barWidth * healthRatio, 4);
    }
  }
}

function drawXpOrbs() {
  for (const orb of xpOrbs) {
    const bobSize = orb.size + Math.sin(orb.bob) * 1.5;
    ctx.fillStyle = "#8de85c";
    ctx.fillRect(orb.x - bobSize / 2, orb.y - bobSize / 2, bobSize, bobSize);
    ctx.strokeStyle = "#d5ff9f";
    ctx.lineWidth = 1;
    ctx.strokeRect(orb.x - bobSize / 2, orb.y - bobSize / 2, bobSize, bobSize);
  }
}

function drawPickups() {
  for (const pickup of pickups) {
    ctx.save();
    ctx.translate(pickup.x, pickup.y);
    ctx.rotate(performance.now() / 600);
    ctx.fillStyle = pickup.type === "shield" ? "#75d7ff" : "#ff9f1c";
    ctx.fillRect(-pickup.size / 2, -pickup.size / 2, pickup.size, pickup.size);
    ctx.strokeStyle = "#f4f6f8";
    ctx.lineWidth = 2;
    ctx.strokeRect(-pickup.size / 2, -pickup.size / 2, pickup.size, pickup.size);
    ctx.restore();
  }
}

function drawEffects() {
  for (const effect of effects) {
    const alpha = clamp(effect.life / effect.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = effect.color;
    ctx.fillRect(effect.x - effect.size / 2, effect.y - effect.size / 2, effect.size, effect.size);
    ctx.globalAlpha = 1;
  }
}

function drawModeObjects() {
  if (currentGameMode === GAME_MODE.MAZE && modeState.portal) {
    const pulse = 0.75 + Math.sin(performance.now() / 220) * 0.16;
    ctx.save();
    ctx.strokeStyle = modeState.floor >= 6 ? "#ffd166" : "#75d7ff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(modeState.portal.x, modeState.portal.y, 24 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(117, 215, 255, 0.22)";
    ctx.beginPath();
    ctx.arc(modeState.portal.x, modeState.portal.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (currentGameMode === GAME_MODE.DUNGEON) {
    if (modeState.exit) {
      ctx.save();
      ctx.strokeStyle = modeState.hasRelic ? "#8de85c" : "#75d7ff";
      ctx.lineWidth = 4;
      ctx.strokeRect(modeState.exit.x - 24, modeState.exit.y - 24, 48, 48);
      ctx.fillStyle = "rgba(117, 215, 255, 0.18)";
      ctx.fillRect(modeState.exit.x - 20, modeState.exit.y - 20, 40, 40);
      ctx.restore();
    }
    if (!modeState.hasRelic && modeState.relic) {
      ctx.save();
      ctx.translate(modeState.relic.x, modeState.relic.y);
      ctx.rotate(performance.now() / 700);
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(-12, -12, 24, 24);
      ctx.strokeStyle = "#f4f6f8";
      ctx.lineWidth = 3;
      ctx.strokeRect(-12, -12, 24, 24);
      ctx.restore();
    }
  }
}

function drawModeChoiceOverlay() {
  modeChoiceButtons = [];
  if (!modeState.choicePending || currentGameMode !== GAME_MODE.MAZE) return;
  ctx.save();
  ctx.fillStyle = "rgba(8, 11, 16, 0.78)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 42px system-ui, sans-serif";
  ctx.fillText("Floor 5 Portal", WIDTH / 2, HEIGHT / 2 - 108);
  ctx.fillStyle = "#cbd5df";
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillText(`Bank ${modeState.runPoints || 0} run points now, or continue to harder floors for better rewards.`, WIDTH / 2, HEIGHT / 2 - 62);
  if (sessionMode === SESSION.CLIENT) {
    ctx.fillStyle = "#ffd166";
    ctx.font = "800 20px system-ui, sans-serif";
    ctx.fillText("Waiting for host choice...", WIDTH / 2, HEIGHT / 2 + 18);
    ctx.restore();
    return;
  }
  const exitButton = drawButton(WIDTH / 2 - 250, HEIGHT / 2, 220, 58, "Exit & Bank");
  const continueButton = drawButton(WIDTH / 2 + 30, HEIGHT / 2, 220, 58, "Continue");
  modeChoiceButtons.push({ ...exitButton, action: chooseMazeExit });
  modeChoiceButtons.push({ ...continueButton, action: chooseMazeContinue });
  ctx.restore();
}

function drawHud() {
  if (!player) return;
  const healthRatio = clamp(player.health / player.maxHealth, 0, 1);
  const xpRatio = clamp(player.xp / player.xpToNext, 0, 1);

  ctx.fillStyle = "#f4f6f8";
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillText(getModeHudTitle(), 62, 38);
  ctx.fillText(`Enemies ${enemies.length}`, 322, 38);
  ctx.fillText(`Level ${player.level}`, 542, 38);
  ctx.fillText(`Kills ${permanent.killPoints}`, 742, 38);
  if (sessionMode !== SESSION.SINGLE) {
    ctx.fillText(`${sessionMode === SESSION.HOST ? "Host" : "Client"} P${localPlayerId.replace("p", "")}`, 922, 38);
  }

  drawBar(62, 50, 230, 16, healthRatio, healthRatio > 0.35 ? "#06d6a0" : "#ef476f");
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.fillText(`HP ${Math.ceil(player.health)} / ${player.maxHealth}`, 302, 63);

  drawBar(542, 50, 230, 16, xpRatio, "#8de85c");
  ctx.fillStyle = "#f4f6f8";
  ctx.fillText(`XP ${player.xp} / ${player.xpToNext}`, 782, 63);

  if (currentGameMode !== GAME_MODE.ARENA) {
    ctx.fillStyle = "#ffd166";
    ctx.font = "800 16px system-ui, sans-serif";
    ctx.fillText(`Run Points ${modeState.runPoints || 0}`, 62, 94);
    ctx.fillStyle = "#f4f6f8";
    ctx.font = "700 15px system-ui, sans-serif";
    ctx.fillText(getModeObjectiveText(), 62, 118);
  }

  let indicatorX = 978;
  if (player.shieldActive) {
    drawStatusPill(indicatorX, 46, 92, "Shield", "#75d7ff");
    indicatorX += 102;
  }
  if (player.dualSwordTimer > 0) {
    drawStatusPill(indicatorX, 46, 134, `Dual ${Math.ceil(player.dualSwordTimer)}s`, "#ff9f1c");
  }

  if (currentGameMode === GAME_MODE.ARENA && enemies.length === 0 && nextWaveTimer > 0) {
    ctx.fillStyle = "rgba(244, 246, 248, 0.86)";
    ctx.font = "700 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Wave cleared", WIDTH / 2, 124);
    ctx.textAlign = "left";
  }
}

function drawMobileControls() {
  drawJoystick(mobileInput.move, "#75d7ff");
  drawJoystick(mobileInput.aim, "#ff9f1c");

  if (!MOBILE_DEBUG_OVERLAY) return;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(8, 11, 16, 0.72)";
  ctx.fillRect(18, HEIGHT - 120, 340, 102);
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "600 14px system-ui, sans-serif";
  ctx.fillText(`Move ${mobileInput.move.vectorX.toFixed(2)}, ${mobileInput.move.vectorY.toFixed(2)}`, 30, HEIGHT - 108);
  ctx.fillText(`Aim ${mobileInput.aim.vectorX.toFixed(2)}, ${mobileInput.aim.vectorY.toFixed(2)}`, 30, HEIGHT - 84);
  ctx.fillText(`Attacking ${mobileInput.attackActive ? "true" : "false"}`, 30, HEIGHT - 60);
  if (sessionMode !== SESSION.SINGLE) {
    ctx.fillText(`Net ${sessionMode} in ${networkDebug.snapshotInRate}/s out ${networkDebug.snapshotOutRate}/s`, 30, HEIGHT - 36);
  }
  ctx.restore();
}

function drawMagicButtons() {
  magicButtons = [];
  if (!player || player.health <= 0) return;
  const equipped = getEquippedMagicDefinitions(player).slice(0, 2);
  if (equipped.length === 0) return;
  const size = 74;
  const gap = 14;
  const startX = WIDTH - 32 - size;
  const startY = HEIGHT - 34 - size;
  for (let i = 0; i < equipped.length; i += 1) {
    const magic = equipped[i];
    const x = startX - i * (size + gap);
    const y = startY;
    const cooldown = Math.max(0, player.magicCooldowns?.[magic.id] || 0);
    const ready = cooldown <= 0;
    const hovered = pointInRect(mouse.x, mouse.y, x, y, size, size);
    ctx.save();
    ctx.fillStyle = ready ? (hovered ? "rgba(244, 246, 248, 0.22)" : "rgba(8, 11, 16, 0.84)") : "rgba(8, 11, 16, 0.58)";
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = magic.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, size, size);
    if (!ready) {
      const fillHeight = size * clamp(cooldown / magic.cooldown, 0, 1);
      ctx.fillStyle = "rgba(0, 0, 0, 0.52)";
      ctx.fillRect(x, y + size - fillHeight, size, fillHeight);
    }
    ctx.fillStyle = ready ? magic.color : "#aab4bf";
    ctx.font = "900 15px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(magic.shortName, x + size / 2, y + 27);
    ctx.fillStyle = "#f4f6f8";
    ctx.font = "800 13px system-ui, sans-serif";
    ctx.fillText(ready ? `${i + 1}` : `${Math.ceil(cooldown)}s`, x + size / 2, y + 53);
    ctx.restore();
    magicButtons.push({ x, y, width: size, height: size, slot: i });
  }
}

function getModeHudTitle() {
  if (currentGameMode === GAME_MODE.MAZE) return `Maze F${modeState.floor || 1}`;
  if (currentGameMode === GAME_MODE.DUNGEON) return "Dungeon";
  return `Wave ${wave}`;
}

function getModeObjectiveText() {
  if (currentGameMode === GAME_MODE.MAZE) {
    if (modeState.choicePending) return "Floor 5 portal: choose Exit or Continue";
    if ((modeState.floor || 1) >= 10) return "Find the final portal to extract";
    return `Find the portal to floor ${(modeState.floor || 1) + 1}`;
  }
  if (currentGameMode === GAME_MODE.DUNGEON) {
    return modeState.hasRelic ? "Relic secured: return to the exit" : "Find the relic";
  }
  return "Survive the arena";
}

function drawCoopLevelUpButton() {
  const size = 74;
  const x = 32;
  const y = 28;
  const pending = getLocalPendingLevelUps();
  const hovered = pointInRect(mouse.x, mouse.y, x, y, size, size);
  levelUpButton = { x, y, width: size, height: size };

  ctx.save();
  ctx.fillStyle = hovered ? "rgba(141, 232, 92, 0.34)" : "rgba(8, 11, 16, 0.82)";
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "#8de85c";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, size, size);
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "900 25px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("UP", x + size / 2, y + 30);
  ctx.font = "800 16px system-ui, sans-serif";
  ctx.fillText(`x${pending}`, x + size / 2, y + 54);
  ctx.restore();
}

function drawSettingsButton() {
  const size = 68;
  const x = WIDTH - size - 32;
  const y = 28;
  const hovered = pointInRect(mouse.x, mouse.y, x, y, size, size);
  settingsButton = { x, y, width: size, height: size };

  ctx.save();
  ctx.fillStyle = hovered ? "rgba(117, 215, 255, 0.34)" : "rgba(8, 11, 16, 0.82)";
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "#75d7ff";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, size, size);
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⚙", x + size / 2, y + size / 2 + 1);
  ctx.textBaseline = "alphabetic";
  drawGearGlyph(x + size / 2, y + size / 2, size * 0.28);
  ctx.restore();
}

function drawGearGlyph(centerX, centerY, radius) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.strokeStyle = "#f4f6f8";
  ctx.fillStyle = "#f4f6f8";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * 2 * i) / 8;
    const inner = radius * 0.86;
    const outer = radius * 1.28;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawOptionsMenu() {
  optionsButtons = [];
  ctx.save();
  ctx.fillStyle = "rgba(8, 11, 16, 0.76)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const panelWidth = 520;
  const panelHeight = 430;
  const x = WIDTH / 2 - panelWidth / 2;
  const y = HEIGHT / 2 - panelHeight / 2;
  ctx.fillStyle = "#202832";
  ctx.fillRect(x, y, panelWidth, panelHeight);
  ctx.strokeStyle = "#75d7ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, panelWidth, panelHeight);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 40px system-ui, sans-serif";
  ctx.fillText("Options", WIDTH / 2, y + 66);
  ctx.fillStyle = "#cbd5df";
  ctx.font = "600 18px system-ui, sans-serif";
  ctx.fillText("Camera Zoom", WIDTH / 2, y + 112);

  const buttonWidth = 150;
  const buttonHeight = 50;
  const gap = 18;
  const startX = WIDTH / 2 - (buttonWidth * ZOOM_OPTIONS.length + gap * (ZOOM_OPTIONS.length - 1)) / 2;
  for (let i = 0; i < ZOOM_OPTIONS.length; i += 1) {
    const option = ZOOM_OPTIONS[i];
    const selected = settings.zoom === option.id;
    drawOptionButton(startX + i * (buttonWidth + gap), y + 142, buttonWidth, buttonHeight, option.label, selected, () => {
      setZoom(option.id);
    });
  }

  const closeLabel = previousGameState === STATE.MENU ? "Back to Menu" : "Resume";
  drawOptionButton(WIDTH / 2 - 170, y + 240, 340, 54, closeLabel, false, closeOptionsMenu);
  if (previousGameState === STATE.PLAYING) {
    drawOptionButton(WIDTH / 2 - 170, y + 312, 340, 54, "Leave Match / Main Menu", false, returnToMenu);
  }
  ctx.restore();
}

function drawOptionButton(x, y, width, height, label, selected, action) {
  const hovered = pointInRect(mouse.x, mouse.y, x, y, width, height);
  ctx.fillStyle = selected ? "#75d7ff" : hovered ? "#dbe4ec" : "#2f3b48";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = selected ? "#f4f6f8" : "#7b8a99";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = selected ? "#101216" : hovered ? "#101216" : "#f4f6f8";
  ctx.font = "800 17px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + width / 2, y + height / 2);
  ctx.textBaseline = "alphabetic";
  optionsButtons.push({ x, y, width, height, action });
}

function drawJoystick(joystick, color) {
  if (joystick.pointerId === null) return;

  ctx.save();
  ctx.globalAlpha = 0.72;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(joystick.originX, joystick.originY, getJoystickMaxRadius(), 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = joystick.active ? 0.92 : 0.48;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(joystick.thumbX, joystick.thumbY, getJoystickThumbRadius(), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(244, 246, 248, 0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawBar(x, y, width, height, ratio, color) {
  ctx.fillStyle = "#2b3138";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width * ratio, height);
  ctx.strokeStyle = "#f4f6f8";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
}

function drawStatusPill(x, y, width, text, color) {
  ctx.fillStyle = "#202832";
  ctx.fillRect(x, y, width, 24);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, 24);
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "700 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, x + width / 2, y + 16);
  ctx.textAlign = "left";
}

function formatMultiplier(value) {
  return `${Number(value).toFixed(2).replace(/\.?0+$/, "")}x`;
}

function truncateText(text, maxLength) {
  const value = String(text || "");
  return value.length > maxLength ? `${value.slice(0, Math.max(0, maxLength - 3))}...` : value;
}

function drawMenu() {
  drawArenaPreview();
  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 62px system-ui, sans-serif";
  ctx.fillText("Blade Box Arena", WIDTH / 2, 236);
  ctx.fillStyle = "#cbd5df";
  ctx.font = "500 20px system-ui, sans-serif";
  ctx.fillText("Collect XP, choose upgrades, bank kill points, and push deeper waves.", WIDTH / 2, 280);
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 22px system-ui, sans-serif";
  const equippedMagic = getEquippedMagicDefinitions().map((magic) => magic.name).join(" / ") || "No Magic";
  ctx.fillText(`Kill Points: ${permanent.killPoints}   Sword: ${SWORD_TIERS[permanent.swordTier].name}   Weapon: ${getSelectedWeapon().name}`, WIDTH / 2, 326);
  ctx.font = "700 17px system-ui, sans-serif";
  ctx.fillText(`Magic: ${equippedMagic}`, WIDTH / 2, 354);

  modeButtons = [];
  ctx.font = "800 18px system-ui, sans-serif";
  ctx.fillStyle = "#f4f6f8";
  ctx.fillText("Game Mode", WIDTH / 2, 392);
  for (let i = 0; i < GAME_MODE_DEFINITIONS.length; i += 1) {
    const mode = GAME_MODE_DEFINITIONS[i];
    const x = WIDTH / 2 - 330 + i * 230;
    const button = drawToggleButton(x, 410, 200, 50, mode.label, selectedGameMode === mode.id);
    ctx.fillStyle = selectedGameMode === mode.id ? "#f4f6f8" : "#cbd5df";
    ctx.font = "600 12px system-ui, sans-serif";
    ctx.fillText(mode.detail, x + 100, 474);
    modeButtons.push({ ...button, modeId: mode.id });
  }

  menuButton = drawButton(WIDTH / 2 - 330, 506, 200, 56, "Single Player");
  hostButton = drawButton(WIDTH / 2 - 100, 506, 200, 56, "Host Co-op");
  joinButton = drawButton(WIDTH / 2 + 130, 506, 200, 56, "Join Co-op");
  shopButton = drawButton(WIDTH / 2 - 220, 580, 200, 54, "Shop");
  equipmentButton = drawButton(WIDTH / 2 + 20, 580, 200, 54, "Equipment");
  ctx.textAlign = "left";
}

function drawArenaPreview() {
  const savedCamera = camera;
  const previewCenter = tileToWorld(42, 30);
  const zoom = getCameraZoom();
  camera = getCameraForPosition(previewCenter.x, previewCenter.y);
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
  drawArena();
  drawEnvironmentProps(false);
  const idleFrame = getLoopFrame(8, 0.14);
  const enemyFrame = getLoopFrame(10, 0.1);
  const hero = tileToWorld(42, 30);
  const skeleton = tileToWorld(38, 30);
  const vampire = tileToWorld(47, 28);
  drawSpriteFrame(SPRITES.adventurer.idle.down, SPRITES.adventurer.frameWidth, SPRITES.adventurer.frameHeight, idleFrame, hero.x, hero.y, SPRITES.adventurer.scale);
  drawSpriteFrame(SPRITES.enemies.skeleton1.image, 32, 32, enemyFrame, skeleton.x, skeleton.y, 1.75);
  drawSpriteFrame(SPRITES.enemies.vampire.image, 32, 32, enemyFrame % 8, vampire.x, vampire.y, 1.75);
  drawEnvironmentProps(true);
  ctx.restore();
  camera = savedCamera;
  ctx.fillStyle = "#8de85c";
  ctx.fillRect(WIDTH / 2 + 80, 590, 12, 12);
  ctx.fillStyle = "#75d7ff";
  ctx.fillRect(WIDTH / 2 - 86, 500, 16, 16);
}

function drawHostLobby() {
  drawArenaPreview();
  ctx.fillStyle = "rgba(12, 14, 18, 0.78)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 50px system-ui, sans-serif";
  ctx.fillText("Host Co-op Lobby", WIDTH / 2, 170);
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.fillStyle = "#75d7ff";
  ctx.fillText(`${hostIpAddress}:${NETWORK_PORT}`, WIDTH / 2, 214);
  ctx.fillStyle = "#cbd5df";
  ctx.font = "600 17px system-ui, sans-serif";
  ctx.fillText(networkStatus, WIDTH / 2, 248);
  ctx.fillStyle = "#ffd166";
  ctx.font = "800 18px system-ui, sans-serif";
  ctx.fillText(`Mode: ${getGameModeDefinition(selectedGameMode).label}`, WIDTH / 2, 272);

  ctx.fillStyle = "#202832";
  ctx.fillRect(WIDTH / 2 - 260, 282, 520, 270);
  ctx.strokeStyle = "#5d6e7e";
  ctx.lineWidth = 2;
  ctx.strokeRect(WIDTH / 2 - 260, 282, 520, 270);
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 22px system-ui, sans-serif";
  ctx.fillText(`Players ${lobbyPlayers.length} / ${MAX_COOP_PLAYERS}`, WIDTH / 2, 326);

  ctx.font = "700 18px system-ui, sans-serif";
  for (let i = 0; i < MAX_COOP_PLAYERS; i += 1) {
    const lobbyPlayer = lobbyPlayers[i];
    const label = lobbyPlayer ? `${lobbyPlayer.id.toUpperCase()}  ${lobbyPlayer.name}` : `P${i + 1}  Waiting...`;
    ctx.fillStyle = lobbyPlayer ? PLAYER_COLORS[i] : "#7b8a99";
    ctx.fillText(label, WIDTH / 2, 370 + i * 34);
  }

  ctx.fillStyle = "#cbd5df";
  ctx.font = "700 16px system-ui, sans-serif";
  ctx.fillText("Host Snapshot Rate", WIDTH / 2, 584);
  hostLobbyButtons.rate45 = drawToggleButton(WIDTH / 2 - 185, 604, 170, 48, "45Hz Default", hostSnapshotRate === 45);
  hostLobbyButtons.rate60 = drawToggleButton(WIDTH / 2 + 15, 604, 170, 48, "60Hz Smooth", hostSnapshotRate === 60);

  hostLobbyButtons.start = drawButton(WIDTH / 2 - 220, 704, 200, 56, "Start Game", !NativeLocalNetwork);
  hostLobbyButtons.back = drawButton(WIDTH / 2 + 20, 704, 200, 56, "Back");
  ctx.textAlign = "left";
}

function drawJoinLobby() {
  drawArenaPreview();
  ctx.fillStyle = "rgba(12, 14, 18, 0.78)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 50px system-ui, sans-serif";
  ctx.fillText("Join Co-op Lobby", WIDTH / 2, 170);
  ctx.fillStyle = "#cbd5df";
  ctx.font = "600 18px system-ui, sans-serif";
  ctx.fillText("Select a discovered lobby or use manual IP join.", WIDTH / 2, 214);
  ctx.fillText(`Host: ${joinHostAddress || "Tap Edit IP"}:${joinPort}`, WIDTH / 2, 252);
  ctx.fillStyle = "#75d7ff";
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillText(networkStatus, WIDTH / 2, 288);

  joinLobbyButtons.edit = drawButton(WIDTH / 2 - 320, 340, 190, 56, "Edit IP");
  joinLobbyButtons.connect = drawButton(WIDTH / 2 - 95, 340, 190, 56, "Connect", !NativeLocalNetwork || !joinHostAddress);
  joinLobbyButtons.back = drawButton(WIDTH / 2 + 130, 340, 190, 56, "Back");
  joinLobbyButtons.discovered = [];

  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 22px system-ui, sans-serif";
  ctx.fillText("Discovered Lobbies", WIDTH / 2, 456);
  const visibleLobbies = getVisibleDiscoveredLobbies();
  if (visibleLobbies.length === 0) {
    ctx.fillStyle = "#9aa7b4";
    ctx.font = "700 17px system-ui, sans-serif";
    ctx.fillText(NativeLocalNetwork ? "Searching local WiFi..." : "Android APK required for auto search", WIDTH / 2, 500);
  } else {
    for (let i = 0; i < Math.min(visibleLobbies.length, 4); i += 1) {
      const lobby = visibleLobbies[i];
      const button = drawButton(WIDTH / 2 - 220, 480 + i * 58, 440, 46, `${lobby.name}  ${lobby.ip}:${lobby.port}`);
      joinLobbyButtons.discovered.push({ ...button, lobby });
    }
  }

  if (lobbyPlayers.length > 0) {
    ctx.fillStyle = "#f4f6f8";
    ctx.font = "800 22px system-ui, sans-serif";
    ctx.fillText("Lobby Players", WIDTH / 2, 730);
    ctx.font = "700 18px system-ui, sans-serif";
    for (let i = 0; i < lobbyPlayers.length; i += 1) {
      ctx.fillStyle = PLAYER_COLORS[i] || "#f4f6f8";
      ctx.fillText(`${lobbyPlayers[i].id.toUpperCase()}  ${lobbyPlayers[i].name}`, WIDTH / 2, 768 + i * 32);
    }
  }
  ctx.textAlign = "left";
}

function drawShop() {
  drawArenaPreview();
  ctx.fillStyle = "rgba(12, 14, 18, 0.72)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 52px system-ui, sans-serif";
  ctx.fillText("Shop", WIDTH / 2, 150);
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.fillText(`Kill Points: ${permanent.killPoints}`, WIDTH / 2, 190);

  shopPurchaseButtons = [];
  weaponSelectButtons = [];
  magicPurchaseButtons = [];
  const startX = WIDTH / 2 - 480;
  for (let tier = 1; tier < SWORD_TIERS.length; tier += 1) {
    drawShopTier(startX + (tier - 1) * 320, 232, tier);
  }

  drawWeaponSelector(WIDTH / 2 - 540, 590);
  drawMagicShop(WIDTH / 2 - 432, 748);

  shopBackButton = drawButton(WIDTH - 250, 126, 190, 50, "Back");
  ctx.textAlign = "left";
}

function drawShopTier(x, y, tier) {
  const upgrade = SWORD_TIERS[tier];
  const purchased = permanent.swordTier >= tier;
  const locked = permanent.swordTier < tier - 1;
  const affordable = permanent.killPoints >= upgrade.cost;
  const canBuy = !purchased && !locked && affordable;

  ctx.fillStyle = "#202832";
  ctx.fillRect(x, y, 280, 330);
  ctx.strokeStyle = purchased ? "#8de85c" : "#5d6e7e";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 280, 330);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 24px system-ui, sans-serif";
  ctx.fillText(upgrade.name, x + 140, y + 48);
  ctx.font = "600 17px system-ui, sans-serif";
  ctx.fillStyle = "#cbd5df";
  ctx.fillText(`${upgrade.damage}x sword damage`, x + 140, y + 104);
  ctx.fillText(`${upgrade.speed}x swing speed`, x + 140, y + 136);
  ctx.fillText(`Cost: ${upgrade.cost} kill points`, x + 140, y + 188);

  let label = "Buy";
  if (purchased) label = "Purchased";
  if (locked) label = "Locked";
  if (!purchased && !locked && !affordable) label = "Need Points";

  const button = drawButton(x + 55, y + 238, 170, 48, label, !canBuy && !purchased);
  shopPurchaseButtons.push({ ...button, tier, canBuy });
}

function drawWeaponSelector(x, y) {
  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 22px system-ui, sans-serif";
  ctx.fillText("Weapons", WIDTH / 2, y);
  ctx.fillStyle = "#cbd5df";
  ctx.font = "600 15px system-ui, sans-serif";
  ctx.fillText("Buy here, equip from Equipment.", WIDTH / 2, y + 24);

  for (let i = 0; i < WEAPON_DEFINITIONS.length; i += 1) {
    const weapon = WEAPON_DEFINITIONS[i];
    const col = i % 5;
    const row = Math.floor(i / 5);
    const buttonX = x + col * 216;
    const buttonY = y + 42 + row * 54;
    const owned = isWeaponOwned(weapon.id);
    const affordable = permanent.killPoints >= weapon.cost;
    const label = owned ? weapon.name : `${weapon.name} ${weapon.cost}`;
    const button = drawToggleButton(buttonX, buttonY, 202, 44, label, owned);
    ctx.fillStyle = owned ? "#8de85c" : affordable ? "#cbd5df" : "#7b8a99";
    ctx.font = "600 11px system-ui, sans-serif";
    ctx.fillText(`${weapon.category}  ${formatMultiplier(weapon.damageMultiplier)}  ${weapon.range}`, buttonX + 101, buttonY + 58);
    weaponSelectButtons.push({ ...button, weaponId: weapon.id, canBuy: !owned && affordable });
  }
}

function drawMagicShop(x, y) {
  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 22px system-ui, sans-serif";
  ctx.fillText("Magic", WIDTH / 2, y);
  for (let i = 0; i < MAGIC_DEFINITIONS.length; i += 1) {
    const magic = MAGIC_DEFINITIONS[i];
    const buttonX = x + i * 216;
    const owned = isMagicOwned(magic.id);
    const affordable = permanent.killPoints >= magic.cost;
    const label = owned ? magic.name : `${magic.name} ${magic.cost}`;
    const button = drawToggleButton(buttonX, y + 32, 202, 46, label, owned);
    ctx.fillStyle = owned ? magic.color : affordable ? "#cbd5df" : "#7b8a99";
    ctx.font = "600 12px system-ui, sans-serif";
    ctx.fillText(truncateText(magic.description, 25), buttonX + 101, y + 96);
    magicPurchaseButtons.push({ ...button, magicId: magic.id, canBuy: !owned && affordable });
  }
}

function drawEquipment() {
  drawArenaPreview();
  ctx.fillStyle = "rgba(12, 14, 18, 0.76)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 52px system-ui, sans-serif";
  ctx.fillText("Equipment", WIDTH / 2, 148);
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillStyle = "#cbd5df";
  ctx.fillText("Equip one weapon and up to two magic skills.", WIDTH / 2, 184);

  equipmentWeaponButtons = [];
  equipmentMagicButtons = [];
  const weaponX = WIDTH / 2 - 540;
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 24px system-ui, sans-serif";
  ctx.fillText("Weapons", WIDTH / 2, 232);
  for (let i = 0; i < WEAPON_DEFINITIONS.length; i += 1) {
    const weapon = WEAPON_DEFINITIONS[i];
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = weaponX + col * 216;
    const y = 266 + row * 96;
    const owned = isWeaponOwned(weapon.id);
    const equipped = permanent.weaponId === weapon.id;
    drawEquipmentCard(x, y, 202, 76, weapon.name, owned ? weapon.description : `Locked: ${weapon.cost} kill points`, equipped, owned, "#75d7ff");
    equipmentWeaponButtons.push({ x, y, width: 202, height: 76, weaponId: weapon.id, owned });
  }

  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 24px system-ui, sans-serif";
  ctx.fillText("Magic", WIDTH / 2, 512);
  const magicX = WIDTH / 2 - 432;
  for (let i = 0; i < MAGIC_DEFINITIONS.length; i += 1) {
    const magic = MAGIC_DEFINITIONS[i];
    const x = magicX + i * 216;
    const y = 546;
    const owned = isMagicOwned(magic.id);
    const equipped = (permanent.equippedMagicIds || []).includes(magic.id);
    drawEquipmentCard(x, y, 202, 92, magic.name, owned ? magic.description : `Locked: ${magic.cost} kill points`, equipped, owned, magic.color);
    equipmentMagicButtons.push({ x, y, width: 202, height: 92, magicId: magic.id, owned });
  }

  const magicNames = getEquippedMagicDefinitions().map((magic) => magic.name).join(" / ") || "None";
  ctx.fillStyle = "#cbd5df";
  ctx.font = "700 17px system-ui, sans-serif";
  ctx.fillText(`Equipped Magic: ${magicNames}`, WIDTH / 2, 684);
  equipmentBackButton = drawButton(WIDTH / 2 - 105, 736, 210, 54, "Back");
  ctx.textAlign = "left";
}

function drawEquipmentCard(x, y, width, height, title, detail, equipped, owned, accent) {
  const hovered = pointInRect(mouse.x, mouse.y, x, y, width, height);
  ctx.fillStyle = equipped ? "rgba(117, 215, 255, 0.24)" : hovered && owned ? "#2f3b48" : "#202832";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = equipped ? accent : owned ? "#5d6e7e" : "#4b5561";
  ctx.lineWidth = equipped ? 3 : 2;
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = owned ? "#f4f6f8" : "#8d98a5";
  ctx.font = "800 16px system-ui, sans-serif";
  ctx.fillText(title, x + width / 2, y + 25);
  ctx.fillStyle = equipped ? accent : owned ? "#cbd5df" : "#7b8a99";
  ctx.font = "600 11px system-ui, sans-serif";
  ctx.fillText(equipped ? "Equipped" : truncateText(detail, 26), x + width / 2, y + height - 18);
}

function drawLevelUp() {
  ctx.fillStyle = "rgba(12, 14, 18, 0.82)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 50px system-ui, sans-serif";
  ctx.fillText("Level Up", WIDTH / 2, 210);
  ctx.fillStyle = "#cbd5df";
  ctx.font = "600 19px system-ui, sans-serif";
  ctx.fillText("Choose one upgrade", WIDTH / 2, 248);

  levelUpButtons = [];
  const startX = WIDTH / 2 - 480;
  for (let i = 0; i < levelUpChoices.length; i += 1) {
    const x = startX + i * 320;
    const y = 322;
    ctx.fillStyle = "#202832";
    ctx.fillRect(x, y, 280, 220);
    ctx.strokeStyle = "#8de85c";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 280, 220);
    ctx.fillStyle = "#f4f6f8";
    ctx.font = "800 22px system-ui, sans-serif";
    ctx.fillText(levelUpChoices[i].title, x + 140, y + 62);
    ctx.fillStyle = "#cbd5df";
    ctx.font = "600 16px system-ui, sans-serif";
    ctx.fillText(levelUpChoices[i].detail, x + 140, y + 112);
    const button = drawButton(x + 65, y + 150, 150, 46, "Choose");
    levelUpButtons.push({ ...button, upgrade: levelUpChoices[i] });
  }
  ctx.textAlign = "left";
}

function drawGameOver() {
  ctx.fillStyle = "rgba(12, 14, 18, 0.78)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f6f8";
  ctx.font = "800 58px system-ui, sans-serif";
  ctx.fillText("Game Over", WIDTH / 2, 328);
  ctx.fillStyle = "#cbd5df";
  ctx.font = "600 22px system-ui, sans-serif";
  if (currentGameMode === GAME_MODE.ARENA) {
    ctx.fillText(`Final wave reached: ${finalWave}`, WIDTH / 2, 374);
    ctx.fillText(`Kill points banked: ${permanent.killPoints}`, WIDTH / 2, 408);
  } else {
    ctx.fillText(`${getGameModeDefinition(currentGameMode).label} run failed`, WIDTH / 2, 374);
    ctx.fillText(`Run points lost: ${modeState.lostRunPoints || 0}`, WIDTH / 2, 408);
  }

  gameOverButton = drawButton(WIDTH / 2 - 130, 460, 260, 54, "Return to Menu");
  ctx.textAlign = "left";
}

function drawButton(x, y, width, height, label, disabled = false) {
  const hovered = !disabled && pointInRect(mouse.x, mouse.y, x, y, width, height);
  ctx.fillStyle = disabled ? "#6c747d" : hovered ? "#f4f6f8" : "#dbe4ec";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#111418";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = disabled ? "#2f3742" : "#111418";
  ctx.font = "800 18px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + width / 2, y + height / 2);
  ctx.textBaseline = "alphabetic";
  return { x, y, width, height };
}

function drawToggleButton(x, y, width, height, label, selected) {
  const hovered = pointInRect(mouse.x, mouse.y, x, y, width, height);
  ctx.fillStyle = selected ? "#75d7ff" : hovered ? "#f4f6f8" : "#2f3b48";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = selected ? "#f4f6f8" : "#7b8a99";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = selected || hovered ? "#101216" : "#f4f6f8";
  ctx.font = "800 16px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + width / 2, y + height / 2);
  ctx.textBaseline = "alphabetic";
  return { x, y, width, height };
}

function drawSpriteFrame(image, frameWidth, frameHeight, frameIndex, centerX, centerY, scale) {
  const drawWidth = frameWidth * scale;
  const drawHeight = frameHeight * scale;
  if (!isImageReady(image)) {
    ctx.fillStyle = "#4cc9f0";
    ctx.fillRect(centerX - 16, centerY - 24, 32, 42);
    return;
  }

  ctx.drawImage(
    image,
    frameIndex * frameWidth,
    0,
    frameWidth,
    frameHeight,
    Math.round(centerX - drawWidth / 2),
    Math.round(centerY - drawHeight / 2),
    drawWidth,
    drawHeight
  );
}

function drawSpriteSheetGridFrame(image, frameWidth, frameHeight, columns, frameIndex, centerX, centerY, scale) {
  const drawWidth = frameWidth * scale;
  const drawHeight = frameHeight * scale;
  if (!isImageReady(image)) return;

  const col = frameIndex % columns;
  const row = Math.floor(frameIndex / columns);
  ctx.drawImage(
    image,
    col * frameWidth,
    row * frameHeight,
    frameWidth,
    frameHeight,
    Math.round(centerX - drawWidth / 2),
    Math.round(centerY - drawHeight / 2),
    drawWidth,
    drawHeight
  );
}

function drawCenteredImage(image, centerX, centerY, width, height) {
  if (!isImageReady(image)) return;
  ctx.drawImage(image, 0, 0, image.naturalWidth || image.width, image.naturalHeight || image.height, Math.round(centerX - width / 2), Math.round(centerY - height / 2), width, height);
}

function isImageReady(image) {
  return image && image.complete && (image.naturalWidth || image.width);
}

function loadDirectionalImages(folder) {
  return {
    down: loadImage(`${folder}/down.png`),
    left: loadImage(`${folder}/left.png`),
    right: loadImage(`${folder}/right.png`),
    up: loadImage(`${folder}/up.png`)
  };
}

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function getLoopFrame(frameCount, secondsPerFrame) {
  return Math.floor(performance.now() / (secondsPerFrame * 1000)) % frameCount;
}

function getDirectionFromAngle(angle) {
  const normalized = Math.atan2(Math.sin(angle), Math.cos(angle));
  if (normalized >= -Math.PI / 4 && normalized < Math.PI / 4) return "right";
  if (normalized >= Math.PI / 4 && normalized < (Math.PI * 3) / 4) return "down";
  if (normalized <= -Math.PI / 4 && normalized > (-Math.PI * 3) / 4) return "up";
  return "left";
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(40, 150);
    const maxLife = randomRange(0.18, 0.38);
    effects.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: randomRange(3, 7),
      life: maxLife,
      maxLife,
      color
    });
  }
}

function gameLoop(time) {
  const dt = Math.min((time - lastTime) / 1000 || 0, 0.033);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

function handleCanvasClick() {
  if (modeState.choicePending && currentGameMode === GAME_MODE.MAZE) {
    if (sessionMode === SESSION.CLIENT) return;
    for (const button of modeChoiceButtons) {
      if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        mouse.down = false;
        button.action();
        return;
      }
    }
    return;
  }

  if (gameState === STATE.OPTIONS) {
    for (const button of optionsButtons) {
      if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        mouse.down = false;
        button.action();
        return;
      }
    }
    return;
  }

  if (coopLevelMenuOpen) {
    for (const button of levelUpButtons) {
      if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        mouse.down = false;
        chooseCoopLevelUpgrade(button.upgrade);
        return;
      }
    }
    return;
  }

  if (gameState === STATE.MENU) {
    if (settingsButton && pointInRect(mouse.x, mouse.y, settingsButton.x, settingsButton.y, settingsButton.width, settingsButton.height)) {
      openOptionsMenu();
      return;
    }

    for (const button of modeButtons) {
      if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        selectedGameMode = button.modeId;
        mouse.down = false;
        return;
      }
    }

    if (menuButton && pointInRect(mouse.x, mouse.y, menuButton.x, menuButton.y, menuButton.width, menuButton.height)) {
      mouse.down = false;
      startGame();
      return;
    }

    if (hostButton && pointInRect(mouse.x, mouse.y, hostButton.x, hostButton.y, hostButton.width, hostButton.height)) {
      mouse.down = false;
      openHostLobby();
      return;
    }

    if (joinButton && pointInRect(mouse.x, mouse.y, joinButton.x, joinButton.y, joinButton.width, joinButton.height)) {
      mouse.down = false;
      openJoinLobby();
      return;
    }

    if (shopButton && pointInRect(mouse.x, mouse.y, shopButton.x, shopButton.y, shopButton.width, shopButton.height)) {
      mouse.down = false;
      gameState = STATE.SHOP;
      return;
    }

    if (equipmentButton && pointInRect(mouse.x, mouse.y, equipmentButton.x, equipmentButton.y, equipmentButton.width, equipmentButton.height)) {
      mouse.down = false;
      gameState = STATE.EQUIPMENT;
      return;
    }
  }

  if (gameState === STATE.HOST_LOBBY) {
    if (hostLobbyButtons.rate45 && pointInRect(mouse.x, mouse.y, hostLobbyButtons.rate45.x, hostLobbyButtons.rate45.y, hostLobbyButtons.rate45.width, hostLobbyButtons.rate45.height)) {
      hostSnapshotRate = 45;
      mouse.down = false;
      return;
    }
    if (hostLobbyButtons.rate60 && pointInRect(mouse.x, mouse.y, hostLobbyButtons.rate60.x, hostLobbyButtons.rate60.y, hostLobbyButtons.rate60.width, hostLobbyButtons.rate60.height)) {
      hostSnapshotRate = 60;
      mouse.down = false;
      return;
    }
    if (hostLobbyButtons.start && pointInRect(mouse.x, mouse.y, hostLobbyButtons.start.x, hostLobbyButtons.start.y, hostLobbyButtons.start.width, hostLobbyButtons.start.height)) {
      mouse.down = false;
      startHostCoopGame();
      return;
    }
    if (hostLobbyButtons.back && pointInRect(mouse.x, mouse.y, hostLobbyButtons.back.x, hostLobbyButtons.back.y, hostLobbyButtons.back.width, hostLobbyButtons.back.height)) {
      mouse.down = false;
      leaveLobbyToMenu();
      return;
    }
  }

  if (gameState === STATE.JOIN_LOBBY) {
    for (const button of joinLobbyButtons.discovered || []) {
      if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        mouse.down = false;
        connectToDiscoveredLobby(button.lobby);
        return;
      }
    }
    if (joinLobbyButtons.edit && pointInRect(mouse.x, mouse.y, joinLobbyButtons.edit.x, joinLobbyButtons.edit.y, joinLobbyButtons.edit.width, joinLobbyButtons.edit.height)) {
      mouse.down = false;
      promptForJoinAddress();
      return;
    }
    if (joinLobbyButtons.connect && pointInRect(mouse.x, mouse.y, joinLobbyButtons.connect.x, joinLobbyButtons.connect.y, joinLobbyButtons.connect.width, joinLobbyButtons.connect.height)) {
      mouse.down = false;
      connectToHostLobby();
      return;
    }
    if (joinLobbyButtons.back && pointInRect(mouse.x, mouse.y, joinLobbyButtons.back.x, joinLobbyButtons.back.y, joinLobbyButtons.back.width, joinLobbyButtons.back.height)) {
      mouse.down = false;
      leaveLobbyToMenu();
      return;
    }
  }

  if (gameState === STATE.SHOP) {
    for (const button of shopPurchaseButtons) {
      if (button.canBuy && pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        buySwordTier(button.tier);
        mouse.down = false;
        return;
      }
    }

    for (const button of weaponSelectButtons) {
      if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        if (button.canBuy) buyWeapon(button.weaponId);
        mouse.down = false;
        return;
      }
    }

    for (const button of magicPurchaseButtons) {
      if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        if (button.canBuy) buyMagic(button.magicId);
        mouse.down = false;
        return;
      }
    }

    if (shopBackButton && pointInRect(mouse.x, mouse.y, shopBackButton.x, shopBackButton.y, shopBackButton.width, shopBackButton.height)) {
      mouse.down = false;
      gameState = STATE.MENU;
      return;
    }
  }

  if (gameState === STATE.EQUIPMENT) {
    for (const button of equipmentWeaponButtons) {
      if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        if (button.owned) selectWeapon(button.weaponId);
        mouse.down = false;
        return;
      }
    }
    for (const button of equipmentMagicButtons) {
      if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        if (button.owned) toggleEquipMagic(button.magicId);
        mouse.down = false;
        return;
      }
    }
    if (equipmentBackButton && pointInRect(mouse.x, mouse.y, equipmentBackButton.x, equipmentBackButton.y, equipmentBackButton.width, equipmentBackButton.height)) {
      mouse.down = false;
      gameState = STATE.MENU;
      return;
    }
  }

  if (gameState === STATE.LEVEL_UP) {
    for (const button of levelUpButtons) {
      if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        mouse.down = false;
        applyLevelUp(button.upgrade);
        return;
      }
    }
  }

  if (gameState === STATE.GAME_OVER && gameOverButton && pointInRect(mouse.x, mouse.y, gameOverButton.x, gameOverButton.y, gameOverButton.width, gameOverButton.height)) {
    mouse.down = false;
    returnToMenu();
    return;
  }

  if (gameState === STATE.PLAYING) {
    if (sessionMode !== SESSION.SINGLE && levelUpButton && getLocalPendingLevelUps() > 0 && pointInRect(mouse.x, mouse.y, levelUpButton.x, levelUpButton.y, levelUpButton.width, levelUpButton.height)) {
      openCoopLevelMenu();
      return;
    }
    if (settingsButton && pointInRect(mouse.x, mouse.y, settingsButton.x, settingsButton.y, settingsButton.width, settingsButton.height)) {
      openOptionsMenu();
      return;
    }
    for (const button of magicButtons) {
      if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
        useMagicSlot(button.slot);
        mouse.down = false;
        return;
      }
    }
    if (sessionMode !== SESSION.CLIENT) {
      tryAttack();
    }
  }
}

function handlePointerDown(event) {
  if (!isTouchPointer(event)) return;
  touchInputSeen = true;
  event.preventDefault();
  updateMousePosition(event);

  if (coopLevelMenuOpen) {
    handleCanvasClick();
    return;
  }

  if (gameState !== STATE.PLAYING) {
    handleCanvasClick();
    return;
  }

  if (sessionMode !== SESSION.SINGLE && levelUpButton && getLocalPendingLevelUps() > 0 && pointInRect(mouse.x, mouse.y, levelUpButton.x, levelUpButton.y, levelUpButton.width, levelUpButton.height)) {
    openCoopLevelMenu();
    return;
  }

  if (settingsButton && pointInRect(mouse.x, mouse.y, settingsButton.x, settingsButton.y, settingsButton.width, settingsButton.height)) {
    openOptionsMenu();
    return;
  }

  for (const button of magicButtons) {
    if (pointInRect(mouse.x, mouse.y, button.x, button.y, button.width, button.height)) {
      useMagicSlot(button.slot);
      return;
    }
  }

  const side = mouse.x < WIDTH / 2 ? "left" : "right";
  const joystick = side === "left" ? mobileInput.move : mobileInput.aim;
  if (joystick.pointerId !== null) return;

  try {
    canvas.setPointerCapture(event.pointerId);
  } catch (error) {
    // Pointer capture is a nicety, not a hard dependency.
  }

  startJoystick(joystick, event.pointerId, mouse.x, mouse.y);
}

function handlePointerMove(event) {
  if (!isTouchPointer(event)) return;
  if (event.pointerId !== mobileInput.move.pointerId && event.pointerId !== mobileInput.aim.pointerId) return;

  event.preventDefault();
  const point = getCanvasPoint(event);
  if (event.pointerId === mobileInput.move.pointerId) {
    updateJoystick(mobileInput.move, point.x, point.y);
  } else if (event.pointerId === mobileInput.aim.pointerId) {
    updateJoystick(mobileInput.aim, point.x, point.y);
    mobileInput.attackActive = mobileInput.aim.active;
  }
}

function handlePointerEnd(event) {
  if (!isTouchPointer(event)) return;
  event.preventDefault();

  if (event.pointerId === mobileInput.move.pointerId) {
    resetJoystick(mobileInput.move);
  }
  if (event.pointerId === mobileInput.aim.pointerId) {
    resetJoystick(mobileInput.aim);
    mobileInput.attackActive = false;
  }
}

function handleLostPointerCapture(event) {
  if (event.pointerId === mobileInput.move.pointerId) {
    resetJoystick(mobileInput.move);
  }
  if (event.pointerId === mobileInput.aim.pointerId) {
    resetJoystick(mobileInput.aim);
    mobileInput.attackActive = false;
  }
}

function isTouchPointer(event) {
  return event.pointerType === "touch" || event.pointerType === "pen";
}

function startJoystick(joystick, pointerId, x, y) {
  joystick.pointerId = pointerId;
  joystick.originX = x;
  joystick.originY = y;
  joystick.thumbX = x;
  joystick.thumbY = y;
  joystick.vectorX = 0;
  joystick.vectorY = 0;
  joystick.active = false;
}

function updateJoystick(joystick, x, y) {
  const dx = x - joystick.originX;
  const dy = y - joystick.originY;
  const distanceFromOrigin = Math.hypot(dx, dy);
  const maxRadius = getJoystickMaxRadius();
  const deadZone = getJoystickDeadZone();
  const clampedDistance = Math.min(distanceFromOrigin, maxRadius);
  const angle = Math.atan2(dy, dx);

  joystick.thumbX = joystick.originX + Math.cos(angle) * clampedDistance;
  joystick.thumbY = joystick.originY + Math.sin(angle) * clampedDistance;

  if (distanceFromOrigin < deadZone) {
    joystick.vectorX = 0;
    joystick.vectorY = 0;
    joystick.active = false;
    return;
  }

  const strength = (clampedDistance - deadZone) / (maxRadius - deadZone);
  joystick.vectorX = Math.cos(angle) * strength;
  joystick.vectorY = Math.sin(angle) * strength;
  joystick.active = true;
}

function getJoystickMaxRadius() {
  return MOBILE_JOYSTICK_MAX_RADIUS / Math.max(RENDER_SCALE, 0.01);
}

function getJoystickDeadZone() {
  return MOBILE_JOYSTICK_DEAD_ZONE / Math.max(RENDER_SCALE, 0.01);
}

function getJoystickThumbRadius() {
  return 24 / Math.max(RENDER_SCALE, 0.01);
}

function resetJoystick(joystick) {
  joystick.pointerId = null;
  joystick.originX = 0;
  joystick.originY = 0;
  joystick.thumbX = 0;
  joystick.thumbY = 0;
  joystick.vectorX = 0;
  joystick.vectorY = 0;
  joystick.active = false;
}

function resetMobileControls() {
  resetJoystick(mobileInput.move);
  resetJoystick(mobileInput.aim);
  mobileInput.attackActive = false;
}

function createNeutralInput() {
  return {
    moveX: 0,
    moveY: 0,
    moveActive: false,
    aimX: 0,
    aimY: 0,
    aimActive: false,
    attackActive: false
  };
}

function getLocalPlayerInput() {
  const input = createNeutralInput();
  if (coopLevelMenuOpen) return input;
  if (keys.has("w") || keys.has("arrowup")) input.moveY -= 1;
  if (keys.has("s") || keys.has("arrowdown")) input.moveY += 1;
  if (keys.has("a") || keys.has("arrowleft")) input.moveX -= 1;
  if (keys.has("d") || keys.has("arrowright")) input.moveX += 1;
  input.moveX += mobileInput.move.vectorX;
  input.moveY += mobileInput.move.vectorY;

  const moveLength = Math.hypot(input.moveX, input.moveY);
  if (moveLength > 1) {
    input.moveX /= moveLength;
    input.moveY /= moveLength;
  }
  input.moveActive = Math.hypot(input.moveX, input.moveY) > 0.01;

  if (mobileInput.aim.active) {
    input.aimX = mobileInput.aim.vectorX;
    input.aimY = mobileInput.aim.vectorY;
    input.aimActive = true;
  } else if (!touchInputSeen && player) {
    const mouseWorld = screenToWorld(mouse.x, mouse.y);
    const aimX = mouseWorld.x - player.x;
    const aimY = mouseWorld.y - player.y;
    const aimLength = Math.hypot(aimX, aimY);
    if (aimLength > 0.01) {
      input.aimX = aimX / aimLength;
      input.aimY = aimY / aimLength;
      input.aimActive = true;
    }
  }

  input.attackActive = mouse.down || mobileInput.attackActive;
  return input;
}

function getLocalPendingLevelUps() {
  if (sessionMode === SESSION.SINGLE || !player) return 0;
  return Math.max(player.pendingLevelUps || 0, player.activeLevelOffer ? 1 : 0);
}

function getLocalLevelOffer() {
  if (sessionMode === SESSION.SINGLE || !player) return null;
  return player.activeLevelOffer || null;
}

function openCoopLevelMenu() {
  const offer = getLocalLevelOffer();
  if (!offer) return;

  resetMobileControls();
  mouse.down = false;
  coopLevelMenuOpen = true;
  activeCoopLevelOfferId = offer.id;
  levelUpChoices = getUpgradeChoicesFromOffer(offer);
}

function closeCoopLevelMenu() {
  coopLevelMenuOpen = false;
  activeCoopLevelOfferId = null;
  levelUpChoices = [];
  resetMobileControls();
  mouse.down = false;
}

function refreshCoopLevelMenu() {
  if (!coopLevelMenuOpen) return;
  const offer = getLocalLevelOffer();
  if (!offer) {
    closeCoopLevelMenu();
    return;
  }
  activeCoopLevelOfferId = offer.id;
  levelUpChoices = getUpgradeChoicesFromOffer(offer);
}

function getUpgradeChoicesFromOffer(offer) {
  return (offer.choices || []).map((choice) => {
    const upgrade = UPGRADE_POOL.find((candidate) => candidate.id === choice.id);
    return {
      id: choice.id,
      title: choice.title || upgrade?.title || choice.id,
      detail: choice.detail || upgrade?.detail || "",
      apply: upgrade?.apply || (() => {})
    };
  });
}

function chooseCoopLevelUpgrade(upgrade) {
  if (!upgrade || !activeCoopLevelOfferId || !player) return;
  const offerId = activeCoopLevelOfferId;
  const upgradeId = upgrade.id;
  resetMobileControls();
  mouse.down = false;

  if (sessionMode === SESSION.HOST) {
    applyHostLevelChoice(localPlayerId, offerId, upgradeId);
    const nextOffer = getLocalLevelOffer();
    if (nextOffer) {
      activeCoopLevelOfferId = nextOffer.id;
      levelUpChoices = getUpgradeChoicesFromOffer(nextOffer);
    } else {
      closeCoopLevelMenu();
    }
    return;
  }

  if (sessionMode === SESSION.CLIENT) {
    sendNetworkMessage({
      type: "levelUpChoice",
      offerId,
      upgradeId
    });
    player.activeLevelOffer = null;
    player.pendingLevelUps = Math.max(0, (player.pendingLevelUps || 0) - 1);
    closeCoopLevelMenu();
  }
}

function openOptionsMenu() {
  resetMobileControls();
  mouse.down = false;
  previousGameState = gameState;
  gameState = STATE.OPTIONS;
}

function closeOptionsMenu() {
  resetMobileControls();
  mouse.down = false;
  if (previousGameState === STATE.PLAYING && player && player.health > 0) {
    updateCamera();
    gameState = STATE.PLAYING;
  } else {
    gameState = STATE.MENU;
  }
}

function setZoom(id) {
  settings.zoom = getZoomOption(id).id;
  saveZoomSetting();
  if (player) {
    updateCamera();
  }
}

function loadSavedZoom() {
  try {
    const stored = localStorage.getItem("bladeBoxArena.cameraZoom");
    return getZoomOption(stored).id;
  } catch (error) {
    return ZOOM_OPTIONS[0].id;
  }
}

function saveZoomSetting() {
  try {
    localStorage.setItem("bladeBoxArena.cameraZoom", settings.zoom);
  } catch (error) {
    // Local storage is optional; gameplay should continue without it.
  }
}

function getNativeLocalNetworkPlugin() {
  const capacitor = window.Capacitor;
  if (!capacitor) return null;
  if (capacitor.Plugins?.LocalNetwork) return capacitor.Plugins.LocalNetwork;
  if (typeof capacitor.registerPlugin === "function") return capacitor.registerPlugin("LocalNetwork");
  return null;
}

function loadPermanentProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem("bladeBoxArena.permanent") || "{}");
    const ownedWeaponIds = [...new Set([DEFAULT_WEAPON_ID, ...(Array.isArray(parsed.ownedWeaponIds) ? parsed.ownedWeaponIds : [])]
      .filter((weaponId) => getWeaponById(weaponId).id === weaponId))];
    const ownedMagicIds = [...new Set((Array.isArray(parsed.ownedMagicIds) ? parsed.ownedMagicIds : [])
      .filter((magicId) => Boolean(getMagicById(magicId))))];
    const selectedWeapon = ownedWeaponIds.includes(parsed.weaponId) ? parsed.weaponId : DEFAULT_WEAPON_ID;
    return {
      killPoints: Math.max(0, Number(parsed.killPoints) || 0),
      swordTier: clamp(Math.round(Number(parsed.swordTier) || 0), 0, SWORD_TIERS.length - 1),
      weaponId: getWeaponById(selectedWeapon).id,
      ownedWeaponIds,
      ownedMagicIds,
      equippedMagicIds: sanitizeEquippedMagicIds(parsed.equippedMagicIds, ownedMagicIds)
    };
  } catch (error) {
    return { killPoints: 0, swordTier: 0, weaponId: DEFAULT_WEAPON_ID, ownedWeaponIds: [DEFAULT_WEAPON_ID], ownedMagicIds: [], equippedMagicIds: [] };
  }
}

function savePermanentProgress() {
  try {
    permanent.ownedWeaponIds = getOwnedWeaponIds();
    permanent.ownedMagicIds = getOwnedMagicIds();
    if (!isWeaponOwned(permanent.weaponId)) {
      permanent.weaponId = DEFAULT_WEAPON_ID;
    }
    permanent.equippedMagicIds = sanitizeEquippedMagicIds(permanent.equippedMagicIds, permanent.ownedMagicIds);
    localStorage.setItem("bladeBoxArena.permanent", JSON.stringify(permanent));
  } catch (error) {
    // Local storage is optional; gameplay should continue without it.
  }
}

function loadLastHostAddress() {
  try {
    return localStorage.getItem("bladeBoxArena.lastHostIp") || "";
  } catch (error) {
    return "";
  }
}

function saveLastHostAddress() {
  try {
    localStorage.setItem("bladeBoxArena.lastHostIp", joinHostAddress);
  } catch (error) {
    // Optional convenience only.
  }
}

function handleLobbyDiscovered(event) {
  if (sessionMode !== SESSION.CLIENT || gameState !== STATE.JOIN_LOBBY) return;
  const ip = event.ip || event.advertisedIp;
  const port = Number(event.port) || NETWORK_PORT;
  if (!ip) return;

  const key = `${ip}:${port}`;
  const existing = discoveredLobbies.find((lobby) => lobby.key === key);
  const lobby = {
    key,
    ip,
    port,
    name: event.name || "Blade Box Lobby",
    version: event.version || 1,
    lastSeen: Date.now()
  };
  if (existing) {
    Object.assign(existing, lobby);
  } else {
    discoveredLobbies.push(lobby);
  }
  discoveredLobbies.sort((a, b) => b.lastSeen - a.lastSeen);
  networkStatus = `Found ${getVisibleDiscoveredLobbies().length} local lobby${getVisibleDiscoveredLobbies().length === 1 ? "" : "ies"}`;
}

function getVisibleDiscoveredLobbies() {
  const now = Date.now();
  discoveredLobbies = discoveredLobbies.filter((lobby) => now - lobby.lastSeen < 6000);
  return discoveredLobbies;
}

function connectToDiscoveredLobby(lobby) {
  if (!lobby) return;
  joinHostAddress = lobby.ip;
  joinPort = lobby.port || NETWORK_PORT;
  saveLastHostAddress();
  networkStatus = `Connecting to ${joinHostAddress}:${joinPort}...`;
  connectToHostLobby();
}

function startDiscoveryBroadcast() {
  if (!NativeLocalNetwork || typeof NativeLocalNetwork.startDiscoveryBroadcast !== "function") return;
  NativeLocalNetwork.startDiscoveryBroadcast({
    hostPort: NETWORK_PORT,
    discoveryPort: DISCOVERY_PORT,
    name: "Blade Box Lobby"
  }).catch((error) => {
    if (sessionMode === SESSION.HOST) {
      networkStatus = `Discovery broadcast failed: ${getErrorMessage(error)}`;
    }
  });
}

function stopDiscoveryBroadcast() {
  if (!NativeLocalNetwork || typeof NativeLocalNetwork.stopDiscoveryBroadcast !== "function") return;
  NativeLocalNetwork.stopDiscoveryBroadcast().catch(() => {});
}

function startDiscoverySearch() {
  if (!NativeLocalNetwork || typeof NativeLocalNetwork.startDiscovery !== "function") return;
  NativeLocalNetwork.startDiscovery({ discoveryPort: DISCOVERY_PORT }).catch((error) => {
    if (sessionMode === SESSION.CLIENT) {
      networkStatus = `Discovery failed: ${getErrorMessage(error)}`;
    }
  });
}

function stopDiscoverySearch() {
  if (!NativeLocalNetwork || typeof NativeLocalNetwork.stopDiscovery !== "function") return;
  NativeLocalNetwork.stopDiscovery().catch(() => {});
}

function updateNetworkDebug(dt) {
  networkDebug.timer += dt;
  if (networkDebug.timer < 1) return;

  networkDebug.snapshotInRate = networkDebug.snapshotsIn;
  networkDebug.snapshotOutRate = networkDebug.snapshotsOut;
  networkDebug.lastBytesIn = networkDebug.bytesIn;
  networkDebug.lastBytesOut = networkDebug.bytesOut;
  networkDebug.snapshotsIn = 0;
  networkDebug.snapshotsOut = 0;
  networkDebug.bytesIn = 0;
  networkDebug.bytesOut = 0;
  networkDebug.timer = 0;
}

function setupNetworkListeners() {
  if (!NativeLocalNetwork || typeof NativeLocalNetwork.addListener !== "function") return;
  NativeLocalNetwork.addListener("message", handleNativeNetworkMessage);
  NativeLocalNetwork.addListener("clientConnected", (event) => {
    if (sessionMode !== SESSION.HOST) return;
    pendingClientIds.add(event.clientId);
    networkStatus = `Client ${event.clientId} connected. Waiting for hello...`;
  });
  NativeLocalNetwork.addListener("clientDisconnected", (event) => {
    if (sessionMode !== SESSION.HOST) return;
    removeLobbyClient(event.clientId);
    networkStatus = `Client ${event.clientId} disconnected`;
    broadcastLobbyState();
  });
  NativeLocalNetwork.addListener("status", (event) => {
    if (event.status === "clientDisconnected" && sessionMode === SESSION.CLIENT) {
      networkStatus = "Disconnected from host";
      if (gameState === STATE.PLAYING) {
        returnToMenu();
      }
    } else if (event.status === "discoveryListenError" && sessionMode === SESSION.CLIENT) {
      networkStatus = `Discovery error: ${event.message || "unknown"}`;
    } else if (event.status === "discoveryBroadcastError" && sessionMode === SESSION.HOST) {
      networkStatus = `Discovery broadcast error: ${event.message || "unknown"}`;
    }
  });
  NativeLocalNetwork.addListener("lobbyDiscovered", handleLobbyDiscovered);
}

async function openHostLobby() {
  stopDiscoverySearch();
  resetMobileControls();
  mouse.down = false;
  sessionMode = SESSION.HOST;
  localPlayerId = "p1";
  player = undefined;
  players = [];
  lobbyPlayers = [{ id: "p1", name: "Player 1", clientId: null, swordTier: permanent.swordTier, weaponId: permanent.weaponId, magicIds: permanent.equippedMagicIds }];
  hostSnapshotRate = DEFAULT_HOST_SNAPSHOT_RATE;
  pendingClientIds.clear();
  remoteInputs.clear();
  clientIdToPlayerId.clear();
  gameState = STATE.HOST_LOBBY;

  if (!NativeLocalNetwork) {
    networkStatus = "Android APK required to host local WiFi co-op";
    hostIpAddress = "Unavailable";
    return;
  }

  networkStatus = "Starting host...";
  try {
    const result = await NativeLocalNetwork.startHost({ port: NETWORK_PORT });
    hostIpAddress = result.ip || "Unavailable";
    networkStatus = "Hosting. Share this IP with clients.";
    startDiscoveryBroadcast();
  } catch (error) {
    networkStatus = `Host failed: ${getErrorMessage(error)}`;
  }
}

function openJoinLobby() {
  stopDiscoveryBroadcast();
  resetMobileControls();
  mouse.down = false;
  sessionMode = SESSION.CLIENT;
  localPlayerId = "p2";
  player = undefined;
  players = [];
  lobbyPlayers = [];
  discoveredLobbies = [];
  gameState = STATE.JOIN_LOBBY;
  networkStatus = NativeLocalNetwork ? "Searching local WiFi. Manual IP still works." : "Android APK required to join local WiFi co-op";
  startDiscoverySearch();
}

function promptForJoinAddress() {
  const current = joinHostAddress ? `${joinHostAddress}:${joinPort}` : "";
  const entered = window.prompt("Enter host IP or IP:port", current);
  if (entered === null) return;
  const trimmed = entered.trim();
  if (!trimmed) {
    joinHostAddress = "";
    networkStatus = "Host IP cleared";
    return;
  }

  const parts = trimmed.split(":");
  joinHostAddress = parts[0].trim();
  if (parts[1]) {
    const parsedPort = Number(parts[1]);
    joinPort = Number.isFinite(parsedPort) ? clamp(Math.round(parsedPort), 1024, 65535) : NETWORK_PORT;
  }
  saveLastHostAddress();
  networkStatus = `Ready to connect to ${joinHostAddress}:${joinPort}`;
}

async function connectToHostLobby() {
  if (!NativeLocalNetwork) {
    networkStatus = "Android APK required to join local WiFi co-op";
    return;
  }
  if (!joinHostAddress) {
    networkStatus = "Enter a host IP first";
    return;
  }

  networkStatus = `Connecting to ${joinHostAddress}:${joinPort}...`;
  try {
    await NativeLocalNetwork.connect({ host: joinHostAddress, port: joinPort });
    stopDiscoverySearch();
    networkStatus = "Connected. Waiting for lobby...";
    sendNetworkMessage({
      type: "hello",
      name: "Player",
      swordTier: permanent.swordTier,
      weaponId: permanent.weaponId,
      magicIds: permanent.equippedMagicIds
    });
  } catch (error) {
    networkStatus = `Connect failed: ${getErrorMessage(error)}`;
  }
}

function leaveLobbyToMenu() {
  stopDiscoverySearch();
  stopDiscoveryBroadcast();
  stopNetworkSession(false);
  resetMobileControls();
  mouse.down = false;
  sessionMode = SESSION.SINGLE;
  gameState = STATE.MENU;
  lobbyPlayers = [];
  pendingClientIds.clear();
  remoteInputs.clear();
  clientIdToPlayerId.clear();
  networkStatus = NativeLocalNetwork ? "Ready" : "Android APK required for local WiFi co-op";
}

function startHostCoopGame() {
  if (sessionMode !== SESSION.HOST) return;
  if (!NativeLocalNetwork) {
    networkStatus = "Android APK required to host local WiFi co-op";
    return;
  }
  resetMobileControls();
  stopDiscoveryBroadcast();
  mouse.down = false;
  prepareModeRun(selectedGameMode);
  players = lobbyPlayers.map((lobbyPlayer, index) => createPlayer(lobbyPlayer.id, lobbyPlayer.name, index, lobbyPlayer.swordTier, lobbyPlayer.weaponId, lobbyPlayer.magicIds));
  player = players.find((activePlayer) => activePlayer.id === localPlayerId) || players[0];
  resetRunState();
  gameState = STATE.PLAYING;
  startModeCombat();
  broadcastNetworkMessage({ type: "start", localPlayerId: null, snapshot: createSnapshot() });
  sendSnapshotToClients();
}

function startClientCoopGame(snapshot) {
  sessionMode = SESSION.CLIENT;
  gameState = STATE.PLAYING;
  levelUpChoices = [];
  resetMobileControls();
  applySnapshot(snapshot);
  networkStatus = "In co-op match";
}

function handleNativeNetworkMessage(event) {
  networkDebug.bytesIn += String(event.message || "").length;
  let message;
  try {
    message = JSON.parse(event.message);
  } catch (error) {
    return;
  }

  if (sessionMode === SESSION.HOST) {
    handleHostNetworkMessage(event.clientId, message);
  } else if (sessionMode === SESSION.CLIENT) {
    handleClientNetworkMessage(message);
  }
}

function handleHostNetworkMessage(clientId, message) {
  if (message.type === "hello") {
    acceptClientHello(clientId, message);
    return;
  }

  const playerId = clientIdToPlayerId.get(clientId);
  if (!playerId) return;

  if (message.type === "input") {
    remoteInputs.set(playerId, sanitizeRemoteInput(message.input));
    return;
  }

  if (message.type === "levelUpChoice") {
    applyHostLevelChoice(playerId, message.offerId, message.upgradeId);
    return;
  }

  if (message.type === "magicUse") {
    const caster = players.find((candidate) => candidate.id === playerId);
    applyMagicUse(caster, message.request || {});
    return;
  }

  if (message.type === "leave") {
    removeLobbyClient(clientId);
    broadcastLobbyState();
  }
}

function acceptClientHello(clientId, message) {
  if (lobbyPlayers.length >= MAX_COOP_PLAYERS || gameState === STATE.PLAYING) {
    sendNetworkMessage({ type: "reject", reason: "Lobby is full or match already started." }, clientId);
    disconnectClient(clientId);
    return;
  }

  const usedIds = new Set(lobbyPlayers.map((lobbyPlayer) => lobbyPlayer.id));
  let playerNumber = 2;
  while (usedIds.has(`p${playerNumber}`) && playerNumber <= MAX_COOP_PLAYERS) {
    playerNumber += 1;
  }
  const playerId = `p${playerNumber}`;
  const clientName = message.name && String(message.name).trim() ? String(message.name).trim() : `Player ${playerNumber}`;
  const swordTier = clamp(Math.round(Number(message.swordTier) || 0), 0, SWORD_TIERS.length - 1);
  const weaponId = getWeaponById(message.weaponId).id;
  const magicIds = sanitizeEquippedMagicIds(message.magicIds);
  const lobbyPlayer = { id: playerId, name: clientName, clientId, swordTier, weaponId, magicIds };
  lobbyPlayers.push(lobbyPlayer);
  pendingClientIds.delete(clientId);
  clientIdToPlayerId.set(clientId, playerId);
  remoteInputs.set(playerId, createNeutralInput());
  sendNetworkMessage({ type: "welcome", playerId, lobbyPlayers }, clientId);
  broadcastLobbyState();
  networkStatus = `${clientName} joined`;
}

function removeLobbyClient(clientId) {
  const playerId = clientIdToPlayerId.get(clientId);
  clientIdToPlayerId.delete(clientId);
  pendingClientIds.delete(clientId);
  if (playerId) {
    remoteInputs.delete(playerId);
    lobbyPlayers = lobbyPlayers.filter((lobbyPlayer) => lobbyPlayer.clientId !== clientId);
    const activePlayer = players.find((candidate) => candidate.id === playerId);
    if (activePlayer) {
      activePlayer.connected = false;
      activePlayer.health = 0;
    }
  }
}

function handleClientNetworkMessage(message) {
  if (message.type === "welcome") {
    localPlayerId = message.playerId;
    lobbyPlayers = message.lobbyPlayers || [];
    networkStatus = `Joined as ${localPlayerId.toUpperCase()}. Waiting for host.`;
    return;
  }

  if (message.type === "lobby") {
    lobbyPlayers = message.players || [];
    return;
  }

  if (message.type === "start") {
    startClientCoopGame(message.snapshot);
    return;
  }

  if (message.type === "snapshot") {
    networkDebug.snapshotsIn += 1;
    applySnapshot(message.snapshot);
    return;
  }

  if (message.type === "levelUpOffer") {
    applyClientLevelOffer(message);
    return;
  }

  if (message.type === "rewardDelta") {
    applyRewardDelta(message);
    return;
  }

  if (message.type === "itemUnlock") {
    applyItemUnlock(message.kind, message.itemId, message.eventId);
    return;
  }

  if (message.type === "reject") {
    networkStatus = message.reason || "Join rejected";
    return;
  }

  if (message.type === "hostEnded") {
    networkStatus = "Host ended the session";
    stopNetworkSession(false);
    returnToMenu();
  }
}

function applyClientLevelOffer(message) {
  if (message.playerId !== localPlayerId) return;
  const localPlayer = players.find((candidate) => candidate.id === localPlayerId);
  if (!localPlayer) return;
  localPlayer.pendingLevelUps = Math.max(message.pending || 1, localPlayer.pendingLevelUps || 0);
  localPlayer.activeLevelOffer = message.offer || localPlayer.activeLevelOffer;
  player = localPlayer;
  refreshCoopLevelMenu();
}

function broadcastLobbyState() {
  if (sessionMode !== SESSION.HOST) return;
  broadcastNetworkMessage({ type: "lobby", players: lobbyPlayers });
}

function updateClientSession(dt) {
  animateRemoteSnapshot(dt);
  predictLocalClientPlayer(dt);
  smoothClientEntities(dt);
  updateCamera();
  inputSendTimer -= dt;
  if (inputSendTimer <= 0) {
    sendNetworkMessage({
      type: "input",
      seq: inputSequence += 1,
      input: getLocalPlayerInput()
    });
    inputSendTimer = INPUT_SEND_INTERVAL;
  }
}

function updateHostSnapshots(dt) {
  snapshotTimer -= dt;
  if (snapshotTimer <= 0) {
    sendSnapshotToClients();
    snapshotTimer = getHostSnapshotInterval();
  }
}

function getHostSnapshotInterval() {
  const rate = SNAPSHOT_RATE_OPTIONS.includes(hostSnapshotRate) ? hostSnapshotRate : DEFAULT_HOST_SNAPSHOT_RATE;
  return 1 / rate;
}

function sendSnapshotToClients() {
  broadcastNetworkMessage({ type: "snapshot", snapshot: createSnapshot() });
}

function createSnapshot() {
  return {
    state: gameState,
    modeState: serializeModeState(),
    wave,
    finalWave,
    nextWaveTimer,
    players: players.map(serializePlayer),
    enemies: enemies.map(serializeEnemy),
    xpOrbs: xpOrbs.map(serializeXpOrb),
    pickups: pickups.map(serializePickup),
    chests: chests.map(serializeChest)
  };
}

function applySnapshot(snapshot) {
  if (!snapshot) return;
  applyModeSnapshot(snapshot.modeState);
  wave = snapshot.wave || wave;
  finalWave = snapshot.finalWave || finalWave;
  nextWaveTimer = snapshot.nextWaveTimer || 0;
  players = mergePlayersFromSnapshot(snapshot.players || []);
  enemies = mergeEnemiesFromSnapshot(snapshot.enemies || []);
  xpOrbs = (snapshot.xpOrbs || []).map((orb) => ({ ...orb }));
  pickups = (snapshot.pickups || []).map((pickup) => ({ ...pickup }));
  chests = (snapshot.chests || []).map((chest) => ({ ...chest }));
  player = players.find((activePlayer) => activePlayer.id === localPlayerId) || players[0];
  if (snapshot.state === STATE.GAME_OVER) {
    gameState = STATE.GAME_OVER;
  }
  refreshCoopLevelMenu();
  updateCamera();
}

function animateRemoteSnapshot(dt) {
  for (const activePlayer of players) {
    activePlayer.attackTimer = Math.max(0, (activePlayer.attackTimer || 0) - dt);
    activePlayer.invulnerableTimer = Math.max(0, (activePlayer.invulnerableTimer || 0) - dt);
    activePlayer.dualSwordTimer = Math.max(0, (activePlayer.dualSwordTimer || 0) - dt);
  }
  for (const enemy of enemies) {
    enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt);
    enemy.magicFlash = Math.max(0, (enemy.magicFlash || 0) - dt);
    enemy.burnTimer = Math.max(0, (enemy.burnTimer || 0) - dt);
    enemy.slowTimer = Math.max(0, (enemy.slowTimer || 0) - dt);
    enemy.stunTimer = Math.max(0, (enemy.stunTimer || 0) - dt);
    enemy.rootTimer = Math.max(0, (enemy.rootTimer || 0) - dt);
  }
  for (const orb of xpOrbs) {
    orb.bob = (orb.bob || 0) + dt * 7;
  }
  for (const chest of chests) {
    chest.hitFlash = Math.max(0, (chest.hitFlash || 0) - dt);
  }
}

function predictLocalClientPlayer(dt) {
  if (sessionMode !== SESSION.CLIENT || !player || player.health <= 0) return;

  const input = getLocalPlayerInput();
  const moveLength = Math.hypot(input.moveX, input.moveY);
  if (moveLength > 0) {
    moveActor(player, (input.moveX / moveLength) * player.speed * dt, (input.moveY / moveLength) * player.speed * dt);
  }
  player.moving = input.moveActive;
  updatePlayerAim(player, input);
  updateMagicCooldowns(player, dt);

  if (input.attackActive && player.attackCooldown <= 0) {
    const swordStats = getSwordStats(player);
    const weapon = getWeaponDefinition(player);
    const speedMultiplier = player.attackSpeedMultiplier * swordStats.speed;
    player.attackCooldown = weapon.cooldown / speedMultiplier;
    player.attackDuration = weapon.swingDuration / Math.sqrt(speedMultiplier);
    player.attackTimer = player.attackDuration;
  }
}

function smoothClientEntities(dt) {
  const alpha = 1 - Math.exp(-REMOTE_ENTITY_SMOOTHING * dt);
  for (const activePlayer of players) {
    if (activePlayer.id === localPlayerId) {
      correctPredictedLocalPlayer(activePlayer);
    } else {
      smoothEntityPosition(activePlayer, alpha);
    }
  }
  for (const enemy of enemies) {
    smoothEntityPosition(enemy, alpha);
  }
}

function correctPredictedLocalPlayer(activePlayer) {
  if (!Number.isFinite(activePlayer.targetX) || !Number.isFinite(activePlayer.targetY)) return;
  const error = distance(activePlayer.x, activePlayer.y, activePlayer.targetX, activePlayer.targetY);
  if (error > LOCAL_HARD_CORRECTION_THRESHOLD) {
    activePlayer.x = activePlayer.targetX;
    activePlayer.y = activePlayer.targetY;
  } else if (error > LOCAL_CORRECTION_THRESHOLD) {
    activePlayer.x = lerp(activePlayer.x, activePlayer.targetX, 0.18);
    activePlayer.y = lerp(activePlayer.y, activePlayer.targetY, 0.18);
  }
}

function smoothEntityPosition(entity, alpha) {
  if (!Number.isFinite(entity.targetX) || !Number.isFinite(entity.targetY)) return;
  const error = distance(entity.x, entity.y, entity.targetX, entity.targetY);
  if (error > LOCAL_HARD_CORRECTION_THRESHOLD) {
    entity.x = entity.targetX;
    entity.y = entity.targetY;
    return;
  }
  entity.x = lerp(entity.x, entity.targetX, alpha);
  entity.y = lerp(entity.y, entity.targetY, alpha);
}

function mergePlayersFromSnapshot(snapshotPlayers) {
  const existingById = new Map(players.map((activePlayer) => [activePlayer.id, activePlayer]));
  return snapshotPlayers.map((snapshotPlayer) => {
    const existing = existingById.get(snapshotPlayer.id);
    return mergeSnapshotEntity(existing, snapshotPlayer, snapshotPlayer.id === localPlayerId);
  });
}

function mergeEnemiesFromSnapshot(snapshotEnemies) {
  const existingById = new Map(enemies.map((enemy) => [enemy.id, enemy]));
  return snapshotEnemies.map((snapshotEnemy, index) => {
    const enemySnapshot = {
      ...snapshotEnemy,
      id: snapshotEnemy.id || `snapshot-enemy-${index}`
    };
    const existing = existingById.get(enemySnapshot.id);
    return mergeSnapshotEntity(existing, enemySnapshot, false);
  });
}

function mergeSnapshotEntity(existing, snapshotEntity, isLocalPlayer) {
  const currentX = Number.isFinite(existing?.x) ? existing.x : snapshotEntity.x;
  const currentY = Number.isFinite(existing?.y) ? existing.y : snapshotEntity.y;
  const merged = {
    ...(existing || {}),
    ...snapshotEntity,
    targetX: snapshotEntity.x,
    targetY: snapshotEntity.y
  };
  merged.x = currentX;
  merged.y = currentY;

  const error = distance(currentX, currentY, snapshotEntity.x, snapshotEntity.y);
  if (!existing || error > LOCAL_HARD_CORRECTION_THRESHOLD) {
    merged.x = snapshotEntity.x;
    merged.y = snapshotEntity.y;
  } else if (isLocalPlayer && error > LOCAL_CORRECTION_THRESHOLD) {
    merged.x = lerp(currentX, snapshotEntity.x, 0.18);
    merged.y = lerp(currentY, snapshotEntity.y, 0.18);
  }
  return merged;
}

function serializePlayer(activePlayer) {
  return {
    id: activePlayer.id,
    name: activePlayer.name,
    x: roundNet(activePlayer.x),
    y: roundNet(activePlayer.y),
    size: activePlayer.size,
    speed: roundNet(activePlayer.speed),
    maxHealth: roundNet(activePlayer.maxHealth),
    health: roundNet(activePlayer.health),
    angle: roundNet(activePlayer.angle, 3),
    level: activePlayer.level,
    xp: activePlayer.xp,
    xpToNext: activePlayer.xpToNext,
    damageMultiplier: roundNet(activePlayer.damageMultiplier, 3),
    attackSpeedMultiplier: roundNet(activePlayer.attackSpeedMultiplier, 3),
    attackCooldown: roundNet(activePlayer.attackCooldown),
    attackTimer: roundNet(activePlayer.attackTimer),
    attackDuration: roundNet(activePlayer.attackDuration),
    invulnerableTimer: roundNet(activePlayer.invulnerableTimer),
    shieldActive: activePlayer.shieldActive,
    dualSwordTimer: roundNet(activePlayer.dualSwordTimer),
    moving: activePlayer.moving,
    connected: activePlayer.connected,
    color: activePlayer.color,
    swordTier: activePlayer.swordTier,
    weaponId: getWeaponDefinition(activePlayer).id,
    equippedMagicIds: sanitizeEquippedMagicIds(activePlayer.equippedMagicIds),
    magicCooldowns: Object.fromEntries((activePlayer.equippedMagicIds || []).map((magicId) => [magicId, roundNet(activePlayer.magicCooldowns?.[magicId] || 0)])),
    pendingLevelUps: activePlayer.pendingLevelUps || 0,
    activeLevelOffer: activePlayer.activeLevelOffer || null
  };
}

function serializeEnemy(enemy) {
  return {
    id: enemy.id,
    x: roundNet(enemy.x),
    y: roundNet(enemy.y),
    size: enemy.size,
    kind: enemy.kind,
    animOffset: roundNet(enemy.animOffset),
    speed: roundNet(enemy.speed),
    health: roundNet(enemy.health),
    maxHealth: roundNet(enemy.maxHealth),
    damage: enemy.damage,
    touchTimer: roundNet(enemy.touchTimer),
    hitFlash: roundNet(enemy.hitFlash),
    magicFlash: roundNet(enemy.magicFlash),
    magicColor: enemy.magicColor || "",
    burnTimer: roundNet(enemy.burnTimer),
    burnDamage: roundNet(enemy.burnDamage),
    slowTimer: roundNet(enemy.slowTimer),
    slowMultiplier: roundNet(enemy.slowMultiplier || 0.45, 2),
    stunTimer: roundNet(enemy.stunTimer),
    rootTimer: roundNet(enemy.rootTimer)
  };
}

function serializeXpOrb(orb) {
  return {
    x: roundNet(orb.x),
    y: roundNet(orb.y),
    value: orb.value,
    size: orb.size,
    bob: roundNet(orb.bob)
  };
}

function serializePickup(pickup) {
  return {
    type: pickup.type,
    x: roundNet(pickup.x),
    y: roundNet(pickup.y),
    size: pickup.size,
    life: roundNet(pickup.life)
  };
}

function serializeChest(chest) {
  return {
    id: chest.id,
    col: chest.col,
    row: chest.row,
    x: roundNet(chest.x),
    y: roundNet(chest.y),
    opened: Boolean(chest.opened),
    health: chest.health ?? 0,
    maxHealth: chest.maxHealth ?? 2,
    hitFlash: roundNet(chest.hitFlash),
    rewardXp: chest.rewardXp || CHEST_REWARD_XP,
    rewardClaimed: Boolean(chest.rewardClaimed),
    rewardType: chest.rewardType || "",
    rewardId: chest.rewardId || ""
  };
}

function sanitizeRemoteInput(input = {}) {
  const sanitized = createNeutralInput();
  sanitized.moveX = clamp(Number(input.moveX) || 0, -1, 1);
  sanitized.moveY = clamp(Number(input.moveY) || 0, -1, 1);
  sanitized.moveActive = Boolean(input.moveActive);
  sanitized.aimX = clamp(Number(input.aimX) || 0, -1, 1);
  sanitized.aimY = clamp(Number(input.aimY) || 0, -1, 1);
  sanitized.aimActive = Boolean(input.aimActive);
  sanitized.attackActive = Boolean(input.attackActive);
  return sanitized;
}

function awardModeKillPoint() {
  if (currentGameMode !== GAME_MODE.ARENA) {
    addRunPoints(getRunPointReward());
    return;
  }
  awardTeamKillPoint();
}

function awardTeamKillPoint() {
  permanent.killPoints += 1;
  savePermanentProgress();
  if (sessionMode === SESSION.HOST) {
    const eventId = `host-${Date.now()}-${rewardEventCounter += 1}`;
    broadcastNetworkMessage({ type: "rewardDelta", eventId, amount: 1 });
  }
}

function applyRewardDelta(message) {
  if (!message.eventId || appliedRewardEvents.has(message.eventId)) return;
  appliedRewardEvents.add(message.eventId);
  permanent.killPoints += Number(message.amount) || 0;
  savePermanentProgress();
}

function sendNetworkMessage(message, clientId) {
  if (!NativeLocalNetwork) return;
  const serialized = JSON.stringify(message);
  networkDebug.bytesOut += serialized.length;
  if (message.type === "snapshot") {
    networkDebug.snapshotsOut += 1;
  }
  NativeLocalNetwork.send({
    clientId,
    message: serialized
  }).catch((error) => {
    networkStatus = `Send failed: ${getErrorMessage(error)}`;
  });
}

function broadcastNetworkMessage(message) {
  sendNetworkMessage(message);
}

function disconnectClient(clientId) {
  if (!NativeLocalNetwork || typeof NativeLocalNetwork.disconnectClient !== "function") return;
  NativeLocalNetwork.disconnectClient({ clientId }).catch(() => {});
}

function stopNetworkSession(notifyClients) {
  if (!NativeLocalNetwork) return;
  if (sessionMode === SESSION.HOST) {
    stopDiscoveryBroadcast();
    if (notifyClients) {
      broadcastNetworkMessage({ type: "hostEnded" });
      window.setTimeout(() => {
        NativeLocalNetwork.stopHost().catch(() => {});
      }, 120);
      return;
    }
    NativeLocalNetwork.stopHost().catch(() => {});
  } else if (sessionMode === SESSION.CLIENT) {
    stopDiscoverySearch();
    sendNetworkMessage({ type: "leave" });
    NativeLocalNetwork.disconnect().catch(() => {});
  }
}

function getErrorMessage(error) {
  return error?.message || String(error || "Unknown error");
}

function buySwordTier(tier) {
  const upgrade = SWORD_TIERS[tier];
  if (permanent.swordTier >= tier) return;
  if (permanent.swordTier < tier - 1) return;
  if (permanent.killPoints < upgrade.cost) return;

  permanent.killPoints -= upgrade.cost;
  permanent.swordTier = tier;
  if (player) {
    player.swordTier = tier;
  }
  savePermanentProgress();
  burst(WIDTH / 2, 220, "#8de85c", 22);
}

function updateMousePosition(event) {
  const point = getCanvasPoint(event);
  mouse.x = point.x;
  mouse.y = point.y;
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = (event.clientX - rect.left) * scaleX;
  const canvasY = (event.clientY - rect.top) * scaleY;
  return {
    x: (canvasX - RENDER_OFFSET_X) / RENDER_SCALE,
    y: (canvasY - RENDER_OFFSET_Y) / RENDER_SCALE
  };
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if (gameState === STATE.PLAYING && !coopLevelMenuOpen && gameState !== STATE.OPTIONS) {
    if (key === "1" || key === "q") {
      event.preventDefault();
      useMagicSlot(0);
      return;
    }
    if (key === "2" || key === "e") {
      event.preventDefault();
      useMagicSlot(1);
      return;
    }
  }
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener("mousemove", updateMousePosition);
canvas.addEventListener("mousedown", (event) => {
  updateMousePosition(event);
  mouse.down = true;
  handleCanvasClick();
});
canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", handlePointerEnd);
canvas.addEventListener("pointercancel", handlePointerEnd);
canvas.addEventListener("lostpointercapture", handleLostPointerCapture);

window.addEventListener("mouseup", () => {
  mouse.down = false;
});
window.addEventListener("resize", () => {
  if (resizeCanvasToDisplaySize()) {
    resetMobileControls();
  }
});
window.addEventListener("orientationchange", () => {
  if (resizeCanvasToDisplaySize()) {
    resetMobileControls();
  }
});
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    if (resizeCanvasToDisplaySize()) {
      resetMobileControls();
    }
  });
}

canvas.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });

function pointInRect(px, py, x, y, width, height) {
  return px >= x && px <= x + width && py >= y && py <= y + height;
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundNet(value, decimals = 2) {
  const number = Number(value) || 0;
  const factor = 10 ** decimals;
  return Math.round(number * factor) / factor;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function shortestAngle(a, b) {
  return Math.atan2(Math.sin(b - a), Math.cos(b - a));
}

function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

setupNetworkListeners();
draw();
requestAnimationFrame(gameLoop);
