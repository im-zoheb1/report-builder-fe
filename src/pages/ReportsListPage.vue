<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Reports</div>
      <q-space />
      <q-btn unelevated color="primary" no-caps icon="add" label="New Report" @click="router.push('/reports/new')" />
    </div>

    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-input
        v-model="search"
        dense
        outlined
        clearable
        style="min-width: 260px"
        placeholder="Search reports"
        aria-label="Search reports"
      >
        <template #prepend><q-icon name="search" /></template>
      </q-input>

      <q-chip
        v-for="ds in datasetNames"
        :key="ds"
        clickable
        dense
        :color="datasetFilter === ds ? 'primary' : 'grey-3'"
        :text-color="datasetFilter === ds ? 'white' : 'grey-9'"
        @click="datasetFilter = datasetFilter === ds ? null : ds"
      >
        {{ ds }}
      </q-chip>
    </div>

    <div v-if="isLoading" class="row q-col-gutter-md">
      <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-md-4">
        <q-skeleton height="140px" square />
      </div>
    </div>

    <div v-else-if="!filteredReports.length" class="column items-center text-grey q-mt-xl">
      <q-icon name="description" size="64px" class="q-mb-md" />
      <div class="text-subtitle1">No reports yet</div>
      <div class="text-caption q-mb-md">Build your first table report from any dataset.</div>
      <q-btn unelevated color="primary" no-caps label="New Report" @click="router.push('/reports/new')" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="report in filteredReports" :key="report.id" class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="cursor-pointer full-height" @click="router.push(`/reports/${report.id}`)">
          <q-card-section>
            <div class="row items-start no-wrap">
              <div class="col text-subtitle1 ellipsis">{{ report.name }}</div>
              <q-btn flat round dense size="sm" icon="more_vert" aria-label="Report actions" @click.stop>
                <q-menu>
                  <q-list dense style="min-width: 140px">
                    <q-item clickable v-close-popup @click="router.push(`/reports/${report.id}/edit`)">
                      <q-item-section>Open</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="duplicate(report)">
                      <q-item-section>Duplicate</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup class="text-negative" @click="confirmDelete(report)">
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
            <q-chip dense square color="grey-3" text-color="grey-9" class="q-mt-xs">
              {{ report.definition.dataset }}
            </q-chip>
            <div class="text-caption text-grey q-mt-sm">
              {{ report.definition.columns.length }} columns · updated {{ relativeTime(report.updatedAt) }}
            </div>
            <div v-if="report.description" class="text-caption q-mt-xs ellipsis-2-lines">
              {{ report.description }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { listReports, deleteReport, saveReport } from '@/api';
import type { SavedReport } from '@/types/report';
import { relativeTime } from '@/utils/format';

const router = useRouter();
const $q = useQuasar();
const queryClient = useQueryClient();

const { data: reports, isLoading } = useQuery({
  queryKey: ['reports'],
  queryFn: () => listReports(),
});

const search = ref('');
const datasetFilter = ref<string | null>(null);

const datasetNames = computed(() => {
  const set = new Set((reports.value ?? []).map((r) => r.definition.dataset));
  return Array.from(set).sort();
});

const filteredReports = computed(() => {
  let list = reports.value ?? [];
  if (datasetFilter.value) list = list.filter((r) => r.definition.dataset === datasetFilter.value);
  if (search.value) {
    const needle = search.value.toLowerCase();
    list = list.filter((r) => r.name.toLowerCase().includes(needle));
  }
  return list;
});

async function duplicate(report: SavedReport) {
  const payload: Parameters<typeof saveReport>[0] = {
    name: `${report.name} (Copy)`,
    definition: structuredClone(report.definition),
  };
  if (report.description !== undefined) payload.description = report.description;
  await saveReport(payload);
  await queryClient.invalidateQueries({ queryKey: ['reports'] });
  $q.notify({ type: 'positive', message: 'Report duplicated.' });
}

function confirmDelete(report: SavedReport) {
  $q.dialog({
    title: 'Delete report?',
    message: `"${report.name}" will be permanently deleted.`,
    persistent: true,
    ok: { label: 'Delete', color: 'negative' },
    cancel: { label: 'Cancel', flat: true },
  }).onOk(() => {
    void (async () => {
      await deleteReport(report.id);
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
      $q.notify({ type: 'positive', message: 'Report deleted.' });
    })();
  });
}
</script>

<style scoped lang="scss">
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
