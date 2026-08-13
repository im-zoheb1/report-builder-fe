import type { ColumnType } from './catalog';

export type Visualization = 'table';

export type FilterOp =
  | 'eq'
  | 'ne'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'relative'
  | 'exists';

export interface ReportFilter {
  id: string;
  field: string;
  op: FilterOp;
  value: unknown;
}

export interface ReportSort {
  field: string;
  dir: 'asc' | 'desc';
}

export interface ReportParameter {
  key: string;
  type: ColumnType;
  default: unknown;
}

export interface ReportDefinition {
  dataset: string;
  visualization: Visualization;
  columns: string[];
  filters: ReportFilter[];
  sort: ReportSort[];
  limit: number;
  parameters?: ReportParameter[];
}

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  definition: ReportDefinition;
  createdAt: string;
  updatedAt: string;
}

export interface QueryResultColumn {
  name: string;
  label: string;
  type: ColumnType;
}

export interface QueryResultMeta {
  rowCount: number;
  truncated: boolean;
  cached: boolean;
  durationMs: number;
}

export interface QueryResult {
  rows: Record<string, unknown>[];
  columns: QueryResultColumn[];
  meta: QueryResultMeta;
  warnings?: string[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  hint?: string;
}
