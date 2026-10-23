// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages: https://publifix.github.io/ubeenet/
// Dominio propio futuro: SITE_URL=https://evento.ubeenet.com BASE_PATH=/
const site = process.env.SITE_URL || 'https://publifix.github.io';
const base = process.env.BASE_PATH || '/ubeenet';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
