# Ubeenet Connect 2026 · Landing de registro

Landing de registro al evento de Ubeenet (jueves 26 de noviembre de 2026, 5:45 a 10:00 pm, Hotel Campos Polanco, CDMX).
Especificación completa: [`PROMPT_CLAUDE_CODE.md`](PROMPT_CLAUDE_CODE.md).

**Sitio publicado:** https://publifix.github.io/ubeenet/

| Capa | Herramienta |
|---|---|
| Sitio | Astro 5 (estático) + CSS propio con custom properties |
| Hosting | GitHub Pages, deploy con GitHub Actions en cada push a `main` |
| Datos | Supabase (Postgres + RLS + Auth + Edge Functions) |
| Correo | Resend, solo desde la Edge Function |
| Anti-spam | Honeypot + rate limit + Cloudflare Turnstile (opcional) |

## Correr local

```bash
npm install
npm run dev            # http://localhost:4321/ubeenet/
```

Sin `PUBLIC_REGISTER_ENDPOINT`, en desarrollo el formulario **simula** la respuesta del servidor:

- `http://localhost:4321/ubeenet/` → éxito
- `?mock=duplicate` → correo ya registrado
- `?mock=error` → error general
- `?mock=validation` → error de campo devuelto por el servidor

En producción sin endpoint la página se ve completa y, al enviar, muestra
"El registro abrirá en unos días…". Para ver el aviso técnico en el sitio publicado
agrega `?setup=1` a la URL o define `PUBLIC_SHOW_SETUP_NOTICE=true`.

Otros comandos:

```bash
npm run build          # build de producción en dist/
npm run preview        # sirve dist/
npm run og-image       # regenera public/og-image.jpg (requiere Playwright)
```

## Edge Function local

Requiere [Supabase CLI](https://supabase.com/docs/guides/cli) y Docker.

```bash
supabase start                                   # Postgres + Auth locales
supabase db reset                                # aplica supabase/migrations
cp supabase/.env.example supabase/.env.local     # y llena RESEND_API_KEY, etc.
npm run functions:serve                          # http://127.0.0.1:54321/functions/v1/register
```

Luego en `.env` del sitio: `PUBLIC_REGISTER_ENDPOINT=http://127.0.0.1:54321/functions/v1/register` y `npm run dev`.

> `event.ts`, `validation.ts` e `ics.ts` se copian a `supabase/functions/_shared/` con
> `npm run sync:shared` (corre solo en `dev`, `build`, `functions:serve` y `deploy:function`).
> Edita siempre los originales en `src/`.

## Deploy

- **Sitio:** push a `main` → `.github/workflows/deploy.yml` construye con las variables del repo y publica en Pages.
- **Función:**

  ```bash
  supabase login
  supabase link --project-ref <project-ref>
  supabase db push                                   # migraciones
  supabase secrets set --env-file supabase/.env.local
  npm run deploy:function                            # = supabase functions deploy register --no-verify-jwt
  ```

## Checklist de setup (pasos manuales)

> Guía paso a paso actualizada (dominio `ubeenetevents.com.mx`, Resend, Supabase vía GitHub Actions): [`docs/PUESTA-EN-MARCHA.md`](docs/PUESTA-EN-MARCHA.md).

- [x] 1. Repo `publifix/ubeenet` con GitHub Pages en source **GitHub Actions**.
- [ ] 2. Crear proyecto en Supabase → `supabase db push` (o pegar `supabase/migrations/0001_registrations.sql` en el SQL Editor) → `insert into public.admins (email) values ('…');` con los correos de administradores.
- [ ] 3. Supabase Auth: desactivar **Allow new users to sign up** y crear a mano los usuarios administradores (Authentication → Users → Add user, con contraseña).
- [ ] 4. Resend: crear cuenta → verificar dominio de envío (idealmente `ubeenet.com`, requiere DNS del cliente; mientras tanto un subdominio de Publifix) → crear API key.
- [ ] 5. Secrets de la función (`supabase/.env.example`): `RESEND_API_KEY`, `RESEND_FROM`, `ALLOWED_ORIGINS` (incluye `https://publifix.github.io` y `http://localhost:4321`), `SITE_PUBLIC_URL`, `NOTIFY_EMAIL=elia@blanconuclear.com.mx` (aviso interno de cada registro; si falta, la función usa ese correo por defecto) y opcional `TURNSTILE_SECRET`. Desplegar: `npm run deploy:function`.
- [ ] 6. (Opcional) Cloudflare Turnstile: crear sitio (dominio `publifix.github.io`) → `PUBLIC_TURNSTILE_SITE_KEY` en GitHub y `TURNSTILE_SECRET` en Supabase.
- [ ] 7. Variables del repo en GitHub (Settings → Secrets and variables → Actions → **Variables**): `PUBLIC_REGISTER_ENDPOINT` (`https://<ref>.supabase.co/functions/v1/register`), `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, opcional `PUBLIC_TURNSTILE_SITE_KEY`. Luego push a `main` o *Run workflow*.
- [ ] 8. Logos: hoy se usan `public/brand/ubeenet-white.svg` y `ubeenet-color.svg` (vectorizados desde `UBEE.ALTA.png`) y `ubeenet-white.png` para el correo. Reemplazar por los SVG oficiales si existen. Textos definitivos en `src/config/event.ts`.
- [ ] 9. (Futuro) Dominio propio: archivo `public/CNAME` + registro DNS + variables `SITE_URL=https://evento.ubeenet.com`, `BASE_PATH=/` y actualizar `ALLOWED_ORIGINS` y `SITE_PUBLIC_URL`.

## Estructura

```
.github/workflows/deploy.yml   build + GitHub Pages
public/brand, public/media     logos y foto de la sede
src/config/event.ts            ÚNICA fuente de nombre, fecha, sede y textos
src/components/                Hero, HeroShapes, RegisterForm, Curve, Themes, Venue, Partners (oculto), Faq, FinalCta, Footer, StickyCta
src/lib/                       validation.ts, ics.ts, paths.ts
src/pages/                     index, registros/ (panel), aviso-de-privacidad
supabase/migrations/           0001_registrations.sql
supabase/functions/register/   Edge Function + plantilla del correo
```
