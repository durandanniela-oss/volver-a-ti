// Recordatorios como eventos diarios en el Calendario de Apple (archivo .ics).
// Una web app no puede mandar notificaciones en iPhone; el Calendario sí avisa,
// también en el Apple Watch.
import { dayKey } from './ui.js';

const pad = (n) => String(n).padStart(2, '0');

function stamp(date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

// Texto del calendario: escapa caracteres especiales del formato .ics.
const text = (value) => String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

function event({ id, time, title, description }) {
  const [h, m] = time.split(':');
  const start = `${dayKey().replace(/-/g, '')}T${h}${m}00`;
  return [
    'BEGIN:VEVENT',
    `UID:${id}@volver-a-ti`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${start}`,
    'DURATION:PT5M',
    'RRULE:FREQ=DAILY',
    `SUMMARY:${text(title)}`,
    `DESCRIPTION:${text(description)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${text(title)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
  ];
}

export function buildCalendar({ checkinTime, eveningTime, meds, includeMeds, showNames }) {
  const events = [];
  if (checkinTime) {
    events.push(event({ id: 'checkin', time: checkinTime, title: 'Volver a ti · Check-in', description: '¿Cómo te sientes hoy? Abre Volver a ti para tu check-in.' }));
  }
  if (eveningTime) {
    events.push(event({ id: 'cierre', time: eveningTime, title: 'Volver a ti · Cierre del día', description: 'Tres preguntas cortas para cerrar el día con calma.' }));
  }
  if (includeMeds) {
    // Una alerta por horario. Sin nombres por defecto, para más privacidad.
    const byTime = {};
    for (const med of meds.filter((m) => m.active && m.frequency === 'Diario')) {
      for (const time of med.times || []) (byTime[time] ||= []).push(med.name);
    }
    for (const [time, names] of Object.entries(byTime).sort()) {
      const title = showNames ? `Volver a ti · ${names.join(', ')}` : `Volver a ti · Toma de las ${time}`;
      events.push(event({ id: `toma-${time.replace(':', '')}`, time, title, description: 'Marca tu toma en Volver a ti.' }));
    }
  }
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Volver a ti//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Volver a ti', ...events.flat(), 'END:VCALENDAR'].join('\r\n');
}
