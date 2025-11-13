# Deploying frontend and backend to Windows IIS (SolidCP)

This document explains how to prepare and deploy the apps in this repository to a Windows IIS server managed by SolidCP.

Targets

- Frontend domain: https://swadika.utkranti.app
- Backend domain: https://api-swadika.utkranti.app

Summary of artifacts added

- `frontend/.env.production` — sets NEXT_PUBLIC_API_URL to the backend API URL used at runtime.
- `backend/.env.production` — sets PORT, NODE_ENV and ALLOWED_ORIGINS for production CORS.
- `frontend/web.config` — IIS rewrite rules to reverse-proxy to the Next.js server (localhost:3000).
- `backend/web.config` — IIS rewrite rules to reverse-proxy /api/\* to the backend Node process (localhost:5005).

High-level deployment approaches (pick one per site)

1. IIS + ARR reverse proxy to Node processes (recommended)

   - Run Node (Next.js `next start`) for frontend and backend Node process (`node dist/server.js`) on the server on distinct ports (frontend 3000, backend 5005).
   - Use the `web.config` files included here to make IIS reverse-proxy incoming https traffic to the local Node processes.
   - Use a process supervisor (recommended): PM2 (with Windows service helper) or NSSM to run each Node process as a Windows service so they auto-start on reboot.

2. iisnode (alternate, more complex)
   - Host Node inside IIS with iisnode. This requires more configuration and is not required when ARR+reverse-proxy is available.

Detailed steps (ARR reverse-proxy approach)

Prerequisites on the Windows server

- Node.js (LTS) installed and added to PATH.
- URL Rewrite module installed in IIS.
- Application Request Routing (ARR) installed and proxy enabled.
- SolidCP installed and set up (you will use SolidCP control panel to create sites if desired).
- Recommended: a process manager for Windows (PM2 + pm2-windows-service or NSSM).

1. Prepare server folders

- Create two IIS sites (or two host headers) in SolidCP/IIS:
  - Site root for frontend: point to the `frontend` build output folder. (We host through reverse-proxy; files like `public/` should be accessible.)
  - Site root for backend: point to the `backend` project folder (or a publish folder).

2. Build on the server (or build locally and upload)

Frontend (Node server)

- cd into `frontend`
- npm install --production
- npm run build
- Start the Next.js server: `npm run start` (by default uses PORT=3000). To run on port 3000 explicitly: `PORT=3000 npm run start`.

Backend

- cd into `backend`
- npm install --production
- npm run build
- Ensure `backend/.env.production` is present (it will set PORT=5005). Start the backend: `npm run start` (this runs `node dist/server.js`).

Note: We included `frontend/.env.production` and `backend/.env.production` in the repo. You can either keep these files or set equivalent environment variables via SolidCP (preferred) so secrets are not stored in the repo.

3. Configure IIS (ARR + URL Rewrite)

- Ensure Application Request Routing proxy is enabled. In IIS Manager -> Server Proxy Settings -> Enable proxy.
- Place the included `web.config` files into the site root for each IIS site (frontend and backend). The rewrite rules in the files will forward requests to the local Node processes.

4. Configure SSL / Hostnames

- Use IIS / SolidCP to bind the `swadika.utkranti.app` hostname to the frontend site and `api-swadika.utkranti.app` to the backend site. Attach the appropriate SSL certificate to each binding.

5. Run Node processes as services

Option A — PM2 (recommended):

- Install PM2 globally: `npm i -g pm2`
- Install pm2-windows-service (or use the PM2 Windows event startup): `npm i -g pm2-windows-service`
- Register service for frontend: `pm2 start npm --name frontend -- start --prefix "C:\path\to\frontend"` and then `pm2 save` and register pm2 as a Windows service.
- Register service for backend: `pm2 start npm --name backend -- start --prefix "C:\path\to\backend"`.

Option B — NSSM (simple):

- Download NSSM and create services that run the exact `node` commands you want (example: `node C:\path\to\frontend\node_modules\next\dist\bin\next start`).

6. Verify

- Visit https://swadika.utkranti.app and https://api-swadika.utkranti.app/api/health — both should return successful responses.
- For extra verification:
  - `curl -k https://swadika.utkranti.app` should return HTML from Next.js.
  - `curl -k https://api-swadika.utkranti.app/api/health` should return JSON with status ok.

Environment variables and secrets

- It's best to set env variables in the hosting panel (SolidCP) or in Windows system environment or via the process manager. If you prefer files, `*.env.production` exist in the repo but avoid checking secrets in the repo.

Notes and troubleshooting

- If CORS is rejecting requests, confirm `backend/.env.production` ALLOWED_ORIGINS contains the exact origin (scheme + host). The backend `app.ts` already supports comma-separated ALLOWED_ORIGINS.
- If you get 502/504 from IIS, confirm Node process is running and listening on the expected port (3000 for frontend, 5005 for backend) and the ARR proxy is enabled.
- If you prefer a completely static frontend (no server-side rendering), you can attempt `next export`, but this app uses dynamic and server rendering so running the Next server is the recommended approach.

Files added/modified in this repo (for your convenience)

- `/frontend/.env.production` — production frontend env
- `/frontend/web.config` — frontend IIS rewrite
- `/backend/.env.production` — production backend env
- `/backend/web.config` — backend IIS rewrite
- `/DEPLOY_IIS_SOLIDCP.md` — this file

If you'd like, I can:

- Add a small Windows-specific service script for PM2/NSSM to auto-register the apps.
- Create a build artifact zip per site ready to upload via SolidCP.

Finished: created env files and web.config rules, plus this guide.
