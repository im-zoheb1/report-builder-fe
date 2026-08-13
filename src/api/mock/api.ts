import type { CatalogDataset } from '@/types/catalog';
import type { ReportDefinition, SavedReport, QueryResult } from '@/types/report';
import { MOCK_CATALOG, MOCK_ROWS } from './data';
import { runQueryEngine, QueryEngineError } from './queryEngine';
import { delay, maybeThrow, MockApiError } from './errors';
import { storageListReports, storageGetReport, storageSaveReport, storageDeleteReport } from './storage';
import { csvEscape } from './csv';
import { safeString } from '@/utils/safeString';

function findDataset(name: string): CatalogDataset {
  const ds = MOCK_CATALOG.find((d) => d.name === name);
  if (!ds) {
    throw new MockApiError({
      code: 'UNKNOWN_DATASET',
      message: `Dataset "${name}" does not exist.`,
      hint: 'Pick a dataset from the catalog.',
    });
  }
  return ds;
}

interface CacheEntry {
  at: number;
  result: QueryResult;
}
const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30000;

function cacheKey(def: ReportDefinition, params: Record<string, unknown>): string {
  return JSON.stringify({ def, params });
}

export async function listDatasets(): Promise<CatalogDataset[]> {
  await delay();
  return MOCK_CATALOG;
}

export async function getDataset(name: string): Promise<CatalogDataset> {
  await delay();
  return findDataset(name);
}

export async function getDistinctValues(dataset: string, column: string): Promise<string[]> {
  await delay();
  const rows = MOCK_ROWS[dataset];
  if (!rows) {
    throw new MockApiError({
      code: 'UNKNOWN_DATASET',
      message: `Dataset "${dataset}" does not exist.`,
    });
  }
  const distinct = new Set<string>();
  for (const row of rows) {
    const v = row[column];
    if (v !== null && v !== undefined) distinct.add(safeString(v));
    if (distinct.size >= 200) break;
  }
  return Array.from(distinct).sort((a, b) => a.localeCompare(b));
}

export async function runQuery(
  def: ReportDefinition,
  opts?: { preview?: boolean; params?: Record<string, unknown> | undefined },
): Promise<QueryResult> {
  const start = Date.now();
  const params = opts?.params ?? {};
  const key = cacheKey(def, params);
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    await delay();
    return { ...cached.result, meta: { ...cached.result.meta, cached: true, durationMs: Date.now() - start } };
  }

  await delay();
  maybeThrow();

  const dataset = findDataset(def.dataset);
  const allRows = MOCK_ROWS[def.dataset] ?? [];
  const columnByName = new Map(dataset.columns.map((c) => [c.name, c]));

  const selected = def.columns.length ? def.columns : dataset.columns.map((c) => c.name);
  for (const col of selected) {
    if (!columnByName.has(col)) {
      throw new MockApiError({
        code: 'UNKNOWN_FIELD',
        message: `Column "${col}" does not exist on dataset "${def.dataset}".`,
        field: col,
        hint: 'Remove this column from the report.',
      });
    }
  }

  let engineResult;
  try {
    engineResult = runQueryEngine(allRows, dataset.columns, def, params);
  } catch (e) {
    if (e instanceof QueryEngineError) {
      throw new MockApiError(e.apiError);
    }
    throw e;
  }

  const projectedRows = engineResult.rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const col of selected) out[col] = row[col];
    return out;
  });

  const result: QueryResult = {
    rows: projectedRows,
    columns: selected.map((name) => {
      const c = columnByName.get(name);
      return { name, label: c?.label ?? name, type: c?.type ?? 'unknown' };
    }),
    meta: {
      rowCount: engineResult.truncated ? countMatched(allRows, dataset, def, params) : engineResult.rows.length,
      truncated: engineResult.truncated,
      cached: false,
      durationMs: Date.now() - start,
    },
  };

  queryCache.set(key, { at: Date.now(), result });
  return result;
}

function countMatched(
  allRows: Record<string, unknown>[],
  dataset: CatalogDataset,
  def: ReportDefinition,
  params: Record<string, unknown>,
): number {
  const unlimited: ReportDefinition = { ...def, limit: Number.MAX_SAFE_INTEGER };
  return runQueryEngine(allRows, dataset.columns, unlimited, params).rows.length;
}

export async function listReports(): Promise<SavedReport[]> {
  await delay();
  return storageListReports();
}

export async function getReport(id: string): Promise<SavedReport> {
  await delay();
  const report = storageGetReport(id);
  if (!report) {
    throw new MockApiError({ code: 'NOT_FOUND', message: `Report "${id}" was not found.` });
  }
  return report;
}

export async function saveReport(
  r: Omit<SavedReport, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<SavedReport> {
  await delay();
  return storageSaveReport(r);
}

export async function deleteReport(id: string): Promise<void> {
  await delay();
  storageDeleteReport(id);
}

export async function exportCsv(def: ReportDefinition): Promise<Blob> {
  await delay();
  const exportDef: ReportDefinition = { ...def, limit: 5000 };
  const result = await runQuery(exportDef, { preview: false });
  const header = result.columns.map((c) => csvEscape(c.label)).join(',');
  const lines = result.rows.map((row) =>
    result.columns.map((c) => csvEscape(formatCsvValue(row[c.name]))).join(','),
  );
  const csv = [header, ...lines].join('\r\n');
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

function formatCsvValue(v: unknown): string {
  return safeString(v);
}
