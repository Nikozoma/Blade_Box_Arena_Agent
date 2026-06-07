# VAIO Deployment

Blade Box Arena can run on the Linux VAIO as two PM2 services:

- `bladeboxarena-relay` on port `8787`
- `bladeboxarena-web` on port `8000`

The relay handles browser/PWA room message forwarding. The web service serves the built PWA files from `dist/`.

## LAN URLs

- PWA website: `http://10.0.0.242:8000`
- Relay WebSocket: `ws://10.0.0.242:8787`
- Relay health: `http://10.0.0.242:8787/health`

## First-Time Setup

From the VAIO:

```bash
cd /opt/bladeboxarena
npm install
npm run build:web
pm2 startOrReload server/ecosystem.config.cjs --env production
pm2 save
```

Check status:

```bash
pm2 status
curl http://10.0.0.242:8787/health
curl http://10.0.0.242:8000
```

## Updating Later

Run the deployment helper from the VAIO:

```bash
cd /opt/bladeboxarena
bash scripts/deploy-vaio.sh
```

The script:

- refuses to continue if local tracked or untracked changes are present
- runs `git pull`
- runs `npm install`
- runs `npm run build:web`
- starts or reloads the PM2 ecosystem
- runs `pm2 save`

## PM2 Services

The PM2 config lives at:

```text
server/ecosystem.config.cjs
```

Process names:

- `bladeboxarena-relay`
- `bladeboxarena-web`

Useful commands:

```bash
pm2 logs bladeboxarena-relay
pm2 logs bladeboxarena-web
pm2 restart bladeboxarena-web
pm2 restart bladeboxarena-relay
pm2 save
```

## Future Public Deployment

This scaffold is LAN-only for now.

Still future work:

- public DNS or DDNS
- HTTPS for the PWA website
- WSS for the relay endpoint
- reverse proxy configuration
- firewall/port-forward decisions
- production hardening
- fully server-authoritative gameplay
