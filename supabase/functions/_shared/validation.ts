// ARCHIVO GENERADO por scripts/sync-shared.mjs — edita el original en src/.
// Reglas de validación del registro. Mismo código en el navegador y en la
// Edge Function (se copia a supabase/functions/_shared con `npm run sync:shared`).
// Sin imports: debe funcionar igual en Vite y en Deno.

export interface CountryCode {
  code: string; // dígitos sin "+", vacío para "Otro"
  label: string;
  digits?: number; // longitud exacta del número nacional, si se conoce
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '52', label: '+52 México', digits: 10 },
  { code: '1', label: '+1 EE.UU./Canadá', digits: 10 },
  { code: '34', label: '+34 España', digits: 9 },
  { code: '57', label: '+57 Colombia', digits: 10 },
  { code: '', label: 'Otro' },
];

export interface RegistrationInput {
  full_name?: unknown;
  email?: unknown;
  country_code?: unknown; // dígitos de la lada ("52") u otra lada libre
  phone?: unknown; // número nacional, con o sin espacios
  consent?: unknown;
}

export interface RegistrationData {
  full_name: string;
  email: string;
  whatsapp: string; // E.164
  consent: true;
}

export type FieldName = 'full_name' | 'email' | 'whatsapp' | 'consent';
export type FieldErrors = Partial<Record<FieldName, string>>;

export interface ValidationMessages {
  name: string;
  email: string;
  whatsapp: string;
  whatsappOther: string;
  consent: string;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
export const onlyDigits = (v: unknown) => str(v).replace(/\D+/g, '');

export function normalizeName(v: unknown): string {
  return str(v).trim().replace(/\s+/g, ' ');
}

export function normalizeEmail(v: unknown): string {
  return str(v).trim().toLowerCase();
}

export function validateName(v: unknown): boolean {
  const name = normalizeName(v);
  if (name.length < 3 || name.length > 120) return false;
  const words = name.split(' ').filter((w) => /\p{L}/u.test(w));
  return words.length >= 2;
}

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/;
export function validateEmail(v: unknown): boolean {
  const email = normalizeEmail(v);
  return email.length <= 254 && EMAIL_RE.test(email);
}

/** Devuelve el número en E.164 o null si no es válido. */
export function toE164(countryCode: unknown, phone: unknown): string | null {
  const cc = onlyDigits(countryCode);
  const national = onlyDigits(phone);
  if (!cc || cc.length > 4 || cc.startsWith('0')) return null;
  const known = COUNTRY_CODES.find((c) => c.code === cc && c.digits);
  if (known && national.length !== known.digits) return null;
  const full = cc + national;
  if (!/^[1-9][0-9]{7,14}$/.test(full)) return null;
  return '+' + full;
}

export function validateRegistration(
  input: RegistrationInput,
  messages: ValidationMessages,
): { ok: true; data: RegistrationData } | { ok: false; fields: FieldErrors } {
  const fields: FieldErrors = {};
  if (!validateName(input.full_name)) fields.full_name = messages.name;
  if (!validateEmail(input.email)) fields.email = messages.email;
  const whatsapp = toE164(input.country_code, input.phone);
  if (!whatsapp) {
    const cc = onlyDigits(input.country_code);
    fields.whatsapp = COUNTRY_CODES.some((c) => c.code === cc && c.digits === 10)
      ? messages.whatsapp
      : messages.whatsappOther;
  }
  if (input.consent !== true) fields.consent = messages.consent;

  if (Object.keys(fields).length > 0) return { ok: false, fields };
  return {
    ok: true,
    data: {
      full_name: normalizeName(input.full_name),
      email: normalizeEmail(input.email),
      whatsapp: whatsapp as string,
      consent: true,
    },
  };
}

/** Formato visual mientras se escribe: 55 1234 5678 (México y 10 dígitos). */
export function formatNational(digits: string, countryCode: string): string {
  const d = digits.slice(0, 15);
  if (countryCode === '52' || countryCode === '57') {
    return [d.slice(0, 2), d.slice(2, 6), d.slice(6, 10)].filter(Boolean).join(' ');
  }
  if (countryCode === '1') return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(' ');
  if (countryCode === '34') return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(' ');
  return d.replace(/(\d{3})(?=\d)/g, '$1 ');
}
