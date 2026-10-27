# ubeenet

Landing de registro de Ubeenet Connect 2026. Especificación: `PROMPT_CLAUDE_CODE.md` (fuente de verdad). Setup y comandos: `README.md`.

## Publicación

- Push a `main` → `.github/workflows/deploy.yml` construye Astro y publica en GitHub Pages: https://publifix.github.io/ubeenet/
- Al terminar cada ronda de desarrollo: commit, push de la rama de trabajo y a `main`, y dar al usuario la URL pública.
- El sitio vive bajo `/ubeenet/`: usar `withBase()` de `src/lib/paths.ts` para rutas internas y assets de `public/`.

## Reglas del proyecto

- Textos, fechas y sede solo en `src/config/event.ts`.
- `src/lib/validation.ts`, `src/lib/ics.ts` y `src/config/event.ts` se copian a `supabase/functions/_shared/` (`npm run sync:shared`); no editar las copias.
- Estilo: empatar con ubeenet.com (bloques oscuro/claro con curva, líneas blancas, grotesca ligera, botones píldora, formulario en panel blanco) y con la invitación en el hero. Ver `DESIGN.md`. El amarillo #CDA41B no se usa.
- Fecha y horario (los de la invitación): jueves 26 de noviembre de 2026, 5:45 pm a 10:00 pm (CDMX). El cliente no quiere agenda en la landing.
- Avisos y copias de cada registro: **elia@blanconuclear.com.mx** (secret `NOTIFY_EMAIL`; la Edge Function lo usa por defecto si el secret no existe).
- Hero = invitación "Save the date" del cliente: titular "Conectemos hoy. / Creemos nuevas oportunidades juntos." en Roboto (700/300), subtítulo del cliente y formas del fondo redibujadas en vector (`src/components/HeroShapes.astro`, colores exactos de la invitación). Sin video ni animación de fondo. El formulario va en el hero (desktop a la derecha, móvil debajo de los datos).
- Sección Partners oculta hasta confirmar participantes (`Partners.astro` existe, no se usa en `index.astro`).
- Diseño: `DESIGN.md`. Producto: `PRODUCT.md`.
