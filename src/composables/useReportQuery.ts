import { ref, computed, type Ref } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { useQuery } from '@tanstack/vue-query';
import { runQuery } from '@/api';
import type { ReportDefinition } from '@/types/report';

// Sort and column *order* are deliberately excluded from the query key: they're
// applied client-side against the cached result (see sortRows / column reorder),
// so changing them never triggers a refetch or loading flicker.
function keyPayload(def: ReportDefinition) {
  return {
    dataset: def.dataset,
    columns: [...def.columns].sort(),
    filters: def.filters,
    limit: def.limit,
  };
}

// definition is the live Pinia store proxy, not a plain object — structuredClone()
// on a reactive Proxy can throw DataCloneError, so clone via JSON (ReportDefinition
// is JSON-safe data by design, the same shape persisted to localStorage/mock API).
function cloneDefinition(def: ReportDefinition): ReportDefinition {
  return JSON.parse(JSON.stringify(def)) as ReportDefinition;
}

export function useReportQuery(definition: Ref<ReportDefinition>, params?: Ref<Record<string, unknown>>) {
  const debounced = ref<ReportDefinition>(cloneDefinition(definition.value)) as Ref<ReportDefinition>;

  watchDebounced(
    definition,
    (val) => {
      debounced.value = cloneDefinition(val);
    },
    { debounce: 400, deep: true, immediate: true },
  );

  const isValid = computed(() => debounced.value.dataset !== '' && debounced.value.columns.length > 0);

  const queryKey = computed(() => [
    'runQuery',
    JSON.stringify(keyPayload(debounced.value)),
    JSON.stringify(params?.value ?? {}),
  ]);

  const query = useQuery({
    queryKey,
    queryFn: () => runQuery(debounced.value, { params: params?.value }),
    enabled: isValid,
    retry: false,
  });

  return { ...query, debouncedDefinition: debounced };
}
