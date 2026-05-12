# Blade Box Arena

A small top-down roguelite arena prototype built with plain HTML, CSS, JavaScript, and HTML5 Canvas.

## How to run

Open `index.html` directly in a modern browser, or serve the folder locally with Node:

```bash
node scripts/dev-server.js
```

Then visit `http://127.0.0.1:8000`.

## How to play

- Click **Single Player** on the main menu.
- Click **Host Co-op** to host a local WiFi lobby from an Android phone, or **Join Co-op** to manually join a host by IP address.
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
- Clear every enemy to advance to the next wave.
- Each wave adds more pressure through enemy count, speed, and health.
- Enemy kills award kill points that persist between runs during the current browser session.
- Spend kill points in the main-menu shop on permanent sword tiers.
- Use the shop's **Weapon Test Loadout** buttons to try **Balanced Sword**, **Short Sword**, or **Longsword**. Balanced Sword is the default and preserves the original sword feel.
- If your health reaches zero, the game shows a Game Over screen with your final wave.

## Local WiFi co-op V1

Co-op uses a host-authoritative local TCP session inside the Android APK. One phone hosts on port `7777`; clients on the same WiFi can use auto lobby discovery or manually enter the host phone's displayed IP address. No PC server, internet service, account, matchmaking, or NAT traversal is used.

- Main menu: choose **Host Co-op** on one Android phone.
- The host lobby displays the phone's local IP and port.
- Client phones choose **Join Co-op**, tap a discovered lobby, or tap **Edit IP**, enter the host IP or `IP:port`, then tap **Connect**.
- The host starts the match from the lobby.
- The host simulates players, enemies, attacks, pickups, XP, waves, and rewards.
- Clients send movement/aim/attack input and render host snapshots.
- Weapon selection is sent when a client joins; the host still owns authoritative hit and damage logic.
- Enemy kills award team-shared kill points. The host saves its reward locally, and clients save reward events locally when received.
- Auto lobby discovery is supported, with manual IP join kept as the fallback.

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
android/app/build/outputs/apk/debug/app-debug.apk
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
- The Android wrapper locks the app to fullscreen landscape mode and uses immersive system UI hiding.
- Add `?debugTouch=1` to the URL in a browser build to show the temporary mobile input debug overlay.
- Permanent shop upgrades and kill points are saved locally on each device.
- Pixel art rendering is kept sharp with image smoothing disabled.
