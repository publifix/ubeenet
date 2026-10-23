import type { APIRoute } from 'astro';
import { absoluteUrl, withBase } from '../lib/paths';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nDisallow: ${withBase('registros/')}\n\nSitemap: ${absoluteUrl('sitemap.xml')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
