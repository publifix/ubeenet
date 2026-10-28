// Edge Function pública de registro. Desplegar con --no-verify-jwt:
//   supabase functions deploy register --no-verify-jwt
// Secrets: RESEND_API_KEY, RESEND_FROM, REPLY_TO, ALLOWED_ORIGINS, SITE_PUBLIC_URL,
//          TURNSTILE_SECRET (opcional), NOTIFY_EMAIL (opcional, varios separados por coma).
// Los avisos internos de cada registro van a NOTIFY_EMAIL o, si no existe,
// a DEFAULT_NOTIFY_EMAIL (indicación del cliente).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { event } from '../_shared/event.ts';
import { buildIcs } from '../_shared/ics.ts';
import { validateRegistration } from '../_shared/validation.ts';
import { confirmationEmail } from './email.ts';

const env = (k: string) => Deno.env.get(k)?.trim() || '';

const ALLOWED_ORIGINS = env('ALLOWED_ORIGINS')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);
const DEFAULT_NOTIFY_EMAIL = 'elia@blanconuclear.com.mx';
const RATE_LIMIT = 5;
const RATE_WINDOW_MIN = 10;

const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false },
});

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
  });
}

const clip = (v: unknown, max = 500) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

async function rateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_WINDOW_MIN * 60_000).toISOString();
  const { count, error } = await supabase
    .from('rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since);
  if (error) {
    console.error('rate_limits select', error.message);
    return false; // si falla el contador, no bloquear registros legítimos
  }
  await supabase.from('rate_limits').insert({ ip });
  if (Math.random() < 0.02) await supabase.rpc('purge_rate_limits');
  return (count ?? 0) >= RATE_LIMIT;
}

async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = env('TURNSTILE_SECRET');
  if (!secret) return true;
  if (typeof token !== 'string' || !token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip !== 'unknown') form.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('turnstile', err);
    return false;
  }
}

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

async function sendEmail(payload: Record<string, unknown>): Promise<boolean> {
  const key = env('RESEND_API_KEY');
  if (!key) {
    console.error('RESEND_API_KEY no configurada');
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env('RESEND_FROM') || 'Ubeenet Eventos <onboarding@resend.dev>', ...payload }),
    });
    if (!res.ok) console.error('resend', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error('resend', err);
    return false;
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== 'POST') return json({ ok: false, code: 'method' }, 405, origin);
  if (origin && !ALLOWED_ORIGINS.includes(origin.replace(/\/$/, ''))) {
    return json({ ok: false, code: 'origin' }, 403, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
    if (!body || typeof body !== 'object') throw new Error('body');
  } catch {
    return json({ ok: false, code: 'validation', fields: {} }, 400, origin);
  }

  // Honeypot lleno: respuesta de éxito falsa, sin guardar nada.
  if (typeof body.company_website === 'string' && body.company_website.trim() !== '') {
    return json({ ok: true }, 201, origin);
  }

  const ip = clientIp(req);
  if (await rateLimited(ip)) return json({ ok: false, code: 'rate_limited' }, 429, origin);

  if (!(await verifyTurnstile(body.turnstile_token, ip))) {
    return json({ ok: false, code: 'captcha' }, 400, origin);
  }

  const result = validateRegistration(body, event.form.errors);
  if (!result.ok) return json({ ok: false, code: 'validation', fields: result.fields }, 400, origin);
  const data = result.data;

  const { data: inserted, error } = await supabase
    .from('registrations')
    .insert({
      ...data,
      utm_source: clip(body.utm_source, 200),
      utm_medium: clip(body.utm_medium, 200),
      utm_campaign: clip(body.utm_campaign, 200),
      referrer: clip(body.referrer, 500),
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return json({ ok: false, code: 'duplicate' }, 409, origin);
    console.error('insert', error.code, error.message);
    return json({ ok: false, code: 'server' }, 500, origin);
  }

  // Correo de confirmación con .ics adjunto. Si falla, el registro igual es válido.
  const siteUrl = (env('SITE_PUBLIC_URL') || 'https://publifix.github.io/ubeenet').replace(/\/$/, '');
  const mail = confirmationEmail(data.full_name, siteUrl);
  const sent = await sendEmail({
    to: [data.email],
    reply_to: env('REPLY_TO') || event.organizer.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    attachments: [{ filename: event.ics.filename, content: toBase64(buildIcs(event)), content_type: 'text/calendar' }],
  });
  await supabase.from('registrations').update({ email_status: sent ? 'sent' : 'failed' }).eq('id', inserted.id);

  // Aviso interno de cada registro (con el estado del correo de confirmación).
  const notify = (env('NOTIFY_EMAIL') || DEFAULT_NOTIFY_EMAIL).split(',').map((e) => e.trim()).filter(Boolean);
  const when = new Intl.DateTimeFormat('es-MX', { timeZone: event.timeZone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
  await sendEmail({
    to: notify,
    reply_to: data.email,
    subject: `Nuevo registro · ${event.name}: ${data.full_name}`,
    text: [
      `Nuevo registro en ${event.name}`,
      '',
      `Nombre: ${data.full_name}`,
      `Correo: ${data.email}`,
      `WhatsApp: ${data.whatsapp} (https://wa.me/${data.whatsapp.slice(1)})`,
      `Fecha de registro: ${when} (CDMX)`,
      `Correo de confirmación: ${sent ? 'enviado' : 'FALLÓ, contactar manualmente'}`,
      clip(body.utm_source) ? `Campaña: ${clip(body.utm_source)} / ${clip(body.utm_medium) ?? '-'} / ${clip(body.utm_campaign) ?? '-'}` : '',
    ].filter(Boolean).join('\n'),
  });

  return json({ ok: true }, 201, origin);
});
