import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/paths';

// /registros queda fuera a propósito.
const pages = ['', 'aviso-de-privacidad/'];

export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
      .map((p) => `  <url><loc>${absoluteUrl(p)}</loc></url>`)
      .join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
