"use strict";

module.exports = {
  apps: [
    {
      name: "bladeboxarena-relay",
      script: "server/relay-server.js",
      cwd: "/opt/bladeboxarena",
      env: {
        NODE_ENV: "production",
        RELAY_HOST: "0.0.0.0",
        RELAY_PORT: "8787"
      }
    },
    {
      name: "bladeboxarena-web",
      script: "server/pwa-web-server.js",
      cwd: "/opt/bladeboxarena",
      env: {
        NODE_ENV: "production",
        PWA_HOST: "0.0.0.0",
        PWA_PORT: "8000"
      }
    }
  ]
};
