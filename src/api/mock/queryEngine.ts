import type { CatalogColumn } from '@/types/catalog';
import type { ReportDefinition, ReportFilter, ApiError } from '@/types/report';
import { safeString } from '@/utils/safeString';

export class QueryEngineError extends Error {
  apiError: ApiError;
  constructor(apiError: ApiError) {
    super(apiError.message);
    this.apiError = apiError;
  }
}

function resolveValue(value: unknown, params: Record<string, unknown>): unknown {
  if (typeof value === 'string' && value.startsWith('$')) {
    const key = value.slice(1);
    if (!(key in params)) {
      throw new QueryEngineError({
        code: 'MISSING_PARAMETER',
        message: `Parameter "${key}" is required but was not provided.`,
        field: key,
        hint: 'Provide a value for this parameter or set a default in the report definition.',
      });
    }
    return params[key];
  }
  return value;
}

function relativeRange(preset: string): [number, number] {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const endOfToday = startOfDay(now) + 86400000 - 1;

  switch (preset) {
    case 'last7days':
      return [startOfDay(now) - 6 * 86400000, endOfToday];
    case 'last30days':
      return [startOfDay(now) - 29 * 86400000, endOfToday];
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return [start, endOfToday];
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      const end = new Date(now.getFullYear(), now.getMonth(), 1).getTime() - 1;
      return [start, end];
    }
    case 'thisQuarter': {
      const q = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1).getTime();
      return [start, endOfToday];
    }
    default:
      throw new QueryEngineError({
        code: 'INVALID_FILTER_OP',
        message: `Unknown relative range preset "${preset}".`,
        hint: 'Use one of last7days, last30days, thisMonth, lastMonth, thisQuarter.',
      });
  }
}

function toComparable(v: unknown, type: CatalogColumn['type']): number | string | boolean | null {
  if (v === null || v === undefined) return null;
  if (type === 'date' || type === 'timestamp') return new Date(v as string).getTime();
  if (type === 'number' || type === 'geo') return v as number;
  if (type === 'boolean') return v as boolean;
  return safeString(v).toLowerCase();
}

function evaluateFilter(
  row: Record<string, unknown>,
  filter: ReportFilter,
  column: CatalogColumn | undefined,
  params: Record<string, unknown>,
): boolean {
  const type = column?.type ?? 'unknown';
  const rowValue = row[filter.field];
  const filterValue = resolveValue(filter.value, params);

  switch (filter.op) {
    case 'exists':
      return (rowValue !== null && rowValue !== undefined) === Boolean(filterValue);
    case 'eq':
      return toComparable(rowValue, type) === toComparable(filterValue, type);
    case 'ne':
      return toComparable(rowValue, type) !== toComparable(filterValue, type);
    case 'in': {
      const arr = Array.isArray(filterValue) ? filterValue : [filterValue];
      if (arr.length === 0) return true;
      return arr.some((v) => toComparable(rowValue, type) === toComparable(v, type));
    }
    case 'nin': {
      const arr = Array.isArray(filterValue) ? filterValue : [filterValue];
      if (arr.length === 0) return true;
      return !arr.some((v) => toComparable(rowValue, type) === toComparable(v, type));
    }
    case 'contains':
      if (!filterValue) return true;
      return safeString(rowValue).toLowerCase().includes(safeString(filterValue).toLowerCase());
    case 'startsWith':
      if (!filterValue) return true;
      return safeString(rowValue).toLowerCase().startsWith(safeString(filterValue).toLowerCase());
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte': {
      const a = toComparable(rowValue, type);
      const b = toComparable(filterValue, type);
      if (a === null || b === null || typeof a === 'boolean' || typeof b === 'boolean') return false;
      if (filter.op === 'gt') return a > b;
      if (filter.op === 'gte') return a >= b;
      if (filter.op === 'lt') return a < b;
      return a <= b;
    }
    case 'between': {
      const [lo, hi] = filterValue as [unknown, unknown];
      const a = toComparable(rowValue, type);
      if (a === null || typeof a === 'boolean') return false;
      const loC = toComparable(lo, type);
      const hiC = toComparable(hi, type);
      if (typeof loC === 'boolean' || typeof hiC === 'boolean') return false;
      if (loC !== null && a < loC) return false;
      if (hiC !== null && a > hiC) return false;
      return true;
    }
    case 'relative': {
      const [lo, hi] = relativeRange(safeString(filterValue));
      const a = toComparable(rowValue, type);
      if (typeof a !== 'number') return false;
      return a >= lo && a <= hi;
    }
    default:
      throw new QueryEngineError({
        code: 'INVALID_FILTER_OP',
        message: `Unsupported filter operator "${String(filter.op)}".`,
        field: filter.field,
        hint: 'Choose a filter operator supported by this column type.',
      });
  }
}

export function runQueryEngine(
  allRows: Record<string, unknown>[],
  columns: CatalogColumn[],
  def: ReportDefinition,
  params: Record<string, unknown>,
): { rows: Record<string, unknown>[]; truncated: boolean } {
  const columnByName = new Map(columns.map((c) => [c.name, c]));

  for (const filter of def.filters) {
    if (!columnByName.has(filter.field)) {
      throw new QueryEngineError({
        code: 'UNKNOWN_FIELD',
        message: `Filter references unknown field "${filter.field}".`,
        field: filter.field,
        hint: 'Remove or update this filter — the field is not part of the selected dataset.',
      });
    }
  }

  let rows = allRows.filter((row) =>
    def.filters.every((f) => evaluateFilter(row, f, columnByName.get(f.field), params)),
  );

  if (def.sort.length) {
    const sorts = def.sort;
    rows = [...rows].sort((a, b) => {
      for (const s of sorts) {
        const type = columnByName.get(s.field)?.type ?? 'unknown';
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

  const truncated = rows.length > def.limit;
  const limited = rows.slice(0, def.limit);
  return { rows: limited, truncated };
}
