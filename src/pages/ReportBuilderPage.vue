<template>
  <q-page class="column">
    <q-linear-progress v-if="isFetching && !isLoading" indeterminate color="primary" size="2px" />
    <VisualizationRenderer
      class="col"
      :definition="store.report"
      :state="state"
      :rows="displayRows"
      :columns="query.data.value?.columns ?? []"
      :meta="meta"
      :error="apiError"
      @retry="refetch"
      @clear-filters="store.clearFilters()"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDefinitionStore } from '@/stores/definition';
import { useReportQuery } from '@/composables/useReportQuery';
import { sortRows } from '@/utils/sortRows';
import VisualizationRenderer from '@/components/viz/VisualizationRenderer.vue';
import type { PreviewState } from '@/types/ui';
import type { ApiError } from '@/types/report';

const store = useDefinitionStore();

const reportRef = computed(() => store.report);
const query = useReportQuery(reportRef);
const { isLoading, isFetching, isError, error, refetch } = query;

const apiError = computed<ApiError | undefined>(() => {
  if (!isError.value) return undefined;
  const e = error.value as unknown as { apiError?: ApiError };
  return e?.apiError ?? { code: 'UNKNOWN', message: 'Something went wrong.' };
});

const displayRows = computed(() => {
  const rows = query.data.value?.rows ?? [];
  const typeByField = new Map((query.data.value?.columns ?? []).map((c) => [c.name, c.type]));
  return sortRows(rows, store.report.sort, typeByField);
});

const meta = computed(() => {
  const m = query.data.value?.meta;
  if (!m) return undefined;
  return { ...m, limit: store.report.limit };
});

const state = computed<PreviewState>(() => {
  if (!store.isValid) return 'empty-unconfigured';
  if (isLoading.value) return 'loading';
  if (isError.value) return 'error';
  if (query.data.value && query.data.value.rows.length === 0) return 'empty-no-results';
  return 'ready';
});
</script>
