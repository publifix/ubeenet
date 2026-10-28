# Puesta en marcha: dominio y registros reales

Ninguna plataforma se conecta con GitHub. Todas las cuentas se crean con **correo y contraseña**
(nunca con el botón "Continuar con GitHub"). GitHub solo guarda las claves (Secrets) y ejecuta
los despliegues.

Tiempo estimado: 40–60 min de configuración + propagación de DNS (minutos a unas horas).

---

## Paso 1 · Dominio `ubeenetevents.com.mx` en GitHub Pages

### 1.1 GoDaddy → DNS
En GoDaddy: *Mis productos → ubeenetevents.com.mx → DNS → Administrar DNS*.

1. Borra los registros **A** de `@` que existan (suelen decir "Parked" o apuntar a GoDaddy).
2. Agrega 4 registros **A**, nombre `@`, TTL 1 hora:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
3. Edita (o crea) el **CNAME** con nombre `www` y valor `publifix.github.io`.
4. No borres los registros MX, NS ni SOA.

### 1.2 GitHub → Settings → Pages
En el repo `publifix/ubeenet`: *Settings → Pages*.

1. *Custom domain*: escribe `ubeenetevents.com.mx` → **Save**.
2. Espera a que diga "DNS check successful" (puede tardar).
3. Cuando aparezca disponible, activa **Enforce HTTPS** (el certificado puede tardar hasta 24 h; suele ser menos de 1 h).

### 1.3 GitHub → Settings → Secrets and variables → Actions → pestaña **Variables**
Crea estas *Repository variables*:

| Nombre | Valor |
|---|---|
| `SITE_URL` | `https://ubeenetevents.com.mx` |
| `BASE_PATH` | `/` |

Después: *Actions → Deploy to GitHub Pages → Run workflow*. El sitio queda en https://ubeenetevents.com.mx

---

## Paso 2 · Correo de confirmación (Resend)

1. Crea la cuenta en https://resend.com con correo y contraseña.
2. *Domains → Add domain* → `ubeenetevents.com.mx` (región: la que sugiera, p. ej. `us-east-1`).
3. Resend muestra 3–4 registros (MX y TXT para `send`, TXT `resend._domainkey`). Agrégalos en GoDaddy → DNS
   **copiando exactamente nombre y valor**. En GoDaddy el nombre va sin el dominio (p. ej. `send`, `resend._domainkey`).
4. **No agregues otro `_dmarc`**: GoDaddy ya creó uno (`v=DMARC1; p=quarantine; …`) y solo puede haber uno. Con el DKIM de Resend verificado, los correos lo pasan.
5. En Resend pulsa **Verify DNS Records** hasta que el dominio diga *Verified*.
6. *API Keys → Create API Key* (permiso *Sending access*, dominio `ubeenetevents.com.mx`). Copia la clave
   (empieza con `re_`); solo se muestra una vez.

---

## Paso 3 · Base de datos (Supabase)

### 3.1 Cuenta y proyecto
1. Crea la cuenta en https://supabase.com con correo y contraseña.
2. *New project*: nombre `ubeenet-eventos`, región **East US (North Virginia)** o la más cercana,
   contraseña de base fuerte (guárdala en un lugar seguro).
3. Espera a que el proyecto termine de crearse (1–2 min).

### 3.2 Crear las tablas (una sola vez)
1. Abre en GitHub el archivo `supabase/migrations/0001_registrations.sql` → botón **Copy raw file**.
2. En Supabase: *SQL Editor → New query* → pega → **Run**. Debe decir "Success. No rows returned".
3. En otra query, registra a las personas que podrán ver el panel (usa sus correos reales):
   ```sql
   insert into public.admins (email) values
     ('elia@blanconuclear.com.mx'),
     ('labs.publifix@gmail.com'),
     ('mirna@blanconuclear.com.mx');
   ```

### 3.3 Usuarios del panel `/registros`
1. *Authentication → Sign In / Providers*: desactiva **Allow new users to sign up**.
2. *Authentication → Users → Add user → Create new user*: los mismos correos del paso anterior,
   con contraseña, y marca **Auto Confirm User**.

### 3.4 Datos que vas a necesitar
- **Project ref**: *Project Settings → General → Project ID* (algo como `abcdefghijklmnop`).
- **Project URL**: `https://<project-ref>.supabase.co`
- **Clave pública**: *Project Settings → API Keys* → la *publishable* (`sb_publishable_…`) o la *anon* (legacy). Es pública; va en el sitio.
- **Access token**: menú de tu cuenta (arriba a la derecha) → *Account preferences → Access Tokens → Generate new token*,
  nombre `github-actions`. Copia el token (empieza con `sbp_`).

---

## Paso 4 · Claves en GitHub

*Settings → Secrets and variables → Actions*.

**Pestaña Secrets** (*New repository secret*) — privadas, nadie las puede volver a leer:

| Nombre | Valor |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | el token `sbp_…` |
| `SUPABASE_PROJECT_REF` | el Project ID |
| `RESEND_API_KEY` | la clave `re_…` |

**Pestaña Variables** (además de `SITE_URL` y `BASE_PATH` del paso 1):

| Nombre | Valor |
|---|---|
| `PUBLIC_REGISTER_ENDPOINT` | `https://<project-ref>.supabase.co/functions/v1/register` |
| `PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | la clave pública del paso 3.4 |

Opcionales (ya tienen valor por defecto): `RESEND_FROM` (`Ubeenet Eventos <eventos@ubeenetevents.com.mx>`),
`REPLY_TO` (`sales@ubeenet.com`), `NOTIFY_EMAIL` (por defecto `elia@blanconuclear.com.mx,labs.publifix@gmail.com,mirna@blanconuclear.com.mx`).

**Modo prueba:** crea la variable `NOTIFY_EMAIL` = `labs.publifix@gmail.com` y corre *Actions → Supabase (función de registro) → Run workflow*. Así los avisos solo llegan a labs. Al terminar las pruebas borra la variable y vuelve a correr el workflow: los avisos regresan a los tres correos.

---

## Paso 5 · Desplegar

1. *Actions → Supabase (función de registro) → Run workflow*. Debe terminar en verde y mostrar el endpoint.
2. *Actions → Deploy to GitHub Pages → Run workflow* (para que el sitio tome las variables nuevas).

---

## Paso 6 · Prueba de punta a punta

1. Abre https://ubeenetevents.com.mx y regístrate con un correo propio.
2. Verifica:
   - Mensaje "Tu lugar está reservado" en la página.
   - Correo de confirmación con el archivo `.ics` (revisa también spam).
   - Aviso del nuevo registro en `labs.publifix@gmail.com` (en modo prueba) o en los tres correos del equipo.
   - Registro visible en https://ubeenetevents.com.mx/registros/ (inicia sesión con un usuario del paso 3.3).
3. Registra el mismo correo otra vez: debe decir que ya tiene lugar reservado.
4. Borra los registros de prueba antes de difundir: *Supabase → Table Editor → registrations*.

## Recordatorio del día anterior

- Se envía solo el **miércoles 25 de noviembre, ~4:00 pm CDMX**, a todos los registrados (workflow *Recordatorio (día antes del evento)*).
- Para ver una muestra: *Actions → Recordatorio (día antes del evento) → Run workflow* con `mode = test`. Llega a `labs.publifix@gmail.com` con asunto "[Prueba] …".
- `mode = all` lo manda a todos; solo funciona en las 48 h previas al evento salvo que marques `force`. Repetirlo el mismo día no duplica correos.
- Al terminar, el equipo (`NOTIFY_EMAIL`) recibe un resumen "Recordatorio enviado · N de M".

## Si algo falla
- **El formulario dice "No pudimos guardar tu registro"**: revisa que el workflow de Supabase esté en verde y que `PUBLIC_REGISTER_ENDPOINT` sea exacto.
- **No llega el correo**: Resend → *Emails* muestra cada envío y su error; el dominio debe estar *Verified*.
- **El panel dice "Tu cuenta no tiene acceso"**: el correo del usuario debe estar en `public.admins` exactamente igual.
- **El dominio no abre**: espera la propagación de DNS y revisa *Settings → Pages* (debe decir "DNS check successful").
