import type { CatalogColumn, ColumnType } from '@/types/catalog';
import { safeString } from '@/utils/safeString';

export function deriveCapabilities(col: { type: ColumnType; cardinality?: number }): CatalogColumn['capabilities'] {
  switch (col.type) {
    case 'string': {
      const lowCardinality = (col.cardinality ?? Infinity) <= 50;
      const capabilities: CatalogColumn['capabilities'] = {
        selectable: true,
        groupable: lowCardinality,
        aggregations: ['count'],
        filterUi: lowCardinality ? 'multiSelect' : 'textContains',
      };
      if (lowCardinality) capabilities.chartRole = 'dimension';
      return capabilities;
    }
    case 'number':
      return {
        selectable: true,
        groupable: false,
        aggregations: ['sum', 'avg', 'min', 'max', 'count'],
        filterUi: 'numberRange',
        chartRole: 'measure',
      };
    case 'date':
    case 'timestamp':
      return {
        selectable: true,
        groupable: true,
        aggregations: ['count', 'min', 'max'],
        filterUi: 'dateRange',
        chartRole: 'dimension',
      };
    case 'boolean':
      return {
        selectable: true,
        groupable: true,
        aggregations: ['count'],
        filterUi: 'booleanToggle',
        chartRole: 'dimension',
      };
    case 'geo':
      return {
        selectable: true,
        groupable: false,
        aggregations: ['count'],
        filterUi: 'none',
        mapRole: 'marker',
      };
    default:
      return {
        selectable: true,
        groupable: false,
        aggregations: [],
        filterUi: 'none',
      };
  }
}

interface ColumnDecl {
  name: string;
  label: string;
  type: ColumnType;
}

export function buildCatalogColumns(decls: ColumnDecl[], rows: Record<string, unknown>[]): CatalogColumn[] {
  return decls.map((decl) => {
    const values = rows.map((r) => r[decl.name]);
    const nonNull = values.filter((v) => v !== null && v !== undefined);
    const nullable = nonNull.length < values.length;

    let cardinality: number | undefined;
    let sampleValues: string[] | undefined;
    let stats: CatalogColumn['stats'];

    if (decl.type === 'string' || decl.type === 'boolean') {
      const distinct = new Set(nonNull.map((v) => safeString(v)));
      cardinality = distinct.size;
      sampleValues = Array.from(distinct).slice(0, 10);
    } else if (decl.type === 'number') {
      const nums = nonNull.map((v) => v as number);
      if (nums.length) {
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const avg = nums.reduce((s, n) => s + n, 0) / nums.length;
        stats = { min: round2(min), max: round2(max), avg: round2(avg) };
      }
    } else if (decl.type === 'date' || decl.type === 'timestamp') {
      const dates = nonNull.map((v) => new Date(v as string).getTime());
      if (dates.length) {
        stats = { min: Math.min(...dates), max: Math.max(...dates) };
      }
    }

    const capabilities = deriveCapabilities(
      cardinality !== undefined ? { type: decl.type, cardinality } : { type: decl.type },
    );

    const col: CatalogColumn = {
      name: decl.name,
      label: decl.label,
      type: decl.type,
      nullable,
      capabilities,
    };
    if (cardinality !== undefined) col.cardinality = cardinality;
    if (sampleValues !== undefined) col.sampleValues = sampleValues;
    if (stats !== undefined) col.stats = stats;
    return col;
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
