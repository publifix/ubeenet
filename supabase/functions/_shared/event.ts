// ARCHIVO GENERADO por scripts/sync-shared.mjs — edita el original en src/.
// ÚNICA fuente de nombre, fecha, sede y textos del evento.
// El evento no tiene nombre propio: es el evento de networking de Ubeenet.

const venueAddress = 'Campos Elíseos 361, Polanco III Secc., Miguel Hidalgo, 11540, Ciudad de México';

export const event = {
  name: 'Evento de networking Ubeenet',
  // Para usar a media frase: "te registraste en …".
  nameInSentence: 'el evento de networking de Ubeenet',
  slug: 'ubeenet-networking-2026',
  organizer: {
    name: 'Ubeenet S.A. de C.V.',
    shortName: 'Ubeenet',
    url: 'https://www.ubeenet.com',
    email: 'sales@ubeenet.com',
    phone: '+52 55 3074 6052',
    phoneHref: 'tel:+525530746052',
    // TODO: confirmar URLs oficiales de redes sociales.
    linkedin: 'https://www.linkedin.com/company/ubeenet/',
    facebook: 'https://www.facebook.com/ubeenet/',
  },
  // Horario de CDMX (UTC−6, sin horario de verano).
  startUtc: '2026-11-26T23:45:00Z',
  endUtc: '2026-11-27T04:00:00Z',
  startLocalIso: '2026-11-26T17:45:00-06:00',
  endLocalIso: '2026-11-26T22:00:00-06:00',
  timeZone: 'America/Mexico_City',
  dateLong: 'Jueves 26 de noviembre de 2026',
  dateShort: 'Jue 26 nov',
  timeRange: '5:45 pm a 10:00 pm',
  startTime: '5:45 pm',
  venue: {
    name: 'Hotel Campos Polanco',
    city: 'CDMX',
    address: venueAddress,
    street: 'Campos Elíseos 361, Polanco III Secc.',
    locality: 'Miguel Hidalgo',
    region: 'Ciudad de México',
    postalCode: '11540',
    country: 'MX',
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Hotel Campos Polanco, ' + venueAddress)}`,
    wazeUrl: `https://waze.com/ul?q=${encodeURIComponent('Hotel Campos Polanco, Campos Elíseos 361, Polanco, CDMX')}&navigate=yes`,
    // TODO: confirmar valet parking con el hotel.
    note: 'Contaremos con servicio de valet parking.',
  },
  meta: {
    title: 'Conectemos hoy · Ubeenet · 26 de noviembre de 2026',
    description:
      'Regístrate y acompáñanos en una tarde para compartir ideas, fortalecer relaciones y descubrir nuevas oportunidades de negocios. Jueves 26 de noviembre de 2026, Hotel Campos Polanco, CDMX.',
  },
  hero: {
    // Cada frase va en su propia línea; el contraste de pesos (700/300) viene de la invitación.
    title: [
      { text: 'Conectemos hoy.', weight: 700 },
      { text: 'Creemos nuevas oportunidades juntos.', weight: 300 },
    ],
    subtitle:
      'Regístrate y acompáñanos en una tarde para compartir ideas, fortalecer relaciones y descubrir nuevas oportunidades de negocios.',
    day: 'Jueves',
    date: '26 de noviembre',
  },
  form: {
    title: 'Reserva tu lugar',
    help: 'Te enviaremos la confirmación a tu correo.',
    labels: { name: 'Nombre completo', email: 'Correo electrónico', whatsapp: 'WhatsApp', countryCode: 'Lada' },
    placeholders: { name: 'Ana López Martínez', email: 'ana@empresa.com', whatsapp: '55 1234 5678' },
    privacyNote: 'Usaremos tus datos solo para este evento.',
    privacyLink: 'Aviso de privacidad',
    submit: 'Reservar lugar',
    submitting: 'Reservando…',
    note: 'Cupo limitado. Evento sin costo, solo con registro.',
    successTitle: 'Tu lugar está reservado',
    successText: 'Te enviamos la confirmación a {email}. Guarda la fecha en tu calendario.',
    googleCalendar: 'Agregar a Google Calendar',
    icsDownload: 'Descargar para Outlook / Apple (.ics)',
    duplicate:
      'Este correo ya tiene un lugar reservado. Revisa tu bandeja de entrada o escríbenos a sales@ubeenet.com.',
    errors: {
      name: 'Escribe tu nombre y al menos un apellido.',
      email: 'Revisa el correo; parece incompleto.',
      whatsapp: 'El WhatsApp debe tener 10 dígitos.',
      whatsappOther: 'Revisa el número; incluye lada y número completo.',
      general: 'No pudimos guardar tu registro. Revisa tu conexión e inténtalo de nuevo.',
      captcha: 'Confirma que no eres un robot e inténtalo de nuevo.',
    },
    // Visible solo en desarrollo o con PUBLIC_SHOW_SETUP_NOTICE=true / ?setup=1.
    notEnabled: 'Registro aún no habilitado: falta configurar PUBLIC_REGISTER_ENDPOINT. En desarrollo las respuestas se simulan (?mock=duplicate, ?mock=error).',
    // Lo que ve el invitado si envía el formulario antes de que exista el endpoint.
    notEnabledPublic: 'El registro abrirá en unos días. Mientras tanto, escríbenos a sales@ubeenet.com para apartar tu lugar.',
    fixFields: 'Revisa los campos marcados.',
    otherCode: 'Lada',
  },
  themes: {
    title: 'Qué vas a vivir',
    items: [
      {
        title: 'MultiCloud sin fricción',
        text: 'Cómo mover aplicaciones y datos entre nubes cuando tiene sentido para el negocio, no cuando lo exige el proveedor.',
      },
      {
        title: 'Una red que se defiende sola',
        text: 'Networking y seguridad nativos de la nube: de monitorear incidentes a prevenirlos con automatización.',
      },
      {
        title: 'Conversaciones que no caben en una llamada',
        text: 'Una tarde con el equipo de Ubeenet, sus partners y otros líderes de TI.',
      },
    ],
  },
  venueSection: {
    mapsLabel: 'Abrir en Google Maps',
    wazeLabel: 'Abrir en Waze',
    photoAlt: 'Patio del Hotel Campos Polanco de noche: mesas de madera, sillas tejidas, plantas y lámparas colgantes frente a un muro de ladrillo iluminado.',
  },
  partners: {
    title: 'Partners',
    // Sección oculta (src/components/Partners.astro no se usa en index) hasta confirmar participantes.
    // TODO: confirmar cuáles participan en el evento y reemplazar por logos monocromos.
    items: ['AWS', 'Microsoft Azure', 'Oracle', 'VMware', 'Cisco', 'Aviatrix', 'Palo Alto Networks', 'Veeam', 'ExaGrid', 'Pure Storage'],
  },
  faq: {
    title: 'Preguntas frecuentes',
    items: [
      { q: '¿Tiene costo?', a: 'No. El evento es sin costo, pero el cupo es limitado y requiere registro.' },
      { q: '¿Puedo llevar a alguien de mi equipo?', a: 'Cada persona debe registrarse con su propio correo.' },
      { q: '¿Cuál es el código de vestimenta?', a: 'Business casual.' },
      { q: '¿Habrá alimentos y bebidas?', a: 'Sí. Durante el cóctel habrá canapés, vinos y cervezas.' },
      { q: '¿Hay estacionamiento?', a: 'Sí, el hotel cuenta con valet parking.' },
      { q: '¿A quién contacto si tengo dudas?', a: 'Escríbenos a sales@ubeenet.com o al +52 55 3074 6052.' },
    ],
  },
  privacy: {
    title: 'Aviso de privacidad',
    updated: '28 de octubre de 2026',
    intro:
      'Ubeenet S.A. de C.V. (“Ubeenet”) es responsable del tratamiento de los datos personales que nos proporcionas al registrarte en el evento de networking de Ubeenet, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
    sections: [
      {
        title: 'Datos que recabamos',
        text: [
          'Nombre completo, correo electrónico y número de WhatsApp. No solicitamos datos personales sensibles.',
          'De forma técnica también registramos la página desde la que llegaste y, si existen, los parámetros de la campaña (por ejemplo, el anuncio o correo que te trajo al sitio).',
        ],
      },
      {
        title: 'Para qué usamos tus datos',
        text: [
          'Únicamente para registrar tu asistencia, enviarte la confirmación, el recordatorio y la información logística del evento, y para identificarte en el acceso el día del evento.',
          'No usamos tus datos para otros fines, no los vendemos y no te suscribimos a listas de correo.',
        ],
      },
      {
        title: 'Con quién los compartimos',
        text: [
          'No transferimos tus datos a terceros. Solo los tratan, por cuenta de Ubeenet, el equipo organizador del evento y los proveedores tecnológicos que alojan la base de registros y envían los correos, exclusivamente para las finalidades de este aviso.',
        ],
      },
      {
        title: 'Cuánto tiempo los conservamos',
        text: ['Solo el tiempo necesario para organizar el evento y darle seguimiento; después los eliminamos.'],
      },
      {
        title: 'Tus derechos',
        text: [
          'Puedes acceder a tus datos, corregirlos, pedir que los eliminemos, oponerte a su uso o revocar tu consentimiento en cualquier momento. Escríbenos a sales@ubeenet.com con el asunto “Datos personales · evento de networking”, indicando tu nombre, el correo con el que te registraste y lo que solicitas. Te responderemos por el mismo medio dentro de los plazos que establece la ley.',
          'También puedes solicitar en ese correo el aviso de privacidad integral de Ubeenet.',
        ],
      },
      {
        title: 'Cambios a este aviso',
        text: ['Cualquier cambio se publicará en esta misma página.'],
      },
    ],
  },
  finalCta: { title: 'Nos vemos el 26 de noviembre', button: 'Reservar lugar' },
  footer: { credit: 'Desarrollado por Blanco Nuclear' },
  ics: {
    uid: 'ubeenet-networking-2026@ubeenet.com',
    prodId: '-//Ubeenet//Networking 2026//ES',
    location: 'Hotel Campos Polanco, Campos Elíseos 361, Polanco III Secc., Miguel Hidalgo, 11540 CDMX',
    description: 'Tu registro está confirmado. Llega desde las 5:45 pm para tu registro de acceso. Dudas: sales@ubeenet.com · +52 55 3074 6052',
    filename: 'ubeenet-networking-2026.ics',
  },
} as const;

export type EventConfig = typeof event;
