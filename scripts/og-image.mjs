// Genera public/og-image.jpg (1200×630) desde el primer frame del fondo
// HyperFrames + logo + nombre y fecha del evento. Requiere Playwright:
//   npx -y playwright@1 install chromium   (si no está instalado)
//   node scripts/og-image.mjs
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (p) => readFileSync(resolve(root, p)).toString('base64');

// Lee nombre, fecha y sede de src/config/event.ts sin compilar TypeScript.
const config = readFileSync(resolve(root, 'src/config/event.ts'), 'utf8');
const pick = (key) => config.match(new RegExp(`${key}: '([^']+)'`))[1];
const name = pick('name');
const date = pick('dateLong');
const time = pick('timeRange');
const venue = config.match(/venue: \{\s*name: '([^']+)'/)[1];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Hanken; src: url(data:font/woff2;base64,${b64('src/assets/fonts/hanken-latin.woff2')}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #0D1320; font-family: Hanken; color: #FFFFFF; overflow: hidden; }
.bg { position: absolute; inset: 0; background: url(data:image/jpeg;base64,${b64('public/media/bg-poster.jpg')}) 30% 45% / 1500px auto no-repeat; }
.shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(13,19,32,.9) 0%, rgba(13,19,32,.5) 45%, rgba(13,19,32,0) 70%); }
.inner { position: absolute; inset: 64px 80px 60px; display: flex; flex-direction: column; justify-content: space-between; }
.logo { width: 170px; }
h1 { font-size: 84px; margin-top: 28px; font-weight: 300; line-height: 1.02; letter-spacing: -0.025em; max-width: 8ch; }
.data { font-size: 26px; font-weight: 500; color: #FFFFFF; border-top: 1px solid rgba(255,255,255,.7); padding-top: 20px; max-width: 640px; }
</style></head><body>
<div class="bg"></div><div class="shade"></div>
<div class="inner">
  <img class="logo" src="data:image/svg+xml;base64,${b64('public/brand/ubeenet-white.svg')}">
  <h1>${name}</h1>
  <p class="data">${date} · ${time}<br>${venue}, CDMX</p>
</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: resolve(root, 'public/og-image.jpg'), type: 'jpeg', quality: 85 });
await browser.close();
console.log('public/og-image.jpg generado');
