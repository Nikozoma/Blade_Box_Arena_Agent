# Blade Box Arena - Codex Context Pack

Purpose:
This folder gives Codex a clean, organized project memory after the long original development thread.
Use these files as project-level context/instructions.

Recommended placement:
- Put this folder inside the project root as something like:
  codex_context/
  docs/context/
  project_notes/

How Codex should use this:
1. Read 00_READ_ME_FIRST.txt first.
2. Read 01_CURRENT_PROJECT_STATE.txt before making changes.
3. For build/deploy work, read 04_BUILD_AND_DEPLOY_ANDROID_APK.txt.
4. For mobile/input work, read 05_MOBILE_CONTROLS_AND_UI.txt.
5. For co-op/networking work, read 06_LOCAL_WIFI_COOP_SYSTEM.txt.
6. For gameplay/content additions, read 07_GAMEPLAY_SYSTEMS.txt and 11_NEXT_FEATURE_ROADMAP.txt.
7. Before large edits, read 09_CODEX_WORKFLOW_RULES.txt and 12_TEST_CHECKLIST.txt.

Current philosophy:
- Preserve the working game foundation.
- Prefer small, targeted changes for polish/fixes.
- Use larger coherent prompts only for real system-level work.
- Always keep single-player, APK build, mobile controls, and co-op working unless explicitly changing that system.

Important:
This project is no longer just a prototype. It has a working Android APK, mobile controls, local WiFi co-op, auto lobby discovery, local persistence, dungeon maps, and a Git/GitHub checkpoint.
