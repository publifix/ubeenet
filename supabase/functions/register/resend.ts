// Envío por la API de Resend. Lo usan `register` y `reminder`.
const env = (k: string) => Deno.env.get(k)?.trim() || '';

/** idempotencyKey: Resend ignora un segundo envío con la misma clave durante 24 h. */
export async function sendEmail(payload: Record<string, unknown>, idempotencyKey?: string): Promise<boolean> {
  const key = env('RESEND_API_KEY');
  if (!key) {
    console.error('RESEND_API_KEY no configurada');
    return false;
  }
  const headers: Record<string, string> = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify({ from: env('RESEND_FROM') || 'Ubeenet Eventos <onboarding@resend.dev>', ...payload }),
    });
    if (!res.ok) console.error('resend', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error('resend', err);
    return false;
  }
}
