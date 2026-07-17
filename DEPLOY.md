# Desplegar pos-root-dashboard

Sitio estático (build de Vite) servido por Nginx en el mismo VPS que
`backend-absolute-pos`, en `admin-pos.bekadev.online`. El backend vive en
`backend-pos.bekadev.online`.

## Aprovisionamiento único en el VPS (a mano, antes del primer deploy)

```bash
sudo mkdir -p /var/www/admin-pos.bekadev.online
sudo chown <SERVER_USER> /var/www/admin-pos.bekadev.online   # el usuario que usa GitHub Actions por rsync
```

Copia `deploy/nginx.conf.example` a `/etc/nginx/sites-available/admin-pos.bekadev.online`
en el VPS, habilítalo y pide el certificado:

```bash
sudo ln -s /etc/nginx/sites-available/admin-pos.bekadev.online /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d admin-pos.bekadev.online
```

`certbot` reescribe el server block agregando TLS — no hace falta tocarlo después.

**Prerrequisito:** `backend-pos.bekadev.online` ya debe responder por HTTPS (el dashboard
llama esa URL desde el navegador; HTTPS → HTTP plano se bloquea como mixed content) y su
`DASHBOARD_ORIGINS` debe incluir `https://admin-pos.bekadev.online` para que CORS lo deje
pasar (ver `.env`/variable `DASHBOARD_ORIGINS` en `backend-absolute-pos`).

## GitHub Actions — configurar una vez en Settings → Environments → Production

El deploy es push-to-`main` → build → `rsync dist/` al webroot de arriba (ver
`.github/workflows/deploy.yml`). No reinicia nada en el servidor — son archivos estáticos.

| Nombre | Tipo | Valor |
|---|---|---|
| `SERVER_HOST` | Secret | Mismo VPS que `backend-absolute-pos` — los Secrets no se comparten entre repos, hay que volver a cargarlo aquí aunque sea el mismo host |
| `SERVER_USER` | Secret | Usuario SSH con permiso de escritura en `/var/www/admin-pos.bekadev.online` |
| `SERVER_SSH_KEY` | Secret | Clave privada SSH de ese usuario |
| `VITE_API_URL` | Variable | `https://backend-pos.bekadev.online` — se hornea en el build, no es config de runtime |

## Deploy local manual (sin esperar al CD)

```bash
npm ci
VITE_API_URL=https://backend-pos.bekadev.online npm run build
rsync -az --delete dist/ <SERVER_USER>@<SERVER_HOST>:/var/www/admin-pos.bekadev.online/
```
