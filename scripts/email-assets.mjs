// Genera public/brand/email-header.jpg (1200×440, se muestra a 600×220): encabezado
// de los correos con las formas de la invitación, el logo y el titular del hero.
// Requiere Playwright:  node scripts/email-assets.mjs
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (p) => readFileSync(resolve(root, p)).toString('base64');
const shapes = readFileSync(resolve(root, 'src/components/HeroShapes.astro'), 'utf8').match(/<g[\s\S]*<\/g>/)[0];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Roboto; src: url(data:font/woff2;base64,${b64('src/assets/fonts/roboto-latin.woff2')}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 440px; background: #161C2A; font-family: Roboto; color: #fff; overflow: hidden; position: relative; }
svg { position: absolute; top: 0; right: 0; width: 560px; height: 440px; }
.inner { position: absolute; inset: 64px 72px; display: flex; flex-direction: column; gap: 44px; }
.logo { width: 180px; }
h1 { font-size: 56px; line-height: 1.06; letter-spacing: -0.015em; max-width: 14ch; }
h1 span { display: block; }
</style></head><body>
<svg viewBox="300 0 724 1280" preserveAspectRatio="none">${shapes}</svg>
<div class="inner">
  <img class="logo" src="data:image/svg+xml;base64,${b64('public/brand/ubeenet-white.svg')}">
  <h1><span style="font-weight:700">Conectemos hoy.</span><span style="font-weight:300">Creemos nuevas oportunidades juntos.</span></h1>
</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 440 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: resolve(root, 'public/brand/email-header.jpg'), type: 'jpeg', quality: 86 });
await browser.close();
console.log('public/brand/email-header.jpg generado');
