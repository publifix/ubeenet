// Correos del registro: confirmación al invitado y aviso interno al equipo.
// HTML en tablas (compatible con Outlook y Gmail) + versión de texto plano.
// Look & feel de la invitación: encabezado con las formas y el titular
// (public/brand/email-header.jpg), fondo noche y tarjeta blanca.
import { event } from '../_shared/event.ts';
import { googleCalendarUrl } from '../_shared/ics.ts';

const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FONT = 'Arial, Helvetica, sans-serif';
const C = {
  noche: '#161C2A',
  blanco: '#FFFFFF',
  tinta: '#0D1320',
  suave: '#4A5161',
  linea: '#E3E5EA',
  enlace: '#2F6F87',
  pie: '#B9C2D0',
  pieTenue: '#8F96A3',
};

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

/** Estructura común: encabezado con la marca, tarjeta blanca y pie. */
function layout(opts: { title: string; preheader: string; siteUrl: string; body: string; footer: string }): string {
  const header = `${opts.siteUrl}/brand/email-header.jpg`;
  return `<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.noche};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.noche}" style="background:${C.noche};">
  <tr>
    <td align="center" style="padding:24px 12px 40px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
        <tr>
          <td style="padding:0;">
            <img src="${header}" width="600" alt="Ubeenet · Conectemos hoy. Creemos nuevas oportunidades juntos." style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:16px 16px 0 0;">
          </td>
        </tr>
        <tr>
          <td bgcolor="${C.blanco}" style="background:${C.blanco};border-radius:0 0 16px 16px;padding:36px 36px 32px;">
            ${opts.body}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 8px 0;font:400 13px/20px ${FONT};color:${C.pie};">
            ${opts.footer}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Fila "etiqueta / valor" de la tarjeta de datos. */
const dataRow = (label: string, value: string, last = false) => `
  <tr>
    <td style="padding:14px 0;${last ? '' : `border-bottom:1px solid ${C.linea};`}">
      <div style="font:400 12px/16px ${FONT};color:${C.suave};text-transform:uppercase;letter-spacing:0.06em;">${label}</div>
      <div style="padding-top:4px;font:700 16px/22px ${FONT};color:${C.tinta};">${value}</div>
    </td>
  </tr>`;

const button = (href: string, label: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td bgcolor="${C.tinta}" style="border-radius:999px;">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font:700 15px/20px ${FONT};color:${C.blanco};text-decoration:none;border-radius:999px;">${label}</a>
      </td>
    </tr>
  </table>`;

/** siteUrl: URL pública del sitio, sin "/" final (p. ej. https://ubeenetevents.com.mx). */
export function confirmationEmail(fullName: string, siteUrl: string) {
  const name = firstName(fullName);
  const gcal = googleCalendarUrl(event);
  const privacy = `${siteUrl}/aviso-de-privacidad/`;
  const v = event.venue;
  const o = event.organizer;
  const subject = `Tu lugar en ${event.name} está confirmado`;
  const [start, end] = event.timeRange.split(' a ');

  const body = `
    <h1 style="margin:0;font:700 26px/32px ${FONT};color:${C.tinta};">Hola ${esc(name)}, tu lugar está reservado.</h1>
    <p style="margin:12px 0 0;font:400 16px/24px ${FONT};color:${C.suave};">${esc(event.hero.subtitle)}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;border-top:1px solid ${C.linea};">
      ${dataRow('Fecha', esc(event.dateLong))}
      ${dataRow('Horario', `${esc(start)} a ${esc(end)} <span style="font-weight:400;color:${C.suave};">(hora de la Ciudad de México)</span>`)}
      ${dataRow(
        'Sede',
        `${esc(v.name)}<br><span style="font-weight:400;color:${C.suave};">${esc(v.address)}</span><br>
         <span style="font-weight:400;"><a href="${v.mapsUrl}" style="color:${C.enlace};">Google Maps</a> &nbsp;·&nbsp; <a href="${v.wazeUrl}" style="color:${C.enlace};">Waze</a></span>`,
        true,
      )}
    </table>

    <div style="padding-top:24px;">${button(gcal, 'Agregar a Google Calendar')}</div>
    <p style="margin:12px 0 0;font:400 14px/20px ${FONT};color:${C.suave};">También adjuntamos el archivo para Outlook y Apple Calendar.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
      <tr>
        <td style="padding:16px 18px;background:#F2F4F7;border-radius:12px;font:400 15px/22px ${FONT};color:${C.tinta};">
          <strong>Llega desde las ${esc(event.startTime)}</strong> para tu registro de acceso.<br>
          <span style="color:${C.suave};">${esc(v.note)} Código de vestimenta: business casual.</span>
        </td>
      </tr>
    </table>

    <p style="margin:28px 0 0;font:400 15px/22px ${FONT};color:${C.suave};">
      ¿Dudas? Escríbenos a <a href="mailto:${o.email}" style="color:${C.enlace};">${o.email}</a>
      o llámanos al <a href="${o.phoneHref}" style="color:${C.enlace};">${o.phone}</a>.
    </p>
    <p style="margin:20px 0 0;font:400 15px/22px ${FONT};color:${C.tinta};">Te esperamos,<br><strong>Equipo Ubeenet</strong></p>`;

  const footer = `
    Recibes este correo porque te registraste en ${esc(event.name)}.<br>
    © 2026 ${esc(o.name)} · <a href="${privacy}" style="color:${C.pie};">Aviso de privacidad</a>`;

  const html = layout({
    title: subject,
    preheader: `${event.dateLong} · ${event.timeRange} · ${v.name}`,
    siteUrl,
    body,
    footer,
  });

  const text = [
    `Hola ${name}, tu lugar está reservado.`,
    '',
    event.hero.subtitle,
    '',
    `Fecha: ${event.dateLong}`,
    `Horario: ${event.timeRange} (hora de la Ciudad de México)`,
    `Sede: ${v.name}, ${v.address}`,
    `Google Maps: ${v.mapsUrl}`,
    `Waze: ${v.wazeUrl}`,
    '',
    `Agregar a Google Calendar: ${gcal}`,
    'También adjuntamos el archivo para Outlook y Apple Calendar.',
    '',
    `Llega desde las ${event.startTime} para tu registro de acceso. ${v.note} Código de vestimenta: business casual.`,
    '',
    `¿Dudas? ${o.email} · ${o.phone}`,
    '',
    'Te esperamos,',
    'Equipo Ubeenet',
    '',
    `© 2026 ${o.name} · Aviso de privacidad: ${privacy}`,
  ].join('\n');

  return { subject, html, text };
}

export interface NotificationData {
  fullName: string;
  email: string;
  whatsapp: string; // E.164
  registeredAt: string; // fecha legible en hora de CDMX
  confirmationSent: boolean;
  campaign?: string | null;
}

/** Aviso interno para el equipo cada vez que alguien se registra. */
export function notificationEmail(d: NotificationData, siteUrl: string) {
  const panel = `${siteUrl}/registros/`;
  const wa = `https://wa.me/${d.whatsapp.replace(/^\+/, '')}`;
  const subject = `Nuevo registro · ${d.fullName}`;
  const status = d.confirmationSent
    ? `<span style="color:#17804F;">Enviado</span>`
    : `<span style="color:#C2383B;">Falló: contactar manualmente</span>`;

  const body = `
    <h1 style="margin:0;font:700 24px/30px ${FONT};color:${C.tinta};">Nuevo registro</h1>
    <p style="margin:8px 0 0;font:400 15px/22px ${FONT};color:${C.suave};">${esc(event.name)} · ${esc(event.dateLong)}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;border-top:1px solid ${C.linea};">
      ${dataRow('Nombre', esc(d.fullName))}
      ${dataRow('Correo', `<a href="mailto:${esc(d.email)}" style="color:${C.enlace};">${esc(d.email)}</a>`)}
      ${dataRow('WhatsApp', `<a href="${wa}" style="color:${C.enlace};">${esc(d.whatsapp)}</a>`)}
      ${dataRow('Fecha de registro', `${esc(d.registeredAt)} <span style="font-weight:400;color:${C.suave};">(CDMX)</span>`)}
      ${dataRow('Correo de confirmación', status, !d.campaign)}
      ${d.campaign ? dataRow('Campaña', esc(d.campaign), true) : ''}
    </table>

    <div style="padding-top:24px;">${button(panel, 'Ver todos los registros')}</div>
    <p style="margin:12px 0 0;font:400 13px/20px ${FONT};color:${C.suave};">Responde a este correo para escribirle directamente a ${esc(firstName(d.fullName))}.</p>`;

  const footer = `Aviso automático de la landing de registro · <a href="${siteUrl}" style="color:${C.pie};">${esc(siteUrl.replace(/^https?:\/\//, ''))}</a>`;

  const html = layout({
    title: subject,
    preheader: `${d.fullName} · ${d.email} · ${d.whatsapp}`,
    siteUrl,
    body,
    footer,
  });

  const text = [
    `Nuevo registro en ${event.name}`,
    '',
    `Nombre: ${d.fullName}`,
    `Correo: ${d.email}`,
    `WhatsApp: ${d.whatsapp} (${wa})`,
    `Fecha de registro: ${d.registeredAt} (CDMX)`,
    `Correo de confirmación: ${d.confirmationSent ? 'enviado' : 'FALLÓ, contactar manualmente'}`,
    d.campaign ? `Campaña: ${d.campaign}` : '',
    '',
    `Ver todos los registros: ${panel}`,
  ]
    .filter((l, i, a) => l !== '' || a[i - 1] !== '')
    .join('\n');

  return { subject, html, text };
}
