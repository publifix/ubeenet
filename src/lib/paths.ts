// Une rutas con el `base` de Astro (p. ej. /ubeenet) para que todo funcione
// igual en publifix.github.io/ubeenet y en un dominio propio con base "/".
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  return clean ? `${base}/${clean}` : `${base}/`;
}

export function absoluteUrl(path = ''): string {
  return new URL(withBase(path), import.meta.env.SITE).toString();
}
