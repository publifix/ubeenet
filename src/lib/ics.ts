// Generador de .ics y del link de Google Calendar. Mismo código en el
// navegador y en la Edge Function (se copia a supabase/functions/_shared).
// Sin imports: debe funcionar igual en Vite y en Deno.

export interface CalendarEvent {
  name: string;
  startUtc: string; // ISO, p. ej. 2026-11-26T23:45:00Z
  endUtc: string;
  ics: { uid: string; prodId: string; location: string; description: string };
}

/** 2026-11-26T23:45:00Z → 20261126T234500Z */
export function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeText(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Pliega líneas a 75 octetos (RFC 5545), sin partir caracteres multibyte. */
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = '';
  let limit = 75;
  for (const ch of line) {
    if (enc.encode(cur + ch).length > limit) {
      out.push(cur);
      cur = '';
      limit = 74; // la línea de continuación empieza con un espacio
    }
    cur += ch;
  }
  out.push(cur);
  return out.join('\r\n ');
}

export function buildIcs(ev: CalendarEvent, now: Date = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${ev.ics.prodId}`,
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ev.ics.uid}`,
    `DTSTAMP:${toIcsDate(now.toISOString())}`,
    `DTSTART:${toIcsDate(ev.startUtc)}`,
    `DTEND:${toIcsDate(ev.endUtc)}`,
    `SUMMARY:${escapeText(ev.name)}`,
    `LOCATION:${escapeText(ev.ics.location)}`,
    `DESCRIPTION:${escapeText(ev.ics.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function googleCalendarUrl(ev: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.name,
    dates: `${toIcsDate(ev.startUtc)}/${toIcsDate(ev.endUtc)}`,
    details: ev.ics.description,
    location: ev.ics.location,
    ctz: 'America/Mexico_City',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
