import type { ColumnLabel } from '@/types/labels';

const STORAGE_KEY = 'rb:columnLabels';

type LabelMap = Record<string, Record<string, ColumnLabel>>; // dataset -> column -> label

function readAll(): LabelMap {
  if (typeof localStorage === 'undefined') return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as LabelMap) : {};
  } catch {
    return {};
  }
}

function writeAll(map: LabelMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function storageGetColumnLabels(dataset: string): Record<string, ColumnLabel> {
  return readAll()[dataset] ?? {};
}

export function storageSetColumnLabel(dataset: string, column: string, label: ColumnLabel): void {
  const all = readAll();
  const forDataset = { ...(all[dataset] ?? {}) };
  const merged: ColumnLabel = { ...forDataset[column], ...label };
  // Blank fields fall back to the catalog label rather than persisting "".
  if (!merged.en) delete merged.en;
  if (!merged.ar) delete merged.ar;

  if (Object.keys(merged).length === 0) {
    delete forDataset[column];
  } else {
    forDataset[column] = merged;
  }
  all[dataset] = forDataset;
  writeAll(all);
}
