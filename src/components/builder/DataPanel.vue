<template>
  <div class="q-pa-md">
    <div class="text-overline text-grey q-mb-sm">Data</div>

    <q-select
      v-model="selectedDataset"
      :options="filteredOptions"
      option-value="value"
      option-label="label"
      emit-value
      map-options
      use-input
      options-dense
      dense
      outlined
      clearable
      label="Dataset"
      aria-label="Dataset"
      @filter="onFilter"
    >
      <template #option="scope">
        <q-item-label v-if="scope.opt.isGroup" header class="text-weight-bold text-grey">
          {{ scope.opt.label }}
        </q-item-label>
        <q-item v-else v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label caption>~{{ scope.opt.rowCount?.toLocaleString() }} rows</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <div v-if="!store.report.dataset" class="text-grey text-caption q-mt-md">
      Pick a dataset to see its columns.
    </div>

    <template v-else>
      <q-input
        v-model="columnSearch"
        dense
        outlined
        clearable
        class="q-mt-md"
        placeholder="Search columns"
        aria-label="Search columns"
      >
        <template #prepend><q-icon name="search" /></template>
      </q-input>

      <div class="row items-center justify-between q-mt-sm q-mb-xs">
        <q-btn flat dense no-caps size="sm" label="Select all" :disable="!filteredColumns.length" @click="selectAll" />
        <q-btn flat dense no-caps size="sm" label="Clear" :disable="!store.report.columns.length" @click="store.clearColumns()" />
      </div>

      <q-virtual-scroll v-if="filteredColumns.length > 40" style="max-height: 60vh" :items="filteredColumns" separator>
        <template #default="{ item }">
          <ColumnListItem :column="item" />
        </template>
      </q-virtual-scroll>
      <q-list v-else separator>
        <ColumnListItem v-for="col in filteredColumns" :key="col.name" :column="col" />
      </q-list>

      <div v-if="!filteredColumns.length" class="text-grey text-caption q-mt-md">No columns match "{{ columnSearch }}".</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useDefinitionStore } from '@/stores/definition';
import { useDatasetsQuery } from '@/composables/useCatalog';
import ColumnListItem from '@/components/builder/ColumnListItem.vue';

const $q = useQuasar();
const store = useDefinitionStore();
const { data: datasets } = useDatasetsQuery();

interface DatasetOption {
  label: string;
  value?: string;
  rowCount?: number;
  isGroup?: boolean;
}

const allOptions = computed<DatasetOption[]>(() => {
  const opts: DatasetOption[] = [];
  const bySpace = new Map<string, typeof datasets.value>();
  for (const ds of datasets.value ?? []) {
    const list = bySpace.get(ds.space) ?? [];
    list.push(ds);
    bySpace.set(ds.space, list);
  }
  for (const [space, list] of bySpace) {
    opts.push({ label: space, isGroup: true });
    for (const ds of list ?? []) {
      opts.push({ label: ds.label, value: ds.name, rowCount: ds.rowCountEstimate });
    }
  }
  return opts;
});

const filteredOptions = ref<DatasetOption[]>([]);

function onFilter(val: string, update: (cb: () => void) => void) {
  update(() => {
    if (!val) {
      filteredOptions.value = allOptions.value;
      return;
    }
    const needle = val.toLowerCase();
    filteredOptions.value = allOptions.value.filter((o) => o.isGroup || o.label.toLowerCase().includes(needle));
  });
}
filteredOptions.value = allOptions.value;

const selectedDataset = computed({
  get: () => store.report.dataset || null,
  set: (value: string | null) => {
    const next = value ?? '';
    if (!next) {
      store.reset();
      return;
    }
    const hasConfig = store.report.columns.length > 0 || store.report.filters.length > 0 || store.report.sort.length > 0;
    if (store.report.dataset && store.report.dataset !== next && hasConfig) {
      $q.dialog({
        title: 'Switch dataset?',
        message: 'Changing the dataset will reset your selected columns, filters and sort.',
        persistent: true,
        ok: { label: 'Switch', color: 'primary' },
        cancel: { label: 'Cancel', flat: true },
      }).onOk(() => store.setDataset(next));
      return;
    }
    store.setDataset(next);
  },
});

const columnSearch = ref('');
const filteredColumns = computed(() => {
  const cols = store.datasetCatalog?.columns ?? [];
  if (!columnSearch.value) return cols;
  const needle = columnSearch.value.toLowerCase();
  return cols.filter((c) => c.name.toLowerCase().includes(needle) || c.label.toLowerCase().includes(needle));
});

function selectAll() {
  store.selectAllColumns(filteredColumns.value.map((c) => c.name));
}
</script>
