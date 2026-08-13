import type { ColumnType } from '@/types/catalog';
import type { ReportSort } from '@/types/report';
import { safeString } from './safeString';

function toComparable(v: unknown, type: ColumnType): number | string | boolean | null {
  if (v === null || v === undefined) return null;
  if (type === 'date' || type === 'timestamp') return new Date(v as string).getTime();
  if (type === 'number' || type === 'geo') return v as number;
  if (type === 'boolean') return v as boolean;
  return safeString(v).toLowerCase();
}

export function sortRows(
  rows: Record<string, unknown>[],
  sort: ReportSort[],
  typeByField: Map<string, ColumnType>,
): Record<string, unknown>[] {
  if (!sort.length) return rows;
  return [...rows].sort((a, b) => {
    for (const s of sort) {
      const type = typeByField.get(s.field) ?? 'unknown';
      const av = toComparable(a[s.field], type);
      const bv = toComparable(b[s.field], type);
      let cmp = 0;
      if (av === null && bv === null) cmp = 0;
      else if (av === null) cmp = 1;
      else if (bv === null) cmp = -1;
      else if (av < bv) cmp = -1;
      else if (av > bv) cmp = 1;
      if (cmp !== 0) return s.dir === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
}
