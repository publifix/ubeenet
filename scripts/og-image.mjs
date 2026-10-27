// Genera public/og-image.jpg (1200×630) con las formas de la invitación,
// el logo, el titular del hero y la fecha del evento. Requiere Playwright:
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

// Lee fecha, horario y sede de src/config/event.ts sin compilar TypeScript.
const config = readFileSync(resolve(root, 'src/config/event.ts'), 'utf8');
const pick = (key) => config.match(new RegExp(`${key}: '([^']+)'`))[1];
const date = pick('dateLong');
const time = pick('timeRange');
const venue = config.match(/venue: \{\s*name: '([^']+)'/)[1];
// Formas de la invitación, tomadas del mismo componente que usa el hero.
const shapes = readFileSync(resolve(root, 'src/components/HeroShapes.astro'), 'utf8').match(/<g[\s\S]*<\/g>/)[0];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Roboto; src: url(data:font/woff2;base64,${b64('src/assets/fonts/roboto-latin.woff2')}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #161C2A; font-family: Roboto; color: #FFFFFF; overflow: hidden; position: relative; }
svg { position: absolute; top: 0; right: 0; width: 640px; height: 630px; }
.inner { position: absolute; inset: 56px 80px 56px; display: flex; flex-direction: column; justify-content: space-between; }
.logo { width: 150px; }
h1 { font-size: 64px; line-height: 1.05; letter-spacing: -0.015em; max-width: 13ch; }
h1 span { display: block; }
.data { font-size: 26px; line-height: 1.35; }
.data b { letter-spacing: .04em; text-transform: uppercase; }
</style></head><body>
<svg viewBox="300 0 724 1280" preserveAspectRatio="none">${shapes}</svg>
<div class="inner">
  <img class="logo" src="data:image/svg+xml;base64,${b64('public/brand/ubeenet-white.svg')}">
  <h1><span style="font-weight:700">Conectemos hoy.</span><span style="font-weight:300">Creemos nuevas oportunidades juntos.</span></h1>
  <p class="data"><b>${date}</b><br>${time} · ${venue}, CDMX</p>
</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: resolve(root, 'public/og-image.jpg'), type: 'jpeg', quality: 85 });
await browser.close();
console.log('public/og-image.jpg generado');
