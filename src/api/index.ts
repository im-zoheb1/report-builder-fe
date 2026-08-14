// Public API contract. Everything downstream (composables, components) imports
// from here, never from `./mock` directly. Swapping the mock layer for real
// HTTP calls means changing only this file's implementation, not its exports.
export {
  listDatasets,
  getDataset,
  getDistinctValues,
  runQuery,
  listReports,
  getReport,
  saveReport,
  deleteReport,
  exportCsv,
  getColumnLabels,
  setColumnLabel,
} from './mock/api';
