# ubeenet

Landing page del evento UBEENET.

## Publicación

- El sitio se publica automáticamente en GitHub Pages con cada push (cualquier rama) mediante `.github/workflows/pages.yml`.
- URL pública: https://publifix.github.io/ubeenet/
- Al terminar cada ronda de desarrollo: hacer commit y push de todos los cambios, y dar al usuario la URL pública.
- El sitio vive en el subdirectorio `/ubeenet/`: usar rutas relativas para assets (`./img/logo.png`, no `/img/logo.png`). Si se usa un bundler (Vite, Astro, etc.), configurar la ruta base con la variable de entorno `BASE_PATH`.
- Si hay `package.json` con script `build`, el workflow publica `dist/`, `build/`, `out/`, `_site/` o `public/` (la primera que tenga `index.html`). Si no, publica los archivos estáticos de la raíz.
