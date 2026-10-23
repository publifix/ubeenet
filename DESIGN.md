# Sistema de diseño — Ubeenet Connect 2026

Fuente: §3 de `PROMPT_CLAUDE_CODE.md`. Tokens en `src/styles/tokens.css`.

## Concepto
**La malla.** Retícula hexagonal tipo panal como diagrama de red multicloud: nodos, rutas y paquetes de luz. Un solo momento memorable (el fondo animado del hero); todo lo demás es sobrio, preciso y quieto. Solo oscuro (`color-scheme: dark`): es un evento nocturno.

## Color
| Token | Valor | Uso |
|---|---|---|
| `--noche` | #0D1320 | fondo de toda la página |
| `--marino` | #243867 | superficies (panel del formulario vía `--superficie`) |
| `--nube` | #68A6BD | **único acento**: botón de registro, foco de inputs, links, casilla marcada |
| `--violeta` | #5E237E | solo profundidad difusa en el video de fondo |
| `--acero` | #888686 | partners, legales (≥ 14 px) |
| `--texto` / `--texto-suave` | #EEF1F6 / #B9C2D0 | texto principal / párrafos y metadatos |
| `--linea` | nube 22 % | divisores y bordes |
| `--error` / `--ok` | #E5787A / #6FCF97 | estados del formulario |

El amarillo #CDA41B de la lámina no se usa. Contrastes medidos: texto 16.4:1, suave 10.3:1, acero 5.1:1, nube 6.9:1, botón (noche sobre nube) 6.9:1, error sobre panel 5.1:1.

## Tipografía
Saira variable (ejes `wght` y `wdth`), auto-hospedada (`src/assets/fonts`). La personalidad viene del ancho: display 75 %, H2 85 %, datos del evento 112 %. Sentence case, sin eyebrows, sin palabras resaltadas en el titular, cuerpo ≤ 65ch.

## Layout
Contenedor 1200 px; escala de 8; secciones con título en 4 columnas y contenido en 8 (`.split`); todo alineado a la izquierda salvo el estado de éxito. Hero 7/5 con el formulario siempre visible en desktop; en móvil el formulario va debajo de los datos y una barra fija "Reservar lugar" aparece cuando el formulario sale de pantalla.

## Forma y profundidad
Radios: controles 10 px, panel 20 px, chips 999 px. Sin sombras: profundidad = `--superficie` + `backdrop-filter: blur(16px)` + borde 1 px `--linea`. Hexágono de línea fina solo como marcador de la agenda y textura sutil de la sede.

## Movimiento
Único movimiento automático: el video del hero (12 s, loop perfecto, pausa fuera de pantalla). Entrada del hero orquestada en 600 ms (H1 → datos → formulario). Interacciones: foco 150 ms, hover del botón, acordeón FAQ, transición a éxito. `prefers-reduced-motion`: sin video (poster) y sin secuencia de entrada.

## Componentes
- **Botón primario** (nube, texto noche, 52 px): solo acciones de registro y Google Calendar en el éxito.
- **Botón secundario** (borde texto 28 %): Registrarme del header, Maps/Waze, .ics.
- **Inputs** 48 px, borde texto 22 %, foco borde nube + outline 2 px texto offset 3 px; error con borde `--error` y mensaje debajo (`aria-describedby`).
