// Cálculos del ciclo a partir de tus registros.
// Son estimaciones: no sirven como método anticonceptivo ni como diagnóstico.
import { addDays, diffDays, dayKey } from './ui.js';

const average = (list) => list.reduce((a, b) => a + b, 0) / list.length;

export function sortPeriods(periods) {
  return [...periods].sort((a, b) => a.start.localeCompare(b.start));
}

export function cycleStats(periods) {
  const sorted = sortPeriods(periods);
  const lengths = [];
  for (let i = 1; i < sorted.length; i++) {
    const days = diffDays(sorted[i - 1].start, sorted[i].start);
    if (days >= 15 && days <= 60) lengths.push(days);
  }
  const periodLengths = sorted
    .filter((p) => p.end)
    .map((p) => diffDays(p.start, p.end) + 1)
    .filter((n) => n > 0 && n < 15);
  const recent = lengths.slice(-6);
  return {
    cycleLength: recent.length ? Math.round(average(recent)) : 28,
    periodLength: periodLengths.length ? Math.round(average(periodLengths.slice(-6))) : 5,
    lengths,
    measured: recent.length > 0,
  };
}

export function phaseOf(day, stats) {
  const ovulation = stats.cycleLength - 14;
  if (day <= stats.periodLength) return 'Menstrual';
  if (day < ovulation - 2) return 'Folicular';
  if (day <= ovulation + 1) return 'Ovulatoria';
  return 'Lútea';
}

export const PHASE_COLORS = {
  Menstrual: '#C8693F',
  Folicular: '#B5C3A3',
  Ovulatoria: '#647659',
  Lútea: '#B99375',
};

export function cycleToday(periods, today = dayKey()) {
  const sorted = sortPeriods(periods).filter((p) => p.start <= today);
  const last = sorted[sorted.length - 1];
  if (!last) return null;
  const stats = cycleStats(sorted);
  const day = diffDays(last.start, today) + 1;
  const open = !last.end;
  const onPeriod = open ? day <= 10 : today <= last.end;
  // Si el periodo ya terminó, aunque sea antes del promedio, ya no es fase menstrual.
  const estimated = phaseOf(day, stats);
  const phase = onPeriod ? 'Menstrual' : estimated === 'Menstrual' ? 'Folicular' : estimated;
  const next = addDays(last.start, stats.cycleLength);
  return { ...stats, day, phase, last, open, onPeriod, next, daysToNext: diffDays(today, next) };
}

// Compara tu energía de los 5 días previos al periodo con el resto del ciclo.
export function energyTrend(periods, checkins) {
  const sorted = sortPeriods(periods);
  let cycles = 0;
  const before = [];
  const rest = [];
  for (let i = 1; i < sorted.length; i++) {
    const start = sorted[i - 1].start;
    const end = sorted[i].start;
    const length = diffDays(start, end);
    if (length < 15 || length > 60) continue;
    const pre = [];
    const other = [];
    for (let d = 0; d < length; d++) {
      const key = addDays(start, d);
      const energy = checkins[key]?.energy;
      if (!energy) continue;
      (d >= length - 5 ? pre : other).push(energy);
    }
    if (pre.length >= 2 && other.length >= 3) {
      cycles++;
      before.push(...pre);
      rest.push(...other);
    }
  }
  if (cycles < 2) return null;
  const diff = average(before) - average(rest);
  if (diff <= -0.4) return `Durante tus últimos ${cycles} ciclos registraste menos energía en los días previos a tu periodo.`;
  if (diff >= 0.4) return `Durante tus últimos ${cycles} ciclos registraste más energía en los días previos a tu periodo.`;
  return `En tus últimos ${cycles} ciclos tu energía antes del periodo se mantuvo parecida al resto del mes.`;
}
