# Funciones de pos-root-dashboard

Diseño basado en el mockup importado de claude.ai/design ("Absolute POS Admin"). Todas las
rutas requieren sesión de platform admin (`POST /platform-admin/login`, correo o username +
password).

## Clientes (`/businesses`)

- **Lista**: tarjetas con nombre, id corto, slug, cantidad de usuarios y de licencias
  activas (`GET /admin/businesses`).
- **Nueva tienda**: crea el negocio y su primer usuario (`role: admin`) en un solo paso
  (`POST /admin/businesses` con `name`, `slug`, `ownerName`, `ownerEmail`, `ownerPhone`).
  El backend genera una contraseña aleatoria para ese usuario y la devuelve **una sola
  vez** en la respuesta (`owner.temporaryPassword`) — el modal la muestra para copiar y
  entregársela al dueño del negocio; no se puede recuperar después.

## Detalle de cliente (`/businesses/:id`)

### Pairing codes

- Genera un código de emparejamiento de un solo uso (`POST
  /admin/businesses/:id/devices/pairing-codes`), eligiendo el tipo de dispositivo
  (**Escritorio** o **Móvil**) — el tipo lo decide quien genera el código, no el
  dispositivo que empareja.
- El código se muestra como texto (para transcribir en el wizard de `absolute-pos-app`) y
  como QR (para escanear desde celular, formato `absolutepos://pair?slug=...&code=...`,
  pensado para un futuro cliente mobile).
- Expira en 30 minutos; historial completo de códigos generados (activo/usado/expirado)
  visible en la misma pestaña (`GET /admin/businesses/:id/devices/pairing-codes`).

### Usuarios

- Lista de usuarios con acceso a esa tienda: nombre, contacto (correo/teléfono), rol
  (Admin/Cajero), estado (Activo/Inactivo) — `GET /admin/businesses/:id/users`.
- **Agregar usuario**: mismo patrón que "Nueva tienda" — no se pide password en el modal,
  el backend genera una y se muestra una sola vez (`POST /admin/businesses/:id/users` sin
  `password` en el body).

### Licencias

- Un dispositivo emparejado (`Device`) se muestra como "licencia" — mismo dato, otro
  nombre en la UI. Columnas: dispositivo (ícono según tipo), fecha de activación, última
  conexión, estado (Activa/Revocada).
- **Revocar** (`POST /admin/businesses/:id/devices/:deviceId/revoke`): invalida el device
  api key de inmediato — el siguiente intento de sync de esa caja/celular falla con 401.
  No hay "reactivar"; si el negocio necesita ese dispositivo de nuevo, se genera un pairing
  code y se empareja como uno nuevo.
- No hay expiración real de licencia todavía (fuera de alcance de este rediseño) — el
  único estado además de Activa es Revocada.

## Métricas (`/metrics`)

Panorama global de toda la red (todos los clientes), desde `GET /admin/metrics`: tiendas
totales, licencias activas, usuarios totales, códigos de emparejamiento generados, y
desglose de licencias por tipo de dispositivo (escritorio vs. móvil).

## Configuración (`/settings`)

Editar el propio nombre/correo del platform admin logueado (`GET`/`PATCH
/platform-admins/me`). El logo es un placeholder visual — sin upload real todavía.

## Administradores (`/admins`)

No forma parte del mockup original, se mantiene como cuarta sección porque ya existía y es
necesaria para operar sin depender de `MASTER_API_KEY` día a día: listar y agregar más
platform admins (`GET`/`POST /platform-admins`, requiere sesión de platform admin — la
única vez que se usa la master key es para crear el primero, ver `DEPLOY.md` del backend).
