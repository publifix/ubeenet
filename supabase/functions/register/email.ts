// Correo de confirmación: HTML en tablas (compatible con Outlook) + texto plano.
import { event } from '../_shared/event.ts';
import { googleCalendarUrl } from '../_shared/ics.ts';

const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

/** siteUrl: URL pública del sitio, sin "/" final (p. ej. https://publifix.github.io/ubeenet). */
export function confirmationEmail(fullName: string, siteUrl: string) {
  const name = firstName(fullName);
  const gcal = googleCalendarUrl(event);
  const logo = `${siteUrl}/brand/ubeenet-white.png`;
  const privacy = `${siteUrl}/aviso-de-privacidad/`;
  const v = event.venue;
  const o = event.organizer;
  const subject = `Tu lugar en ${event.name} está confirmado`;
  const font = 'Arial, Helvetica, sans-serif';

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:0 0 4px 0;font:400 13px/18px ${font};color:#B9C2D0;">${label}</td>
    </tr>
    <tr>
      <td style="padding:0 0 16px 0;font:700 16px/22px ${font};color:#EEF1F6;">${value}</td>
    </tr>`;

  const html = `<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#0D1320;">
<div style="display:none;max-height:0;overflow:hidden;">${esc(event.dateLong)} · ${esc(event.timeRange)} · ${esc(v.name)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0D1320" style="background:#0D1320;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
        <tr>
          <td style="padding:0 0 24px 0;">
            <img src="${logo}" width="140" height="23" alt="Ubeenet" style="display:block;border:0;outline:none;width:140px;height:auto;">
          </td>
        </tr>
        <tr>
          <td bgcolor="#243867" style="background:#243867;border-radius:16px;padding:32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:0 0 8px 0;font:700 24px/30px ${font};color:#EEF1F6;">Hola ${esc(name)}, tu lugar está reservado.</td>
              </tr>
              <tr>
                <td style="padding:0 0 24px 0;font:400 16px/24px ${font};color:#B9C2D0;">Te esperamos en ${esc(event.name)}.</td>
              </tr>
              ${row('Fecha', esc(event.dateLong))}
              ${row('Horario', esc(event.timeRange))}
              ${row('Sede', `${esc(v.name)}<br><span style="font-weight:400;color:#B9C2D0;">${esc(v.address)}</span><br><a href="${v.mapsUrl}" style="font-weight:400;color:#68A6BD;">Ver en Google Maps</a>`)}
              <tr>
                <td style="padding:8px 0 12px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td bgcolor="#68A6BD" style="border-radius:10px;">
                        <a href="${gcal}" style="display:inline-block;padding:14px 24px;font:700 16px/20px ${font};color:#0D1320;text-decoration:none;border-radius:10px;">Agregar a Google Calendar</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 24px 0;font:400 14px/20px ${font};color:#B9C2D0;">También adjuntamos el archivo para Outlook y Apple Calendar.</td>
              </tr>
              <tr>
                <td style="padding:16px 0 0 0;border-top:1px solid #3A5287;font:400 15px/22px ${font};color:#EEF1F6;">Llega desde las ${esc(event.startTime)} para tu registro.</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 0 0 0;font:400 14px/21px ${font};color:#B9C2D0;">
            ¿Dudas? <a href="mailto:${o.email}" style="color:#68A6BD;">${o.email}</a> · <a href="${o.phoneHref}" style="color:#68A6BD;">${o.phone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 0 0 0;font:400 12px/18px ${font};color:#8F96A3;">
            Recibes este correo porque te registraste en ${esc(event.name)}. © 2026 ${esc(o.name)} ·
            <a href="${privacy}" style="color:#8F96A3;">Aviso de privacidad</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    `Hola ${name}, tu lugar está reservado.`,
    '',
    `${event.name}`,
    `Fecha: ${event.dateLong}`,
    `Horario: ${event.timeRange}`,
    `Sede: ${v.name}, ${v.address}`,
    `Google Maps: ${v.mapsUrl}`,
    '',
    `Agregar a Google Calendar: ${gcal}`,
    'También adjuntamos el archivo para Outlook y Apple Calendar.',
    '',
    `Llega desde las ${event.startTime} para tu registro.`,
    '',
    `Dudas: ${o.email} · ${o.phone}`,
    '',
    `© 2026 ${o.name} · Aviso de privacidad: ${privacy}`,
  ].join('\n');

  return { subject, html, text };
}
