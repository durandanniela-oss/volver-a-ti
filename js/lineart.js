// Dibujos de una sola línea para las cartas (estilo de las ilustraciones de Astroflow).
const wrap = (body, size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ART = {
  // Dos anillos entrelazados y una estrella pequeña
  amor: '<circle cx="40" cy="55" r="20"/><circle cx="60" cy="55" r="20"/><path d="M50 18v8M46 22h8"/><path d="M28 86c8-4 36-4 44 0"/>',
  // Escalones que suben hacia un sol
  trabajo: '<path d="M18 82h16V68h16V54h16V40h16"/><circle cx="74" cy="24" r="7"/><path d="M74 12v-3M86 24h3M65 15l-2-2M83 15l2-2"/>',
  // Casa con puerta en arco y una luna
  hogar: '<path d="M24 82V48l26-22 26 22v34z"/><path d="M42 82V66a8 8 0 0 1 16 0v16"/><path d="M72 20a7 7 0 1 0 6 10 6 6 0 0 1-6-10z"/>',
  // Tres círculos que se cruzan
  social: '<circle cx="50" cy="38" r="16"/><circle cx="38" cy="60" r="16"/><circle cx="62" cy="60" r="16"/>',
  // Un sol con rayos largos
  identidad: '<circle cx="50" cy="50" r="12"/><circle cx="50" cy="50" r="2"/><path d="M50 18v14M50 68v14M18 50h14M68 50h14M27 27l10 10M63 63l10 10M73 27L63 37M37 63L27 73"/>',
  // Una espiral
  creatividad: '<path d="M50 50c0-3 4-4 6-2 4 3 2 10-4 11-8 1-13-6-11-13 3-10 15-13 23-7 10 7 9 23-2 30-13 8-31 3-36-11-6-17 7-35 25-36"/>',
  // Una flor de loto
  autocuidado: '<path d="M50 74c-6-10-6-26 0-38 6 12 6 28 0 38z"/><path d="M50 74c-14-4-22-16-22-28 10 2 18 10 22 28z"/><path d="M50 74c14-4 22-16 22-28-10 2-18 10-22 28z"/><path d="M26 80c16 4 32 4 48 0"/>',
  // Adorno: sol pequeño
  sol: '<circle cx="50" cy="50" r="10"/><path d="M50 30v8M50 62v8M30 50h8M62 50h8M36 36l5 5M59 59l5 5M64 36l-5 5M41 59l-5 5"/>',
};

export const lineArt = (name, size = 96) => wrap(ART[name] || ART.sol, size);

// Reverso de las cartas: sol y luna entrelazados con un marco fino.
export const cardBack = (size = 120) => wrap(
  '<rect x="8" y="8" width="84" height="84" rx="10"/><circle cx="50" cy="50" r="18"/><path d="M58 38a14 14 0 1 0 0 24 11 11 0 0 1 0-24z"/>' +
  '<path d="M50 20v8M50 72v8M20 50h8M72 50h8"/><circle cx="50" cy="50" r="30" stroke-dasharray="1 5"/>',
  size,
);
