# pos-root-dashboard

Panel de administración (Vite + React, SPA estática) para
[`backend-absolute-pos`](../backend-absolute-pos): dar de alta negocios, generar pairing
codes y administrar dispositivos (varias PCs y celulares por negocio) sin usar curls
manuales con la master key.

## Desarrollo local

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend corre en otro puerto
npm run dev             # http://localhost:5174
```

Requiere que `backend-absolute-pos` esté corriendo con `DASHBOARD_ORIGINS` incluyendo
`http://localhost:5174` (ver `.env` de ese repo) y que ya exista al menos un platform admin
— créalo una vez con la master key, ver la sección "Bootstrap de platform admin" en
`backend-absolute-pos/DEPLOY.md`.

## Autenticación

No hay registro propio: un platform admin se crea una sola vez desde la terminal
(`POST /admin/platform-admins`, gateado por `MASTER_API_KEY`) y desde ahí puede loguearse
aquí (`POST /platform-admin/login`) y agregar colegas desde `/admins`. El dashboard nunca
ve ni necesita la master key.

## Deploy

`admin-pos.bekadev.online`, servido por Nginx en el mismo VPS de `backend-absolute-pos`
(`backend-pos.bekadev.online`) — push a `main` dispara build + rsync del estático, sin
proceso que reiniciar. Ver `DEPLOY.md` para el aprovisionamiento (Nginx, TLS, secrets de
GitHub Actions).
