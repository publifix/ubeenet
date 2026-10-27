# Sistema de diseño — Ubeenet Connect 2026

Base: §3 de `PROMPT_CLAUDE_CODE.md`, **ajustado por el cliente (oct 2026) para empatar con ubeenet.com**: bloques de color con curva, líneas blancas finas, grotesca ligera en titulares grandes, botones píldora y formulario en panel blanco. Tokens en `src/styles/tokens.css`.

## Concepto
**La nube de red.** El hero recrea el lenguaje de ubeenet.com: texto grande y ligero a la izquierda, nube de neón con malla de nodos a la derecha. El fondo animado (HyperFrames) es el único movimiento automático; todo lo demás es sobrio y quieto.

## Color
| Token | Valor | Uso |
|---|---|---|
| `--noche` | #0D1320 | bloques oscuros (hero, registro, temas, agenda, FAQ, footer) |
| `--niebla` | #DFDFDA | bloques claros con curva (sede, partners), como "Our Partners" del sitio |
| `--blanco` | #FFFFFF | panel del formulario, botón primario sobre oscuro |
| `--nube` | #68A6BD | foco, links sobre oscuro, luz de la nube animada |
| `--marino` | #243867 | hover del botón oscuro, foco sobre blanco, luz difusa del video |
| `--violeta` | #5E237E | solo en el fondo animado (nodos y luz difusa) |
| `--tinta` / `--tinta-suave` | #0D1320 / #4A5161 | texto sobre blanco o niebla |
| `--texto` / `--texto-suave` | #FFFFFF / #B9C2D0 | texto sobre oscuro |
| `--linea` | blanco 72 % | separadores de 1 px sobre oscuro (lenguaje del acordeón "Our Services") |
| `--linea-clara` | noche 22 % | separadores sobre claro |
| `--enlace-claro` | #2F6F87 | links sobre blanco (5.6:1) |

El amarillo #CDA41B no se usa en ningún lugar (tampoco en los nodos del video, aunque el sitio lo usa).

Contrastes: blanco/noche 18.6:1, suave/noche 10.3:1, tinta/niebla 13.9:1, tinta-suave/niebla 6:1, tinta-suave/blanco 8:1, enlace-claro/blanco 5.6:1, error-claro/blanco 5.4:1.

## Tipografía
**Hanken Grotesk** variable (wght 100–900), auto-hospedada en `src/assets/fonts`. Es la grotesca libre más cercana a la del sitio (no fue posible leer el sitio para confirmar el nombre de su fuente; si el cliente comparte el archivo, se cambia en `tokens.css`). Titulares en peso 300 y grandes (display 88 px, H2 68 px en desktop), cuerpo 400, datos y títulos de lista 500. Sentence case, sin eyebrows, cuerpo ≤ 65ch.

## Layout
Contenedor 1200 px, escala de 8. Hero: texto + datos + botón a la izquierda, nube animada a la derecha (como ubeenet.com). Debajo, sección **Registro**: argumento a la izquierda, formulario blanco a la derecha. Secciones con título grande a la izquierda (5 col) y lista con separadores blancos a la derecha (7 col). Secuencia de bloques: oscuro (hero, registro, temas, agenda) → curva → claro (sede con foto, partners) → curva → oscuro (FAQ, CTA final, footer).

## Forma
Botones píldora (999 px): blanco sobre oscuro, noche sobre blanco/claro, contorno para secundarios. Inputs 12 px, panel del formulario y foto de la sede 24 px. Sin sombras decorativas.

## Movimiento
Video del hero: 12 s, loop perfecto, nubes con contorno de neón, malla interna de nodos que pulsan, paquetes que recorren el contorno y viajan entre nubes, campo de partículas en ola. Pausa fuera de pantalla; con `prefers-reduced-motion` se muestra el poster. Entrada del hero en 600 ms. Interacciones: foco 150 ms, hover, acordeón, transición a éxito.
