// Copia el código compartido del sitio a la Edge Function, para que el
// navegador y el servidor validen y generen el .ics exactamente igual.
// Corre solo en `npm run dev`, `npm run build` y `npm run deploy:function`.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dest = resolve(root, 'supabase/functions/_shared');
mkdirSync(dest, { recursive: true });

const files = {
  'src/config/event.ts': 'event.ts',
  'src/lib/validation.ts': 'validation.ts',
  'src/lib/ics.ts': 'ics.ts',
};

const header = '// ARCHIVO GENERADO por scripts/sync-shared.mjs — edita el original en src/.\n';
for (const [from, to] of Object.entries(files)) {
  const src = readFileSync(resolve(root, from), 'utf8');
  writeFileSync(resolve(dest, to), header + src);
}
console.log('sync-shared: event.ts, validation.ts e ics.ts copiados a supabase/functions/_shared');
