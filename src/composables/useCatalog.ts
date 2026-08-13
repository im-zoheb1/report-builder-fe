import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { listDatasets, getDataset, getDistinctValues } from '@/api';

export function useDatasetsQuery() {
  return useQuery({
    queryKey: ['datasets'],
    queryFn: () => listDatasets(),
    staleTime: Infinity,
  });
}

export function useDatasetQuery(name: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ['dataset', name.value]),
    queryFn: () => getDataset(name.value),
    enabled: computed(() => name.value !== ''),
    staleTime: Infinity,
  });
}

export function useDistinctValuesQuery(dataset: Ref<string>, column: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ['distinctValues', dataset.value, column.value]),
    queryFn: () => getDistinctValues(dataset.value, column.value),
    enabled: computed(() => dataset.value !== '' && column.value !== ''),
    staleTime: 60000,
  });
}
