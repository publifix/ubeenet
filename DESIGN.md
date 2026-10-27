# Sistema de diseño — Ubeenet Connect 2026

Base: §3 de `PROMPT_CLAUDE_CODE.md`, **ajustado por el cliente (oct 2026) para empatar con ubeenet.com**: bloques de color con curva, líneas blancas finas, grotesca ligera en titulares grandes, botones píldora y formulario en panel blanco. Tokens en `src/styles/tokens.css`.

## Concepto
**La invitación como hero.** El hero reproduce la invitación "Save the date" del cliente: titular SAVE THE DATE, subtítulo y datos con íconos sobre el fondo oscuro, y las formas orgánicas de la invitación a la derecha, enmarcando el formulario blanco. El resto de la página sigue el lenguaje de ubeenet.com. Sin video ni animación automática.

## Color
| Token | Valor | Uso |
|---|---|---|
| `--noche` | #161C2A | fondo de la invitación; bloques oscuros (hero, temas, agenda, FAQ, footer) |
| `--niebla` | #DFDFDA | bloques claros con curva (sede, partners), como "Our Partners" del sitio |
| `--blanco` | #FFFFFF | panel del formulario, botón primario sobre oscuro |
| `--nube` | #68A6BD | foco y links sobre oscuro |
| `--marino` | #243867 | hover del botón oscuro, foco sobre blanco |
| Formas del hero | #392153 · #3B3D63 · #3E4D6A · #283F4F · #334E61 · #152534 | tonos exactos muestreados de la invitación (`HeroShapes.astro`), solo en el hero y la imagen OG |
| `--tinta` / `--tinta-suave` | #0D1320 / #4A5161 | texto sobre blanco o niebla |
| `--texto` / `--texto-suave` | #FFFFFF / #B9C2D0 | texto sobre oscuro |
| `--linea` | blanco 72 % | separadores de 1 px sobre oscuro (lenguaje del acordeón "Our Services") |
| `--linea-clara` | noche 22 % | separadores sobre claro |
| `--enlace-claro` | #2F6F87 | links sobre blanco (5.6:1) |

El amarillo #CDA41B no se usa en ningún lugar.

Contrastes: blanco/noche 18.6:1, suave/noche 10.3:1, tinta/niebla 13.9:1, tinta-suave/niebla 6:1, tinta-suave/blanco 8:1, enlace-claro/blanco 5.6:1, error-claro/blanco 5.4:1.

## Tipografía
**Roboto** variable (la de la invitación) solo en el hero: SAVE y DATE en 700, THE en 300, subtítulo 400, datos en mayúsculas 700/300.

**Hanken Grotesk** variable (wght 100–900), auto-hospedada en `src/assets/fonts`. Es la grotesca libre más cercana a la del sitio (no fue posible leer el sitio para confirmar el nombre de su fuente; si el cliente comparte el archivo, se cambia en `tokens.css`). Titulares en peso 300 y grandes (display 88 px, H2 68 px en desktop), cuerpo 400, datos y títulos de lista 500. Sentence case, sin eyebrows, cuerpo ≤ 65ch.

## Layout
Contenedor 1200 px, escala de 8. Hero: titular, subtítulo y datos a la izquierda (6 col); formulario blanco a la derecha (5 col), siempre visible en desktop. En tablet y móvil el formulario va justo debajo de los datos, y la barra fija "Reservar lugar" aparece cuando sale de pantalla. Secciones con título grande a la izquierda (5 col) y lista con separadores blancos a la derecha (7 col). Secuencia de bloques: oscuro (hero, temas, agenda) → curva → claro (sede con foto) → curva → oscuro (FAQ, CTA final, footer). Partners oculto hasta confirmar participantes.

## Forma
Botones píldora (999 px): blanco sobre oscuro, noche sobre blanco/claro, contorno para secundarios. Inputs 12 px, panel del formulario y foto de la sede 24 px. Sin sombras decorativas.

## Movimiento
Sin movimiento automático. Entrada del hero en 600 ms (titular → datos → formulario), desactivada con `prefers-reduced-motion`. Interacciones: foco 150 ms, hover, acordeón, transición a éxito.
