# Blade Box Arena

A small top-down roguelite arena prototype built with plain HTML, CSS, JavaScript, and HTML5 Canvas. One shared codebase supports both the existing Capacitor Android APK and the browser/PWA build.

## How to run

Open `index.html` directly in a modern browser, or serve the folder locally with Node:

```bash
node scripts/dev-server.js
```

Then visit `http://127.0.0.1:8000`.

## Delivery targets

Blade Box Arena supports two delivery targets from the same source files:

- **Android APK:** Capacitor packages the shared web game into a native Android app and keeps the existing native Android LAN multiplayer plugin.
- **Browser/PWA:** the same canvas game runs as a static web app with a web manifest, service worker, install metadata, and a browser-compatible online relay foundation.

The PWA target is additive. It does not replace the Android APK workflow.

## How to play

- Choose **Arena**, **Maze**, or **Dungeon** on the main menu, then click **Single Player**.
- In the Android APK, click **Host LAN** to host a local WiFi lobby from an Android phone, or **Join LAN** to manually join a host by IP address.
- In a browser/PWA, click **Online Multiplayer** to use the browser room foundation.
- Click **Host Army VS** to host a 2-player local WiFi versus match. The host is RED ARMY and the first client is BLUE ARMY.
- Move with `WASD` or the arrow keys.
- Aim by moving the mouse cursor.
- Left click to swing the sword in the direction you are aiming.
- On touch screens, use the left half of the screen as a floating movement joystick and the right half as a floating aim/attack joystick.
- The right joystick attacks continuously only while the thumb is outside the dead zone.
- During gameplay, use the top-right gear button to pause, change camera zoom, or leave the current run.
- Collect green XP orbs from defeated enemies.
- Choose one of three upgrades whenever you level up.
- Pick up blue shield drops to block one hit.
- Pick up orange dual-sword drops to attack forward and backward for about 30 seconds.
- Break closed dungeon chests with weapon hits. Most chests drop a fixed XP orb reward; some unlock a weapon or magic skill.
- Equip up to two magic skills and use the bottom-right magic buttons during a run. Desktop shortcuts are `1`/`Q` and `2`/`E`.
- In Arena, clear every enemy to advance to the next wave. Each wave adds more pressure through enemy count, speed, and health.
- Arena spawns a Blade Warden boss every 5 waves. Bosses have a top HUD health bar, slam attacks, light minion summoning, and guaranteed bonus rewards.
- In Maze, find the portal on each procedural floor. Every 5th floor lets you exit and bank run points or continue deeper for better rewards.
- Maze checkpoint floors 5, 10, 15, and beyond include a boss gate; defeat the boss before using the milestone portal.
- In Dungeon, find the relic, pick it up, then return to the marked exit to bank run points.
- Dungeon places a boss guard near the relic; defeat the boss before claiming the relic.
- Arena enemy kills award kill points immediately. Maze and Dungeon run points bank only on successful extraction; death discards only the current run's unbanked points.
- Arena boss rewards bank immediately and can unlock a locked weapon or magic skill. Maze and Dungeon boss rewards add run points first, so they bank only on successful extraction.
- In Army VS, RED ARMY and BLUE ARMY fight to defeat the opposing player. Each side gets dungeon monster reinforcements about every 20 seconds, with larger waves over time and tougher units every few waves.
- Spend kill points in the main-menu shop on permanent sword tiers, weapons, and magic skills.
- Use **Equipment** from the main menu to equip one owned weapon and up to two owned magic skills.
- Use **Records** from the main menu to view local high scores and recent run history.
- The game-over and extraction screens now show a run recap with mode progress, kills, boss kills, banked/lost run points, time survived, weapon, magic, damage dealt, and new-record callouts.
- Balanced Sword is the free default weapon and preserves the original sword feel. Additional weapons cover fast short-range blades and slower long-range heavy weapons.
- Magic skills are Fire burn, Water slow, Electric stun, and Ground root. Each has roughly a 10-second cooldown.
- If your health reaches zero, the game shows a Game Over screen with your final wave.

## Local WiFi co-op V1

Co-op uses a host-authoritative local TCP session inside the Android APK. One phone hosts on port `7777`; clients on the same WiFi can use auto lobby discovery or manually enter the host phone's displayed IP address. No PC server, internet service, account, matchmaking, or NAT traversal is used.

- Main menu: choose **Host Co-op** on one Android phone.
- The host lobby displays the phone's local IP and port.
- Client phones choose **Join Co-op**, tap a discovered lobby, or tap **Edit IP**, enter the host IP or `IP:port`, then tap **Connect**.
- The host starts the match from the lobby.
- The host simulates players, enemies, attacks, pickups, XP, waves, and rewards.
- The host also owns selected game mode, floor transitions, portals, relic pickup, extraction, chest rewards, magic hit/effect results, and item unlock events; clients only request actions and render synced snapshots.
- Clients send movement/aim/attack input and render host snapshots.
- Weapon and equipped magic selections are sent when a client joins; the host still owns authoritative hit, damage, magic effect, and reward logic.
- Army VS is host-authoritative and 2-player only in this first version. The host owns teams, army spawning, enemy targeting, PvP damage, player deaths, and the win result. Clients send inputs and render host snapshots.
- Enemy kills award team-shared kill points. The host saves its reward locally, and clients save reward events locally when received.
- Auto lobby discovery is supported, with manual IP join kept as the fallback.

## Browser/PWA support

The browser build is installable as a PWA on supported browsers.

- Build the web/PWA files with `npm run build:web`.
- Preview locally with `npm run preview:pwa`, then open `http://127.0.0.1:8000`.
- Deploy the static files from `dist/` to a normal HTTPS web host for real mobile installation testing.
- Android browsers should show install support when served over HTTPS with the manifest and service worker available.
- iPhone/iPad users can use Safari **Share > Add to Home Screen**. iOS does not guarantee forced fullscreen or orientation lock, so the game uses best-effort standalone metadata and responsive fullscreen canvas sizing.
- The manifest requests fullscreen/landscape behavior where supported.
- The HTML shell uses `viewport-fit=cover` plus safe-area insets for notches and rounded corners.
- The service worker caches the app shell, core JS/CSS, manifest, icons, and required gameplay art after a successful visit. Single-player menus/game shell can load offline after that first visit.
- Multiplayer WebSocket traffic, relay health calls, and room/API paths are not service-worker cached.

## Browser online multiplayer foundation

Browser/PWA multiplayer is prepared for a future always-on relay/server, but public internet multiplayer is not complete until the Sony VAIO server has a real reachable HTTPS/WSS endpoint.

- Future server URL configuration lives in `src/config.js`.
- Set `onlineServerUrl` to the future VAIO `wss://...` URL when it exists.
- The current default leaves `onlineServerUrl` empty and uses `localDevelopmentServerUrl: "ws://127.0.0.1:8787"` for local development.
- Browser/PWA clients use **Online Multiplayer**, not native LAN sockets.
- APK users still keep **Host LAN** and **Join LAN** through the native Android bridge.

Run the local development relay:

```bash
npm run multiplayer:relay
```

Smoke-check the relay:

```bash
npm run multiplayer:smoke
```

Relay endpoints:

- `GET /health` returns relay health.
- `GET /rooms` returns local room summaries.
- WebSocket clients can create rooms, join by short room code, and relay existing game messages.

Current browser multiplayer model:

- Browser host creates a room and temporarily owns gameplay simulation.
- Joining browser clients send input/magic/choice messages through the relay.
- Host sends snapshots/lobby/start/reward messages through the relay.
- The relay manages rooms, capacity, heartbeat, disconnect cleanup, and forwarding only.

Future work before production online multiplayer:

- Deploy the relay or a replacement backend on the VAIO with HTTPS/WSS.
- Configure DNS/public IP/firewall/ports.
- Move from relayed host-authoritative gameplay toward fully server-authoritative simulation.
- Add production hardening such as auth/rate limits if public matchmaking is introduced.

## Android debug APK

The Android app uses Capacitor to wrap the existing HTML/CSS/JS game in a native WebView. The browser version remains playable from `index.html`; Capacitor packages a copied static build from `dist/`.

Install dependencies:

```bash
npm install
```

Build and sync the web assets into the Android project:

```bash
npm run build:web
npx cap sync android
```

Build a debug APK:

```bash
npm run android:build
```

Expected APK output:

```text
android/app/build/outputs/apk/debug/BladeBoxArena-Agent-debug.apk
```

If Gradle cannot find the Android SDK, install it through Android Studio and set `ANDROID_HOME`, or copy `android/local.properties.example` to `android/local.properties` and set `sdk.dir` to your SDK path.

## Prototype notes

- Player art uses the Adventurer pixel-art pack with idle, run, and sword attack animations.
- Enemy art uses skeleton and vampire movement sprites from the enemy packs.
- The game now uses a larger-than-screen scrolling dungeon world with a camera that follows the player.
- The dungeon map is built from authored room templates, clean connecting corridors, blocked stone borders, and dark void outside playable areas.
- Dungeon visuals use Bitlands 1.0 floor/wall tiles and simple Bitlands props copied into `assets/bitlands/`.
- The dungeon walls block both the player and enemies, and enemy chase movement uses a simple flow-field path toward the player.
- The active shield uses the `Effect_ElectricShield` VFX sprite sheet.
- Movement and aiming are intentionally independent, so you can move one way while attacking another.
- Weapon behavior is data-driven in `src/game.js` through definitions with id, display name, damage multiplier, cooldown, range, arc size, and swing duration.
- Weapons and magic unlocks are saved locally with kill points. Equipment loadout is local and is sent to the co-op host on join.
- Run records are saved locally and defensively. Tracked records include total runs, total boss kills, best Arena wave/kills, best Maze floor, Maze extractions, Dungeon extractions, best run points, best time, and best damage dealt.
- Arena uses the authored survival dungeon. Maze uses deterministic procedural maze floors. Dungeon uses a separate relic retrieval layout with an entrance/exit marker.
- Chests are session-only dungeon entities spawned from safe walkable tiles. Opened chest state is synced in co-op snapshots and is not persisted between runs.
- Boss spawning, boss attacks, boss damage/death, boss rewards, chest rewards, magic effects, portals, relic pickup, and extraction remain host-authoritative in co-op.
- Screen shake is applied to the world camera for heavy hits, magic impacts, chest breaks, boss spawns, boss slams, and boss deaths. Hit stop is brief and local to single-player combat feel so it does not desync co-op simulation.
- The Android wrapper locks the app to fullscreen landscape mode and uses immersive system UI hiding.
- Browser/PWA runtime detection separates native APK LAN networking from browser online-room networking so Capacitor-only APIs do not run in normal browsers.
- Add `?debugTouch=1` to the URL in a browser build to show the temporary mobile input debug overlay.
- Permanent shop upgrades and kill points are saved locally on each device.
- Pixel art rendering is kept sharp with image smoothing disabled.
