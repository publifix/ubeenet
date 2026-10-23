// ÚNICA fuente de nombre, fecha, sede y textos del evento.
// TODO: nombre definitivo del evento y textos finales del cliente.

const venueAddress = 'Campos Elíseos 361, Polanco III Secc., Miguel Hidalgo, 11540, Ciudad de México';

export const event = {
  name: 'Ubeenet Connect 2026',
  slug: 'ubeenet-connect-2026',
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
  startUtc: '2026-11-29T23:45:00Z',
  endUtc: '2026-11-30T04:00:00Z',
  startLocalIso: '2026-11-29T17:45:00-06:00',
  endLocalIso: '2026-11-29T22:00:00-06:00',
  timeZone: 'America/Mexico_City',
  dateLong: 'Domingo 29 de noviembre de 2026',
  dateShort: 'Dom 29 nov',
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
    title: 'Ubeenet Connect 2026 · Registro',
    description:
      'Una noche con Ubeenet y sus partners para hablar de nube, redes y seguridad. 29 de noviembre de 2026, Hotel Campos Polanco, CDMX.',
  },
  hero: {
    title: 'Ubeenet Connect 2026',
    subtitle:
      'Una noche para conectar con quienes construyen la nube, la red y la seguridad de las empresas en México.',
  },
  form: {
    title: 'Reserva tu lugar',
    help: 'Te enviaremos la confirmación a tu correo.',
    labels: { name: 'Nombre completo', email: 'Correo electrónico', whatsapp: 'WhatsApp', countryCode: 'Lada' },
    placeholders: { name: 'Ana López Martínez', email: 'ana@empresa.com', whatsapp: '55 1234 5678' },
    consentBefore: 'Acepto el',
    consentLink: 'aviso de privacidad',
    consentAfter: 'y que Ubeenet me contacte sobre este evento.',
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
      consent: 'Para continuar, acepta el aviso de privacidad.',
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
        text: 'Una noche con el equipo de Ubeenet, sus partners y otros líderes de TI.',
      },
    ],
  },
  agenda: {
    title: 'Agenda',
    items: [
      { time: '5:45 pm', iso: '17:45', title: 'Registro y bienvenida' },
      { time: '6:30 pm', iso: '18:30', title: 'Keynote: el estado del MultiCloud en México' },
      { time: '7:15 pm', iso: '19:15', title: 'Panel con partners' },
      { time: '8:00 pm', iso: '20:00', title: 'Demostraciones en vivo' },
      { time: '8:45 pm', iso: '20:45', title: 'Cena y networking' },
      { time: '10:00 pm', iso: '22:00', title: 'Cierre' },
    ],
  },
  venueSection: {
    mapsLabel: 'Abrir en Google Maps',
    wazeLabel: 'Abrir en Waze',
  },
  partners: {
    title: 'Partners',
    // TODO: confirmar cuáles participan en el evento y reemplazar por logos monocromos.
    items: ['AWS', 'Microsoft Azure', 'Oracle', 'VMware', 'Cisco', 'Aviatrix', 'Palo Alto Networks', 'Veeam', 'ExaGrid', 'Pure Storage'],
  },
  faq: {
    title: 'Preguntas frecuentes',
    items: [
      { q: '¿Tiene costo?', a: 'No. El evento es sin costo, pero el cupo es limitado y requiere registro.' },
      { q: '¿Puedo llevar a alguien de mi equipo?', a: 'Cada persona debe registrarse con su propio correo.' },
      { q: '¿Cuál es el código de vestimenta?', a: 'Business casual.' },
      { q: '¿Hay estacionamiento?', a: 'Sí, el hotel cuenta con valet parking.' },
      { q: '¿A quién contacto si tengo dudas?', a: 'Escríbenos a sales@ubeenet.com o al +52 55 3074 6052.' },
    ],
  },
  finalCta: { title: 'Nos vemos el 29 de noviembre', button: 'Reservar lugar' },
  footer: { credit: 'Desarrollado por Blanco Nuclear' },
  ics: {
    uid: 'ubeenet-connect-2026@ubeenet.com',
    prodId: '-//Ubeenet//Connect 2026//ES',
    location: 'Hotel Campos Polanco, Campos Elíseos 361, Polanco III Secc., Miguel Hidalgo, 11540 CDMX',
    description: 'Tu registro está confirmado. Dudas: sales@ubeenet.com',
    filename: 'ubeenet-connect-2026.ics',
  },
} as const;

export type EventConfig = typeof event;
