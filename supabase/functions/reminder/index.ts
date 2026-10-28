// Recordatorio la tarde anterior al evento. La llama .github/workflows/reminder.yml
// (programado el 25 de noviembre, 4:00 pm CDMX, o a mano). Desplegar con --no-verify-jwt:
// la protege la cabecera x-reminder-key, que debe coincidir con el secret REMINDER_KEY.
//
// POST { mode: 'test' }            → un solo correo de muestra a REMINDER_TEST_EMAIL (o labs.publifix@gmail.com)
// POST { mode: 'all', force? }     → a todos los registrados; sin force solo en las 48 h previas al evento.
// Cada correo lleva Idempotency-Key, así que repetir la corrida el mismo día no duplica envíos.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { event } from '../_shared/event.ts';
import { reminderEmail } from '../register/email.ts';
import { sendEmail } from '../register/resend.ts';

const env = (k: string) => Deno.env.get(k)?.trim() || '';
const DEFAULT_NOTIFY_EMAILS = 'elia@blanconuclear.com.mx,labs.publifix@gmail.com,mirna@blanconuclear.com.mx';
const PAUSE_MS = 600; // límite de la API de Resend: ~2 envíos por segundo

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

function sameKey(a: string, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ ok: false, code: 'method' }, 405);
  if (!sameKey(env('REMINDER_KEY'), req.headers.get('x-reminder-key') || '')) return json({ ok: false, code: 'unauthorized' }, 401);

  let body: { mode?: string; force?: boolean };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const siteUrl = (env('SITE_PUBLIC_URL') || 'https://ubeenetevents.com.mx').replace(/\/$/, '');
  const replyTo = env('REPLY_TO') || event.organizer.email;

  if (body.mode === 'test') {
    const to = env('REMINDER_TEST_EMAIL') || 'labs.publifix@gmail.com';
    const mail = reminderEmail('Invitado', siteUrl);
    const ok = await sendEmail({ to: [to], reply_to: replyTo, subject: `[Prueba] ${mail.subject}`, html: mail.html, text: mail.text });
    return json({ ok, mode: 'test', to }, ok ? 200 : 502);
  }

  if (body.mode !== 'all') return json({ ok: false, code: 'mode' }, 400);

  const msToStart = new Date(event.startUtc).getTime() - Date.now();
  if (!body.force && (msToStart < 0 || msToStart > 48 * 3600_000)) {
    return json({ ok: false, code: 'outside_window', detail: 'Solo se envía en las 48 h previas al evento (usa force para forzar).' }, 409);
  }

  const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: rows, error } = await supabase.from('registrations').select('full_name, email').order('created_at');
  if (error) {
    console.error('registrations', error.message);
    return json({ ok: false, code: 'db' }, 500);
  }

  const failed: string[] = [];
  for (const r of rows ?? []) {
    const mail = reminderEmail(r.full_name, siteUrl);
    const ok = await sendEmail(
      { to: [r.email], reply_to: replyTo, subject: mail.subject, html: mail.html, text: mail.text },
      `${event.slug}-reminder-${r.email.toLowerCase()}`,
    );
    if (!ok) failed.push(r.email);
    await new Promise((res) => setTimeout(res, PAUSE_MS));
  }
  const total = rows?.length ?? 0;
  const sent = total - failed.length;

  // Resumen al equipo.
  const notify = (env('NOTIFY_EMAIL') || DEFAULT_NOTIFY_EMAILS).split(',').map((e) => e.trim()).filter(Boolean);
  const lines = [
    `Recordatorio del ${event.nameInSentence} enviado a ${sent} de ${total} registrados.`,
    failed.length ? `\nNo se pudo enviar a:\n${failed.join('\n')}\n\nContáctalos por WhatsApp desde ${siteUrl}/registros/` : '',
  ];
  await sendEmail({ to: notify, subject: `Recordatorio enviado · ${sent} de ${total}`, text: lines.join('\n') });

  return json({ ok: failed.length === 0, mode: 'all', total, sent, failed }, failed.length ? 207 : 200);
});
