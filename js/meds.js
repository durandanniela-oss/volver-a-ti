// Cálculos de medicamentos y dosis. La app solo registra lo que te indicó tu médico:
// no sugiere, cambia ni relaciona dosis con síntomas.
import { addDays, dayKey, diffDays } from './ui.js';

export const doseKey = (date, medId, time) => `${date}|${medId}|${time}`;

export function scheduledFor(meds, date) {
  const list = [];
  for (const med of meds) {
    if (!med.active || med.frequency !== 'Diario') continue;
    if (med.startDate && date < med.startDate) continue;
    for (const time of med.times || []) list.push({ med, time, key: doseKey(date, med.id, time) });
  }
  return list.sort((a, b) => a.time.localeCompare(b.time));
}

export function adherence(meds, doses, from, to = dayKey()) {
  let scheduled = 0;
  let taken = 0;
  const today = dayKey();
  const d = new Date();
  const nowTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  for (let i = 0; i <= diffDays(from, to); i++) {
    const date = addDays(from, i);
    for (const dose of scheduledFor(meds, date)) {
      // Las dosis de hoy que aún no tocan no cuentan como pendientes.
      if (date === today && dose.time > nowTime && !doses[dose.key]) continue;
      scheduled++;
      if (doses[dose.key]?.status === 'taken') taken++;
    }
  }
  return { scheduled, taken };
}

export function perMedAdherence(med, doses, from, to = dayKey()) {
  return adherence([med], doses, from, to);
}

export function asNeededCount(med, doses, from, to = dayKey()) {
  return Object.entries(doses).filter(([key, value]) => {
    const [date, medId] = key.split('|');
    return medId === med.id && value.status === 'taken' && date >= from && date <= to;
  }).length;
}
