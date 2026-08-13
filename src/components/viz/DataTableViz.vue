<template>
  <div class="column full-height">
    <div v-if="state === 'empty-unconfigured'" class="col flex flex-center text-grey column">
      <q-icon name="table_chart" size="48px" class="q-mb-sm" />
      <div class="text-subtitle1">Pick a dataset to get started</div>
      <div class="text-caption">Choose a dataset and columns from the Data panel on the left.</div>
    </div>

    <div v-else-if="state === 'loading'" class="col q-pa-md">
      <div v-for="i in 8" :key="i" class="row q-gutter-md q-mb-sm">
        <q-skeleton v-for="j in skeletonCols" :key="j" type="text" class="col" />
      </div>
    </div>

    <div v-else-if="state === 'error'" class="col q-pa-md">
      <q-banner class="bg-red-1 text-red-9" rounded>
        <template #avatar><q-icon name="error" color="negative" /></template>
        <div class="text-weight-medium">{{ error?.message ?? 'Something went wrong.' }}</div>
        <div v-if="error?.hint" class="text-caption q-mt-xs">{{ error.hint }}</div>
        <template #action>
          <q-btn flat color="negative" label="Retry" @click="emit('retry')" />
        </template>
      </q-banner>
    </div>

    <div v-else-if="state === 'empty-no-results'" class="col flex flex-center text-grey column">
      <q-icon name="search_off" size="48px" class="q-mb-sm" />
      <div class="text-subtitle1">No rows match your filters</div>
      <q-btn flat no-caps color="primary" label="Clear filters" class="q-mt-sm" @click="emit('clear-filters')" />
    </div>

    <template v-else>
      <q-table
        class="col sticky-header-table"
        flat
        bordered
        dense
        virtual-scroll
        :rows="indexedRows"
        :columns="qColumns"
        row-key="__rowKey"
        :rows-per-page-options="[0]"
        :pagination="{ rowsPerPage: 0 }"
      >
        <template #body-cell="cellProps">
          <q-td :props="cellProps" :class="cellAlignClass(cellProps.col)">
            <template v-if="cellProps.value === null || cellProps.value === undefined">
              <span class="text-grey">—</span>
            </template>
            <template v-else-if="cellProps.col.__type === 'boolean'">
              <q-icon
                :name="cellProps.value ? 'check_circle' : 'cancel'"
                :color="cellProps.value ? 'positive' : 'grey-5'"
                size="18px"
              />
            </template>
            <template v-else-if="cellProps.col.__type === 'number'">
              {{ formatNumber(cellProps.value) }}
            </template>
            <template v-else-if="cellProps.col.__type === 'date' || cellProps.col.__type === 'timestamp'">
              {{ formatDate(cellProps.value) }}
              <q-tooltip>{{ relativeTime(cellProps.value) }}</q-tooltip>
            </template>
            <template v-else>
              {{ cellProps.value }}
            </template>
          </q-td>
        </template>
      </q-table>

      <div class="row items-center q-px-md q-py-xs text-caption text-grey meta-bar">
        <q-banner v-if="meta?.truncated" dense class="bg-orange-1 text-orange-9 full-width q-mb-xs" rounded>
          Showing first {{ rows.length }} of ~{{ meta.rowCount.toLocaleString() }} rows
        </q-banner>
        <span v-if="meta">
          {{ rows.length.toLocaleString() }} rows
          <span v-if="meta.truncated"> · preview limited to {{ meta.limit }}</span>
          · {{ Math.round(meta.durationMs) }} ms
          <span v-if="meta.cached"> · cached</span>
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { QTableColumn } from 'quasar';
import type { VizProps } from '@/types/ui';
import { formatNumber, formatDate, relativeTime } from '@/utils/format';

const props = defineProps<VizProps>();
const emit = defineEmits<{ retry: []; 'clear-filters': [] }>();

const skeletonCols = computed(() => Math.max(props.columns.length, 4));

interface Col extends QTableColumn {
  __type: string;
}

const qColumns = computed<Col[]>(() =>
  props.columns.map((c) => ({
    name: c.name,
    label: c.label,
    field: c.name,
    align: c.type === 'number' ? 'right' : 'left',
    sortable: false,
    __type: c.type,
  })),
);

const indexedRows = computed(() => props.rows.map((r, i) => ({ ...r, __rowKey: i })));

function cellAlignClass(col: Col) {
  return col.__type === 'number' ? 'text-right' : '';
}
</script>

<style scoped lang="scss">
.sticky-header-table {
  :deep(thead tr th) {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: white;
  }
}

:global(body.body--dark) .sticky-header-table {
  :deep(thead tr th) {
    background-color: var(--q-dark-page);
  }
}

.meta-bar {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
