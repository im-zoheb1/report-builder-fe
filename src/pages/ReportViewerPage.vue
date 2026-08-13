<template>
  <q-page class="column">
    <div v-if="report" class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="col">
          <div class="text-h6">{{ report.name }}</div>
          <div v-if="report.description" class="text-caption text-grey">{{ report.description }}</div>
        </div>

        <q-input
          v-for="param in report.definition.parameters ?? []"
          :key="param.key"
          :model-value="paramValues[param.key] as string"
          dense
          outlined
          readonly
          style="max-width: 180px"
          :label="param.key"
          :aria-label="param.key"
        >
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="paramValues[param.key] as string"
                  @update:model-value="(v) => setParam(param.key, v)"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-btn flat dense round icon="refresh" aria-label="Refresh" @click="() => refetch()" />
        <q-btn flat dense no-caps icon="download" label="Export CSV" @click="onExport" />
        <q-btn unelevated color="primary" no-caps icon="edit" label="Edit" @click="router.push(`/reports/${report.id}/edit`)" />
      </div>
    </div>

    <VisualizationRenderer
      class="col"
      :definition="report?.definition ?? emptyDefinition"
      :state="state"
      :rows="displayRows"
      :columns="activeQuery.data.value?.columns ?? []"
      :meta="meta"
      :error="apiError"
      @retry="refetch"
      @clear-filters="() => {}"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useQuery } from '@tanstack/vue-query';
import { getReport, exportCsv } from '@/api';
import { useReportQuery } from '@/composables/useReportQuery';
import { sortRows } from '@/utils/sortRows';
import VisualizationRenderer from '@/components/viz/VisualizationRenderer.vue';
import type { ReportDefinition, ApiError } from '@/types/report';
import type { PreviewState } from '@/types/ui';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const id = computed(() => route.params.id as string);

const { data: report } = useQuery({
  queryKey: computed(() => ['report', id.value]),
  queryFn: () => getReport(id.value),
});

const emptyDefinition: ReportDefinition = {
  dataset: '',
  visualization: 'table',
  columns: [],
  filters: [],
  sort: [],
  limit: 100,
};

const paramValues = ref<Record<string, unknown>>({});
watchEffect(() => {
  if (!report.value) return;
  const values: Record<string, unknown> = {};
  for (const p of report.value.definition.parameters ?? []) {
    values[p.key] = p.default;
  }
  paramValues.value = values;
});

function setParam(key: string, value: unknown) {
  paramValues.value = { ...paramValues.value, [key]: value };
}

const definitionRef = computed(() => report.value?.definition ?? emptyDefinition);
const activeQuery = useReportQuery(definitionRef, paramValues);
const { isLoading, isError, error, refetch } = activeQuery;

const apiError = computed<ApiError | undefined>(() => {
  if (!isError.value) return undefined;
  const e = error.value as unknown as { apiError?: ApiError };
  return e?.apiError ?? { code: 'UNKNOWN', message: 'Something went wrong.' };
});

const displayRows = computed(() => {
  const rows = activeQuery.data.value?.rows ?? [];
  const typeByField = new Map((activeQuery.data.value?.columns ?? []).map((c) => [c.name, c.type]));
  return sortRows(rows, definitionRef.value.sort, typeByField);
});

const meta = computed(() => {
  const m = activeQuery.data.value?.meta;
  if (!m) return undefined;
  return { ...m, limit: definitionRef.value.limit };
});

const state = computed<PreviewState>(() => {
  if (!report.value || definitionRef.value.dataset === '') return 'empty-unconfigured';
  if (isLoading.value) return 'loading';
  if (isError.value) return 'error';
  if (activeQuery.data.value && activeQuery.data.value.rows.length === 0) return 'empty-no-results';
  return 'ready';
});

async function onExport() {
  if (!report.value) return;
  try {
    const blob = await exportCsv(report.value.definition);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.value.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to export CSV.' });
  }
}
</script>
