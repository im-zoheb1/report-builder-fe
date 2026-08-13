export type ColumnType = 'string' | 'number' | 'date' | 'timestamp' | 'boolean' | 'geo' | 'unknown';

export type Aggregation = 'count' | 'sum' | 'avg' | 'min' | 'max';

export type FilterUi = 'multiSelect' | 'textContains' | 'numberRange' | 'dateRange' | 'booleanToggle' | 'none';

export interface CatalogColumn {
  name: string;
  label: string;
  type: ColumnType;
  nullable: boolean;
  cardinality?: number;
  sampleValues?: string[];
  stats?: { min?: number; max?: number; avg?: number };
  capabilities: {
    selectable: boolean;
    groupable: boolean;
    aggregations: Aggregation[];
    filterUi: FilterUi;
    chartRole?: 'dimension' | 'measure';
    mapRole?: 'marker' | 'path';
  };
}

export interface CatalogDataset {
  name: string;
  label: string;
  space: string;
  description?: string;
  rowCountEstimate: number;
  columns: CatalogColumn[];
}
