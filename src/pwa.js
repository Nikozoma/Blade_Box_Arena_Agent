"use strict";

(function registerBladeBoxArenaServiceWorker() {
  const isNativeWrapper = Boolean(window.Capacitor?.isNativePlatform?.() || window.Capacitor?.getPlatform?.() === "android");
  if (isNativeWrapper || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      // PWA installability is optional; browser gameplay should continue without it.
    });
  });
}());
