import type { ApiError } from './report';
import type { ColumnType } from './catalog';

export type PreviewState = 'empty-unconfigured' | 'loading' | 'error' | 'empty-no-results' | 'ready';

export interface PreviewMeta {
  rowCount: number;
  truncated: boolean;
  cached: boolean;
  durationMs: number;
  limit: number;
}

export interface VizProps {
  state: PreviewState;
  rows: Record<string, unknown>[];
  columns: { name: string; label: string; type: ColumnType }[];
  meta?: PreviewMeta | undefined;
  error?: ApiError | undefined;
}
