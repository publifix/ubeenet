# Landing de registro — Evento Ubeenet 2026

> Prompt para Claude Code. Construir el proyecto completo en una sola pasada.
> Leer TODO el documento antes de escribir código. Donde algo falte (logos, textos finales, keys), dejar un placeholder claramente marcado con `TODO:` y seguir adelante.

---

## 0. Contexto

**Cliente:** Ubeenet S.A. de C.V. — MultiCloud Networking, Security and App Management. Servicios: Multicloud, Networking, Security, Data, IoT, Managed Services. Partners: AWS, Azure, Oracle, VMware, Cisco, Aviatrix, Palo Alto Networks, Veeam, ExaGrid, Pure Storage. Sitio: https://www.ubeenet.com

**Evento (datos fijos):**
- Fecha: domingo 29 de noviembre de 2026
- Horario: 5:45 pm a 10:00 pm (zona `America/Mexico_City`, UTC−6, sin horario de verano)
- En UTC: 2026-11-29T23:45:00Z → 2026-11-30T04:00:00Z
- Sede: Hotel Campos Polanco — Campos Elíseos 361, Polanco III Secc., Miguel Hidalgo, 11540, Ciudad de México, CDMX
- Nombre del evento: AÚN NO DEFINIDO → usar el mock `Ubeenet Connect 2026` centralizado en un solo archivo de config.

**Objetivo único de la página:** que el invitado se registre (nombre completo, email, WhatsApp) en menos de 30 segundos y reciba confirmación por correo.

**Desarrollado por:** Blanco Nuclear (crédito discreto en el footer, sin logo).

---

## 1. Stack y arquitectura

| Capa | Herramienta |
|---|---|
| Sitio | **Astro** (output estático), CSS propio con custom properties (sin Tailwind) |
| Hosting | **GitHub Pages**, deploy con GitHub Actions al hacer push a `main` |
| Datos | **Supabase** (Postgres + RLS + Auth + Edge Functions) |
| Correo | **Resend**, llamado SOLO desde la Edge Function |
| Fondo animado | **HyperFrames** (HeyGen), renderizado a WebM/MP4 en loop |
| Anti-spam | Honeypot + **Cloudflare Turnstile** (opcional, activable por variable) |

Flujo de registro:

```
[Formulario en GitHub Pages]
        │  POST JSON (fetch)
        ▼
[Edge Function: register]  ── valida + Turnstile + honeypot
        │  insert con service_role
        ├──────────────► [tabla public.registrations]
        │  envía correo
        └──────────────► [Resend] → email de confirmación + .ics adjunto
```

Reglas de seguridad:
- La tabla `registrations` tiene RLS activado y **ninguna política para `anon`**. Nadie escribe ni lee directo desde el navegador; solo la Edge Function (service_role).
- `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `TURNSTILE_SECRET` viven solo como secrets de Supabase. **Nunca** en el repo ni en el frontend.
- En el frontend solo van `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` y `PUBLIC_TURNSTILE_SITE_KEY`.

---

## 2. Estructura del repo

```
/
├─ .github/workflows/deploy.yml
├─ hyperframes/                  # composición del fondo animado
│  └─ bg-loop/ (proyecto HyperFrames)
├─ public/
│  ├─ brand/                     # TODO: logos que proveerá Jerry
│  │  ├─ ubeenet-white.svg
│  │  └─ ubeenet-color.svg
│  ├─ media/
│  │  ├─ bg-loop.webm
│  │  ├─ bg-loop.mp4
│  │  ├─ bg-loop-mobile.webm     # versión 9:16
│  │  ├─ bg-loop-mobile.mp4
│  │  └─ bg-poster.jpg           # primer frame, para carga y reduced-motion
│  ├─ og-image.jpg               # 1200×630
│  └─ favicon.svg
├─ src/
│  ├─ config/event.ts            # ÚNICA fuente de nombre, fecha, sede, textos
│  ├─ styles/tokens.css
│  ├─ styles/global.css
│  ├─ components/ (Hero, RegisterForm, Agenda, Themes, Venue, Partners, Faq, Footer, BgVideo)
│  ├─ lib/ (supabase.ts, ics.ts, validation.ts)
│  └─ pages/
│     ├─ index.astro
│     ├─ registros/index.astro   # panel protegido
│     └─ aviso-de-privacidad.astro
├─ supabase/
│  ├─ migrations/0001_registrations.sql
│  └─ functions/register/index.ts
├─ .env.example
└─ README.md                     # pasos de setup (sección 12)
```

`astro.config.mjs`: configurar `site` y `base` para GitHub Pages leyendo de variables de entorno, para que funcione tanto en `publifix.github.io/<repo>` como en un dominio propio futuro (p. ej. `evento.ubeenet.com`). Todas las rutas internas y de assets deben respetar `base`.

---

## 3. Sistema de diseño

### 3.1 Concepto

**"La malla"**. Ubeenet = *ubee* + *net*. La página se construye sobre una retícula hexagonal tipo panal que funciona como diagrama de red multicloud: nodos (nubes, regiones, sitios) unidos por rutas, con paquetes de luz que viajan entre ellos. Siguiendo el lenguaje del sitio de Ubeenet (azules, blanco, orden y estructura), la paleta se limita a azules y neutros. El cian `--nube` es **el único acento** de la página.

Principios:
1. **Un solo momento memorable:** el fondo animado. Todo lo demás es sobrio, preciso y quieto.
2. **El acento se gana su lugar:** `--nube` en su versión sólida solo se usa en el botón de registro, el foco del formulario y los links. En la malla del fondo aparece siempre en baja opacidad, para que el botón siga siendo lo más brillante de la pantalla.
3. **Ingeniería, no marketing:** líneas finas, alineación a la izquierda, datos concretos (fecha, hora, dirección) tratados como información técnica, no como adorno.
4. **El formulario siempre está a la vista** en desktop (hero de dos columnas) y a un toque en móvil (botón fijo inferior).

### 3.2 Color (tokens)

> Nota: en la lámina de la paleta las etiquetas `243867` y `0D1320` parecen invertidas. Se usan según el color real que se ve.

```css
:root {
  /* Marca */
  --noche:   #0D1320; /* fondo base de toda la página */
  --marino:  #243867; /* superficies: panel del formulario, bloques */
  --nube:    #68A6BD; /* ACENTO ÚNICO: CTA, links, foco; en la malla solo a baja opacidad */
  --violeta: #5E237E; /* solo profundidad en el fondo animado, nunca en UI */
  --acero:   #888686; /* texto secundario, metadatos, bordes inactivos */

  /* Derivados */
  --texto:        #EEF1F6;               /* texto principal sobre noche */
  --texto-suave:  #B9C2D0;               /* párrafos largos */
  --linea:        rgba(104,166,189,.22); /* --nube a 22%: divisores, bordes */
  --superficie:   rgba(36,56,103,.55);   /* --marino translúcido + blur */
  --nube-hover:   #8CBDD0;
  --error:        #E5787A;
  --ok:           #6FCF97;
}
```

Contraste verificado: `--texto` sobre `--noche` > 15:1; `--nube` sobre `--noche` ≈ 6.9:1; `--acero` sobre `--noche` ≈ 5.3:1 (usar solo ≥ 14px). En el botón cian el texto es `--noche`.

**Fuera de la paleta:** el amarillo `#CDA41B` de la lámina original **no se usa** en ningún elemento de la landing, del fondo animado ni del correo.

El sitio es **solo oscuro** (identidad del evento nocturno). Declarar `color-scheme: dark`.

### 3.3 Tipografía

Una sola familia: **Saira** (variable, ejes `wght` y `wdth`), auto-hospedada con Fontsource (`@fontsource-variable/saira`) o Google Fonts. Sus formas cuadradas y redondeadas emparentan con el wordmark de Ubeenet. La personalidad viene de jugar con el **ancho**, no de mezclar familias.

| Rol | Ancho | Peso | Tamaño | Interlínea | Tracking |
|---|---|---|---|---|---|
| Display (H1) | 75 (condensada) | 600 | `clamp(2.75rem, 6vw + 1rem, 5.5rem)` | 0.95 | −0.02em |
| H2 | 85 | 600 | `clamp(1.9rem, 3vw + 1rem, 3rem)` | 1.05 | −0.01em |
| H3 | 100 | 600 | 1.25rem | 1.2 | 0 |
| Cuerpo | 100 | 400 | 1.0625rem (17px) | 1.6 | 0 |
| Datos del evento (fecha, hora, sede) | 112 (expandida) | 500 | 1rem | 1.4 | 0.01em |
| Botón | 100 | 600 | 1.0625rem | 1 | 0.01em |
| Pie / legales | 100 | 400 | 0.875rem | 1.5 | 0 |

Reglas:
- Sentence case en todo. **Sin** etiquetas en mayúsculas espaciadas sobre los títulos.
- **No** resaltar una palabra suelta del titular con otro color o cursiva.
- Ancho de línea del cuerpo: máximo 65ch.
- Fallback: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

### 3.4 Retícula, espacio y forma

- Contenedor: `max-width: 1200px`, padding lateral `clamp(1.25rem, 4vw, 2.5rem)`.
- Escala de espacio (múltiplos de 8): 8, 16, 24, 32, 48, 64, 96, 128.
- Separación entre secciones: `clamp(80px, 12vw, 144px)`.
- Alineación: **todo a la izquierda**. Nada centrado salvo el estado de éxito del formulario.
- Radios con jerarquía (no uno para todo): inputs y botón `10px`; panel del formulario `20px`; chips/indicadores `999px`.
- **Sin sombras grises genéricas.** La profundidad se logra con `--superficie` + `backdrop-filter: blur(16px)` + borde de 1px `--linea`.
- Motivo gráfico: hexágono de línea fina (1px, `--linea`) usado solo como marcador de nodo en la agenda y como textura muy sutil detrás de la sección de sede. No usar hexágonos como contenedores de contenido.

### 3.5 Layout

**Desktop (≥ 1024px)**

```
┌───────────────────────────────────────────────────────────────┐
│ [logo ubeenet]                                  [Registrarme] │ ← header transparente, sticky al hacer scroll
│                                                               │
│  Ubeenet Connect 2026              ┌───────────────────────┐  │
│  (H1, 2-3 líneas, condensada)      │ Reserva tu lugar      │  │
│                                    │ Nombre completo       │  │
│  Subtítulo de 1-2 líneas           │ [___________________] │  │
│                                    │ Correo                │  │
│  ─────────────────────────         │ [___________________] │  │
│  Domingo 29 nov 2026               │ WhatsApp              │  │
│  5:45 pm – 10:00 pm                │ [+52 ▾][____________] │  │
│  Hotel Campos Polanco, CDMX        │ [✓] Acepto aviso...   │  │
│  ─────────────────────────         │ [   Reservar lugar   ]│  │
│                                    │ Cupo limitado         │  │
│   ~~~ malla animada de fondo ~~~   └───────────────────────┘  │
├───────────────────────────────────────────────────────────────┤
│ Qué vas a vivir  (3 temas en lista con línea-ruta conectora)  │
├───────────────────────────────────────────────────────────────┤
│ Agenda  (timeline vertical, nodos hexagonales)                │
├───────────────────────────────────────────────────────────────┤
│ La sede  (texto + dirección + botones Maps / Waze)            │
├───────────────────────────────────────────────────────────────┤
│ Partners (fila de nombres/logos en --acero, sin cajas)        │
├───────────────────────────────────────────────────────────────┤
│ Preguntas frecuentes (acordeón <details>)                     │
├───────────────────────────────────────────────────────────────┤
│ CTA final corto + footer                                      │
└───────────────────────────────────────────────────────────────┘
```

Hero: columnas 7/5 en grid de 12. Alto mínimo `100svh`. El video de fondo cubre **solo el hero**; debajo del hero el fondo es `--noche` sólido con un degradado de transición de 160px.

**Móvil (< 768px)**

```
┌───────────────────────┐
│ [logo]                │
│ Ubeenet               │
│ Connect 2026          │
│ subtítulo             │
│ ───────────           │
│ Dom 29 nov · 5:45 pm  │
│ Hotel Campos Polanco  │
│ ───────────           │
│ [ formulario completo]│ ← el formulario va justo debajo, no en otra página
│ ...secciones...       │
├───────────────────────┤
│ [ Reservar lugar ]    │ ← barra fija inferior, se oculta cuando el form está visible (IntersectionObserver)
└───────────────────────┘
```

Respetar `env(safe-area-inset-bottom)` en la barra fija.

### 3.6 Movimiento

- **Único movimiento automático:** el video de fondo del hero.
- Carga de página: una sola secuencia orquestada en el hero (H1 → datos → panel del formulario), 600ms total, `opacity` + `translateY(12px)`, easing `cubic-bezier(.2,.7,.2,1)`. Nada de animaciones de entrada en las demás secciones.
- Interacciones permitidas: foco de inputs (borde pasa a `--nube`, 150ms), hover del botón (`--nube-hover`), apertura del acordeón FAQ, transición del formulario a estado de éxito.
- `prefers-reduced-motion: reduce` → no se reproduce el video (se muestra `bg-poster.jpg`) y se desactiva la secuencia de carga.

---

## 4. Fondo animado con HyperFrames

Instalar las skills antes de empezar esta parte:

```bash
npx skills add heygen-com/hyperframes --full-depth
```

(Requiere Node ≥ 22 y FFmpeg.) Crear el proyecto en `hyperframes/bg-loop` y seguir el flujo de la skill: escribir composición → `lint` → `check` → `preview` → render.

### Especificación de la composición

- **Formatos:** 1920×1080 (desktop) y 1080×1920 (móvil). 30 fps. **12 segundos**.
- **Loop perfecto:** el frame 0 y el frame final deben ser idénticos. Todas las animaciones se expresan como funciones de `t / 12s` con módulo, sin ningún elemento que "empiece" o "termine".
- **Fondo:** `--noche` (#0D1320) sólido, con dos manchas de luz muy difusas (radial gradients, blur alto): una `--violeta` al 35% de opacidad abajo a la izquierda y una `--marino` arriba a la derecha. Se desplazan lentamente (deriva de ±4% del ancho en el ciclo de 12s).
- **Malla:** retícula hexagonal en perspectiva ligera (plano inclinado ~12°), líneas de 1px en `--nube` al 12–18% de opacidad. La malla se desvanece hacia los bordes (máscara radial) para no competir con el texto.
- **Nodos:** 9–12 nodos en vértices de la malla, círculos de 3–5px en `--nube`, con un halo que "respira" (escala 1 → 1.6 → 1, desfasado por nodo). 3 nodos más grandes representan "nubes" (anillo hexagonal fino alrededor).
- **Rutas:** entre nodos, segmentos que siguen las aristas de la malla, en `--nube` al 35%.
- **Paquetes:** 6–8 puntos de 3px con núcleo blanco (`--texto`) y halo `--nube`, con estela corta (gradiente a transparente, 40px), viajando por las rutas. Cada paquete completa su ruta un número entero de veces en 12s, para garantizar el loop.
- **Pulso de conexión:** cada 4s (3 veces por ciclo), un anillo blanco muy tenue (15% de opacidad) se expande desde uno de los nodos-nube.
- **Zona libre:** la mitad izquierda del cuadro (donde va el H1) debe tener menor densidad de nodos y paquetes. En móvil, el tercio superior.
- **Nada de texto, logos ni íconos** dentro del video.

### Render y exportación

```bash
npx hyperframes render --quality high --output out/bg-loop.mp4
```

Después, con FFmpeg, generar las versiones web y moverlas a `public/media/`:
- `bg-loop.webm` (VP9, CRF ~38, sin audio) — objetivo **< 2.5 MB**
- `bg-loop.mp4` (H.264, `-crf 28 -preset slow -movflags +faststart -an`) — objetivo < 4 MB
- Lo mismo para la versión móvil
- `bg-poster.jpg`: frame 0 exportado, calidad 80

### Uso en la página (`BgVideo.astro`)

```html
<video class="bg" autoplay muted loop playsinline preload="metadata"
       poster="/media/bg-poster.jpg" aria-hidden="true">
  <source src="/media/bg-loop-mobile.webm" type="video/webm" media="(max-width: 767px)">
  <source src="/media/bg-loop-mobile.mp4"  type="video/mp4"  media="(max-width: 767px)">
  <source src="/media/bg-loop.webm" type="video/webm">
  <source src="/media/bg-loop.mp4"  type="video/mp4">
</video>
```

Notas: como `media` en `<source>` de video no es universal, elegir la fuente por JS según `matchMedia` antes de asignar `src` (con fallback al de desktop). Sobre el video, overlay `linear-gradient(90deg, rgba(13,19,32,.85) 0%, rgba(13,19,32,.35) 60%, rgba(13,19,32,.6) 100%)` para legibilidad. Pausar el video cuando el hero sale del viewport (IntersectionObserver). Con `prefers-reduced-motion`, no cargar el video.

---

## 5. Textos (mock — todo en `src/config/event.ts`)

> Todo es provisional. Escribir en español de México, tono profesional y cercano, frases cortas.

**Meta**
- `<title>`: Ubeenet Connect 2026 · Registro
- Description: Una noche con Ubeenet y sus partners para hablar de nube, redes y seguridad. 29 de noviembre de 2026, Hotel Campos Polanco, CDMX.

**Hero**
- H1: `Ubeenet Connect 2026`
- Subtítulo: Una noche para conectar con quienes construyen la nube, la red y la seguridad de las empresas en México.
- Datos: Domingo 29 de noviembre de 2026 / 5:45 pm a 10:00 pm / Hotel Campos Polanco, CDMX

**Formulario**
- Título del panel: Reserva tu lugar
- Ayuda bajo el título: Te enviaremos la confirmación a tu correo.
- Labels: Nombre completo / Correo electrónico / WhatsApp
- Placeholders: Ana López Martínez / ana@empresa.com / 55 1234 5678
- Checkbox: Acepto el [aviso de privacidad] y que Ubeenet me contacte sobre este evento.
- Botón: `Reservar lugar` → en envío: `Reservando…`
- Nota bajo el botón: Cupo limitado. Evento sin costo, solo con registro.
- Éxito (título): Tu lugar está reservado
- Éxito (texto): Te enviamos la confirmación a {email}. Guarda la fecha en tu calendario.
- Botones de éxito: `Agregar a Google Calendar` y `Descargar para Outlook / Apple (.ics)`
- Ya registrado: Este correo ya tiene un lugar reservado. Revisa tu bandeja de entrada o escríbenos a sales@ubeenet.com.
- Errores por campo:
  - Escribe tu nombre y al menos un apellido.
  - Revisa el correo; parece incompleto.
  - El WhatsApp debe tener 10 dígitos.
  - Para continuar, acepta el aviso de privacidad.
- Error general: No pudimos guardar tu registro. Revisa tu conexión e inténtalo de nuevo.

**Qué vas a vivir** (lista de 3, no tarjetas iguales; unidos por una línea-ruta vertical en `--nube`)
1. **MultiCloud sin fricción** — Cómo mover aplicaciones y datos entre nubes cuando tiene sentido para el negocio, no cuando lo exige el proveedor.
2. **Una red que se defiende sola** — Networking y seguridad nativos de la nube: de monitorear incidentes a prevenirlos con automatización.
3. **Conversaciones que no caben en una llamada** — Una noche con el equipo de Ubeenet, sus partners y otros líderes de TI.

**Agenda** (es una secuencia real → timeline con horas)
- 5:45 pm — Registro y bienvenida
- 6:30 pm — Keynote: el estado del MultiCloud en México
- 7:15 pm — Panel con partners
- 8:00 pm — Demostraciones en vivo
- 8:45 pm — Cena y networking
- 10:00 pm — Cierre

**La sede**
- H2: Hotel Campos Polanco
- Texto: Campos Elíseos 361, Polanco III Secc., Miguel Hidalgo, 11540, Ciudad de México.
- Botones: `Abrir en Google Maps` · `Abrir en Waze` (links de búsqueda por dirección, `target="_blank" rel="noopener"`)
- Nota: Contaremos con servicio de valet parking. (TODO: confirmar)

**Partners** (texto en `--acero`, o logos monocromos cuando lleguen): AWS, Microsoft Azure, Oracle, VMware, Cisco, Aviatrix, Palo Alto Networks, Veeam, ExaGrid, Pure Storage. TODO: confirmar cuáles participan en el evento.

**Preguntas frecuentes**
- ¿Tiene costo? — No. El evento es sin costo, pero el cupo es limitado y requiere registro.
- ¿Puedo llevar a alguien de mi equipo? — Cada persona debe registrarse con su propio correo.
- ¿Cuál es el código de vestimenta? — Business casual.
- ¿Hay estacionamiento? — Sí, el hotel cuenta con valet parking.
- ¿A quién contacto si tengo dudas? — Escríbenos a sales@ubeenet.com o al +52 55 3074 6052.

**CTA final:** H2 `Nos vemos el 29 de noviembre` + botón `Reservar lugar` (scroll al formulario).

**Footer:** logo Ubeenet · © 2026 Ubeenet S.A. de C.V. · Aviso de privacidad · LinkedIn / Facebook (links del sitio oficial) · "Desarrollado por Blanco Nuclear" en `--acero`, tamaño de legales (0.875rem), al final del footer, sin logo ni enlace destacado.

**Aviso de privacidad:** página simple con texto placeholder conforme a la LFPDPPP (responsable, datos recabados, finalidad: gestionar el registro y comunicaciones del evento, derechos ARCO, contacto). Marcar todo como `TODO: texto legal del cliente`.

---

## 6. Formulario — comportamiento

- Campos:
  - `full_name`: requerido, 3–120 caracteres, al menos 2 palabras, `autocomplete="name"`.
  - `email`: requerido, `type="email"`, `autocomplete="email"`, normalizar a minúsculas y `trim`.
  - `whatsapp`: selector de lada (default `+52 México`; incluir también `+1 EE.UU./Canadá`, `+34 España`, `+57 Colombia`, y "Otro" con campo libre) + número. Para +52 exigir 10 dígitos. Guardar en formato E.164 (`+525512345678`). `inputmode="tel"`, `autocomplete="tel-national"`. Formatear visualmente mientras se escribe (`55 1234 5678`).
  - `consent`: checkbox requerido.
  - Honeypot: campo `company_website` oculto fuera de pantalla (no `display:none`), `tabindex="-1"`, `autocomplete="off"`.
  - Turnstile: widget en modo `managed`, solo si existe `PUBLIC_TURNSTILE_SITE_KEY`.
- Capturar y enviar también: `utm_source`, `utm_medium`, `utm_campaign` de la URL (si existen) y `referrer`.
- Validación en vivo al salir del campo (`blur`) y al enviar; mensajes debajo de cada input, vinculados con `aria-describedby`, y `aria-invalid` en el campo.
- Al enviar: deshabilitar el botón, mostrar `Reservando…`, `POST` a la Edge Function.
- Respuestas:
  - `201` → estado de éxito (reemplaza el formulario dentro del mismo panel, con foco en el título de éxito).
  - `409` → mensaje de "ya registrado".
  - `400` → errores por campo devueltos por el servidor.
  - `429`/`5xx`/red → error general, el botón se reactiva.
- Estado de éxito: links "Agregar a Google Calendar" (URL `calendar.google.com/calendar/render?action=TEMPLATE&...` con fechas UTC) y descarga `.ics` generada en el cliente con `src/lib/ics.ts`.

### Archivo .ics (mismo generador para el cliente y la Edge Function)

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ubeenet//Connect 2026//ES
METHOD:PUBLISH
BEGIN:VEVENT
UID:ubeenet-connect-2026@ubeenet.com
DTSTAMP:<ahora en UTC>
DTSTART:20261129T234500Z
DTEND:20261130T040000Z
SUMMARY:Ubeenet Connect 2026
LOCATION:Hotel Campos Polanco\, Campos Elíseos 361\, Polanco III Secc.\, Miguel Hidalgo\, 11540 CDMX
DESCRIPTION:Tu registro está confirmado. Dudas: sales@ubeenet.com
END:VEVENT
END:VCALENDAR
```

Usar CRLF como separador de línea.

---

## 7. Supabase

### 7.1 Migración `supabase/migrations/0001_registrations.sql`

```sql
create extension if not exists citext;

create table public.registrations (
  id           uuid primary key default gen_random_uuid(),
  full_name    text   not null check (char_length(full_name) between 3 and 120),
  email        citext not null unique,
  whatsapp     text   not null check (whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  consent      boolean not null check (consent = true),
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  referrer     text,
  email_status text not null default 'pending', -- pending | sent | failed
  created_at   timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- Sin políticas para anon: nadie inserta ni lee desde el navegador.
-- Lectura solo para administradores autenticados en la lista:
create table public.admins (email citext primary key);
alter table public.admins enable row level security;

create policy "admins leen registros"
  on public.registrations for select to authenticated
  using (exists (select 1 from public.admins a where a.email = (auth.jwt()->>'email')));

create policy "admins se ven a sí mismos"
  on public.admins for select to authenticated
  using (email = (auth.jwt()->>'email'));

-- TODO: Jerry agrega los correos de administradores:
-- insert into public.admins (email) values ('media@publifix.net');
```

### 7.2 Edge Function `supabase/functions/register/index.ts` (Deno)

Requisitos:
- Solo `POST` y `OPTIONS`. CORS restringido a `ALLOWED_ORIGINS` (lista separada por comas; incluir `http://localhost:4321` para desarrollo).
- Leer JSON, validar exactamente con las mismas reglas del frontend (compartir criterios en `validation.ts` y replicarlos aquí).
- Si el honeypot viene lleno → responder `201` falso **sin** guardar (no darle pistas al bot).
- Si `TURNSTILE_SECRET` existe → verificar el token contra `https://challenges.cloudflare.com/turnstile/v0/siteverify`; si falla → `400`.
- Rate limit simple: máximo 5 intentos por IP cada 10 minutos (tabla auxiliar `rate_limits` o un `Map` en memoria como mínimo; preferir tabla).
- Insertar con cliente de service_role. Si viola el `unique` de email → `409`.
- Enviar correo con Resend (`POST https://api.resend.com/emails`) con el `.ics` adjunto (base64). Actualizar `email_status` a `sent` o `failed`. **Si falla el correo, el registro igual responde `201`** (el registro es lo importante).
- Opcional por variable `NOTIFY_EMAIL`: enviar aviso interno breve con el nuevo registro.
- Respuestas JSON: `{ ok: true }`, `{ ok: false, code: 'duplicate' }`, `{ ok: false, code: 'validation', fields: {...} }`, `{ ok: false, code: 'server' }`.
- Desplegar con `--no-verify-jwt` (es un endpoint público protegido por validación, honeypot, Turnstile y rate limit).

Secrets de la función:
`RESEND_API_KEY`, `RESEND_FROM` (p. ej. `Ubeenet Eventos <eventos@ubeenet.com>`), `ALLOWED_ORIGINS`, `TURNSTILE_SECRET` (opcional), `NOTIFY_EMAIL` (opcional). `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya vienen en el entorno de Edge Functions.

---

## 8. Correo de confirmación (Resend)

- Asunto: `Tu lugar en Ubeenet Connect 2026 está confirmado`
- HTML basado en tablas (compatible con Outlook), ancho 600px, fondo `#0D1320`, panel `#243867`, texto `#EEF1F6`, botón en `#68A6BD` con texto `#0D1320`. Fuente: Arial/Helvetica (no fuentes web en correo).
- Contenido:
  1. Logo (URL absoluta al PNG en el sitio publicado; TODO hasta tener el logo).
  2. "Hola {primer nombre}, tu lugar está reservado."
  3. Bloque de datos: fecha, horario, sede con dirección y link a Maps.
  4. Botón "Agregar a Google Calendar" y nota: "También adjuntamos el archivo para Outlook y Apple Calendar."
  5. Recomendación: "Llega desde las 5:45 pm para tu registro."
  6. Contacto: sales@ubeenet.com · +52 55 3074 6052.
  7. Pie legal corto + link al aviso de privacidad.
- Incluir también versión `text` plana.
- Adjuntar `ubeenet-connect-2026.ics`.

---

## 9. Panel `/registros`

- Página con estilo del sitio, `<meta name="robots" content="noindex,nofollow">`, excluida del sitemap.
- Sin sesión: formulario de inicio de sesión (correo + contraseña) con `supabase.auth.signInWithPassword`.
- Con sesión: consulta `registrations` ordenada por `created_at desc`. Si la consulta regresa vacía porque el usuario no está en `admins`, mostrar "Tu cuenta no tiene acceso a los registros."
- Vista:
  - Contador total grande + registros de hoy.
  - Buscador por nombre, correo o WhatsApp (filtro en cliente).
  - Tabla: Nombre · Correo · WhatsApp (link `https://wa.me/<número sin +>`) · Fecha de registro (formato CDMX) · Estado del correo.
  - Botón `Exportar CSV` (UTF-8 con BOM para que Excel respete acentos).
  - Botón `Cerrar sesión`.
- En móvil, la tabla se convierte en lista apilada; nunca scroll horizontal del body.
- La seguridad depende del RLS, no de ocultar la página.

---

## 10. SEO, metadatos y rendimiento

- `lang="es-MX"`, Open Graph y Twitter Card con `og-image.jpg` (1200×630: fondo noche, malla, nombre del evento, fecha; generarlo como frame estático desde la composición de HyperFrames o con un componente HTML capturado).
- JSON-LD `Event` con nombre, fechas ISO con zona `-06:00`, `location` (Place + PostalAddress), `organizer` Ubeenet, `eventAttendanceMode` offline, `isAccessibleForFree: true`.
- `theme-color` `#0D1320`. Favicon SVG.
- Presupuesto: LCP < 2.5s en 4G; el H1 y el formulario no dependen del video. JS de la página principal < 60 KB gzip (cargar `supabase-js` solo en `/registros`; en la landing el formulario usa `fetch` directo a la Edge Function).
- Fuentes con `font-display: swap` y precarga del archivo de Saira.

---

## 11. Accesibilidad y calidad mínima

- Navegación completa con teclado; foco visible (outline 2px `--texto`, offset 3px; en inputs activos el borde es `--nube`).
- Labels reales en todos los campos; nunca solo placeholder.
- Video con `aria-hidden="true"`; el contenido no depende de él.
- Mensajes de éxito/error en una región `aria-live="polite"`.
- Probar en 360px, 768px, 1024px, 1440px. Nada se desborda horizontalmente.
- Lighthouse objetivo: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

---

## 12. Deploy y setup (documentar en README.md)

**GitHub Actions** (`.github/workflows/deploy.yml`): en push a `main`, instalar, `astro build` con variables de repo (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_REGISTER_ENDPOINT`, `PUBLIC_TURNSTILE_SITE_KEY`, `SITE_URL`, `BASE_PATH`) y publicar con `actions/deploy-pages`.

**Pasos manuales que hará Jerry** (listarlos en el README como checklist):
1. Crear el repo en la organización `publifix` y activar GitHub Pages con source "GitHub Actions".
2. Crear proyecto en Supabase → correr la migración → `insert` de correos en `admins`.
3. En Supabase Auth: desactivar "Allow new users to sign up" y crear manualmente los usuarios administradores.
4. Crear cuenta en Resend → verificar dominio de envío (idealmente `ubeenet.com`, requiere registros DNS del cliente; mientras tanto, un subdominio propio de Publifix) → crear API key.
5. Cargar secrets de la Edge Function y desplegarla: `supabase functions deploy register --no-verify-jwt`.
6. (Opcional) Crear sitio en Cloudflare Turnstile y cargar las dos keys.
7. Agregar variables del repo en GitHub y hacer push.
8. Colocar logos en `public/brand/` y textos definitivos en `src/config/event.ts`.
9. (Futuro) Dominio propio: archivo `CNAME` + registro DNS + actualizar `SITE_URL`, `BASE_PATH` y `ALLOWED_ORIGINS`.

---

## 13. Orden de trabajo sugerido para Claude Code

1. Scaffold de Astro, tokens, tipografía, layout base y `event.ts`.
2. Todas las secciones con los textos mock.
3. Formulario con validación y estados (mockear la respuesta del endpoint en desarrollo si aún no existe).
4. Migración SQL y Edge Function `register` con Resend y .ics.
5. Panel `/registros`.
6. Composición HyperFrames del fondo → render → export a `public/media/` → integración `BgVideo`.
7. SEO, JSON-LD, OG image, aviso de privacidad.
8. Workflow de deploy y README.
9. Revisión final: ejecutar el build, revisar en los 4 anchos de pantalla, revisar contraste y foco, quitar todo lo que sea decoración sin función.

**Al terminar, entregar un resumen con:** qué quedó listo, qué `TODO:` quedan pendientes y los comandos exactos para correr local (`npm run dev`), servir la función local (`supabase functions serve`) y desplegar.
