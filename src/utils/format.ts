const numberFormatter = new Intl.NumberFormat();

export function formatNumber(v: number): string {
  return numberFormatter.format(v);
}

export function formatDate(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const hasTime = v.includes('T');
  return hasTime
    ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86400000],
  ['month', 30 * 86400000],
  ['week', 7 * 86400000],
  ['day', 86400000],
  ['hour', 3600000],
  ['minute', 60000],
];

export function relativeTime(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const diff = d.getTime() - Date.now();
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return rtf.format(Math.round(diff / 1000), 'second');
}
