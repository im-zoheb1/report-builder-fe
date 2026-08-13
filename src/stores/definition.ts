import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CatalogDataset, CatalogColumn } from '@/types/catalog';
import type { ReportDefinition, ReportFilter, ReportSort, SavedReport } from '@/types/report';

function emptyDefinition(): ReportDefinition {
  return {
    dataset: '',
    visualization: 'table',
    columns: [],
    filters: [],
    sort: [],
    limit: 100,
  };
}

interface DraftMeta {
  id?: string;
  name: string;
  description?: string;
}

function snapshotOf(def: ReportDefinition, meta: DraftMeta): string {
  return JSON.stringify({ def, meta });
}

export const useDefinitionStore = defineStore('definition', () => {
  const report = ref<ReportDefinition>(emptyDefinition());
  const meta = ref<DraftMeta>({ name: 'Untitled Report' });
  const datasetCatalog = ref<CatalogDataset | null>(null);
  const initialSnapshot = ref<string>(snapshotOf(report.value, meta.value));

  const isValid = computed(() => report.value.dataset !== '' && report.value.columns.length > 0);

  const isDirty = computed(() => snapshotOf(report.value, meta.value) !== initialSnapshot.value);

  const filterableColumns = computed<CatalogColumn[]>(
    () => datasetCatalog.value?.columns.filter((c) => c.capabilities.filterUi !== 'none') ?? [],
  );

  const selectedColumnDefs = computed<CatalogColumn[]>(() => {
    const cols = datasetCatalog.value?.columns ?? [];
    const byName = new Map(cols.map((c) => [c.name, c]));
    return report.value.columns.map((name) => byName.get(name)).filter((c): c is CatalogColumn => !!c);
  });

  function setDataset(name: string) {
    report.value = {
      ...emptyDefinition(),
      dataset: name,
    };
  }

  function setDatasetCatalog(ds: CatalogDataset | null) {
    datasetCatalog.value = ds;
  }

  function toggleColumn(name: string) {
    const idx = report.value.columns.indexOf(name);
    if (idx === -1) report.value.columns.push(name);
    else report.value.columns.splice(idx, 1);
  }

  function selectAllColumns(names: string[]) {
    report.value.columns = [...names];
  }

  function clearColumns() {
    report.value.columns = [];
  }

  function reorderColumns(newOrder: string[]) {
    report.value.columns = [...newOrder];
  }

  function addFilter(filter: ReportFilter) {
    report.value.filters.push(filter);
  }

  function updateFilter(id: string, patch: Partial<ReportFilter>) {
    const f = report.value.filters.find((x) => x.id === id);
    if (f) Object.assign(f, patch);
  }

  function removeFilter(id: string) {
    report.value.filters = report.value.filters.filter((f) => f.id !== id);
  }

  function clearFilters() {
    report.value.filters = [];
  }

  function setSort(sorts: ReportSort[]) {
    report.value.sort = [...sorts];
  }

  function addSort(sort: ReportSort) {
    report.value.sort.push(sort);
  }

  function removeSort(field: string) {
    report.value.sort = report.value.sort.filter((s) => s.field !== field);
  }

  function setLimit(n: number) {
    report.value.limit = n;
  }

  function setName(name: string) {
    meta.value.name = name;
  }

  function setDescription(description: string) {
    meta.value.description = description;
  }

  function reset() {
    report.value = emptyDefinition();
    meta.value = { name: 'Untitled Report' };
    datasetCatalog.value = null;
    initialSnapshot.value = snapshotOf(report.value, meta.value);
  }

  function loadReport(saved: SavedReport) {
    report.value = structuredClone(saved.definition);
    const m: DraftMeta = { id: saved.id, name: saved.name };
    if (saved.description !== undefined) m.description = saved.description;
    meta.value = m;
    initialSnapshot.value = snapshotOf(report.value, meta.value);
  }

  function markSaved(saved: SavedReport) {
    const m: DraftMeta = { id: saved.id, name: saved.name };
    if (saved.description !== undefined) m.description = saved.description;
    meta.value = m;
    initialSnapshot.value = snapshotOf(report.value, meta.value);
  }

  return {
    report,
    meta,
    datasetCatalog,
    isValid,
    isDirty,
    filterableColumns,
    selectedColumnDefs,
    setDataset,
    setDatasetCatalog,
    toggleColumn,
    selectAllColumns,
    clearColumns,
    reorderColumns,
    addFilter,
    updateFilter,
    removeFilter,
    clearFilters,
    setSort,
    addSort,
    removeSort,
    setLimit,
    setName,
    setDescription,
    reset,
    loadReport,
    markSaved,
  };
});
