<template>
  <q-expansion-item dense-toggle class="filter-row q-mb-xs" default-opened>
    <template #header>
      <q-item-section>
        <q-chip dense square color="grey-3" text-color="grey-9" class="q-my-none">
          <q-icon :name="typeIcon(column.type)" size="14px" class="q-mr-xs" />
          {{ column.label }}: {{ summary }}
        </q-chip>
      </q-item-section>
      <q-item-section side>
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="close"
          :aria-label="`Remove filter on ${column.label}`"
          @click.stop="store.removeFilter(filter.id)"
        />
      </q-item-section>
    </template>

    <div class="q-px-md q-pb-sm q-pt-xs">
      <!-- multiSelect -->
      <q-select
        v-if="column.capabilities.filterUi === 'multiSelect'"
        :model-value="(filter.value as string[]) ?? []"
        :options="distinctValues ?? column.sampleValues ?? []"
        multiple
        use-chips
        dense
        outlined
        :aria-label="`Values for ${column.label}`"
        @update:model-value="(v: string[]) => store.updateFilter(filter.id, { op: 'in', value: v })"
      />

      <!-- textContains -->
      <q-input
        v-else-if="column.capabilities.filterUi === 'textContains'"
        :model-value="(filter.value as string) ?? ''"
        dense
        outlined
        clearable
        :placeholder="`Contains…`"
        :aria-label="`Text filter for ${column.label}`"
        @update:model-value="(v) => store.updateFilter(filter.id, { op: 'contains', value: v ?? '' })"
      />

      <!-- numberRange -->
      <div v-else-if="column.capabilities.filterUi === 'numberRange'" class="row q-gutter-sm">
        <q-input
          :model-value="numberRange[0]"
          type="number"
          dense
          outlined
          class="col"
          label="Min"
          :aria-label="`Minimum ${column.label}`"
          @update:model-value="(v) => setNumberRange(0, v)"
        />
        <q-input
          :model-value="numberRange[1]"
          type="number"
          dense
          outlined
          class="col"
          label="Max"
          :aria-label="`Maximum ${column.label}`"
          @update:model-value="(v) => setNumberRange(1, v)"
        />
      </div>

      <!-- dateRange -->
      <div v-else-if="column.capabilities.filterUi === 'dateRange'">
        <div class="row q-gutter-xs q-mb-sm">
          <q-chip
            v-for="preset in datePresets"
            :key="preset.value"
            clickable
            dense
            :color="filter.op === 'relative' && filter.value === preset.value ? 'primary' : 'grey-3'"
            :text-color="filter.op === 'relative' && filter.value === preset.value ? 'white' : 'grey-9'"
            @click="store.updateFilter(filter.id, { op: 'relative', value: preset.value })"
          >
            {{ preset.label }}
          </q-chip>
          <q-chip
            clickable
            dense
            :color="filter.op === 'between' ? 'primary' : 'grey-3'"
            :text-color="filter.op === 'between' ? 'white' : 'grey-9'"
            @click="store.updateFilter(filter.id, { op: 'between', value: ['', ''] })"
          >
            Custom
          </q-chip>
        </div>
        <q-input
          v-if="filter.op === 'between'"
          :model-value="customRangeLabel"
          dense
          outlined
          readonly
          label="Date range"
          :aria-label="`Date range for ${column.label}`"
        >
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date :model-value="dateRangeModel" range @update:model-value="onDateRangeChange" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <!-- booleanToggle -->
      <q-btn-toggle
        v-else-if="column.capabilities.filterUi === 'booleanToggle'"
        :model-value="booleanValue"
        dense
        no-caps
        toggle-color="primary"
        :options="[
          { label: 'Any', value: 'any' },
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ]"
        @update:model-value="onBooleanChange"
      />
    </div>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ref as vueRef } from 'vue';
import type { CatalogColumn } from '@/types/catalog';
import type { ReportFilter } from '@/types/report';
import { useDefinitionStore } from '@/stores/definition';
import { useDistinctValuesQuery } from '@/composables/useCatalog';
import { typeIcon } from '@/utils/typeIcons';
import { safeString } from '@/utils/safeString';

const props = defineProps<{ filter: ReportFilter; column: CatalogColumn }>();
const store = useDefinitionStore();

const datasetRef = vueRef(store.report.dataset);
const columnRef = vueRef(props.column.name);
const { data: distinctValues } = useDistinctValuesQuery(datasetRef, columnRef);

const datePresets = [
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'This month', value: 'thisMonth' },
  { label: 'Last month', value: 'lastMonth' },
  { label: 'This quarter', value: 'thisQuarter' },
];

const numberRange = computed<[number | null, number | null]>(() => {
  const v = props.filter.value as [number | null, number | null] | undefined;
  return v ?? [null, null];
});

function setNumberRange(idx: 0 | 1, raw: string | number | null) {
  const val = raw === '' || raw === null ? null : Number(raw);
  const next: [number | null, number | null] = [numberRange.value[0], numberRange.value[1]];
  next[idx] = val;
  store.updateFilter(props.filter.id, { op: 'between', value: next });
}

const dateRangeModel = computed(() => {
  const v = props.filter.value as [string, string] | undefined;
  if (!v || !v[0] || !v[1]) return null;
  return { from: v[0], to: v[1] };
});

const customRangeLabel = computed(() => {
  const v = props.filter.value as [string, string] | undefined;
  if (!v || !v[0] || !v[1]) return '';
  return `${v[0]} – ${v[1]}`;
});

function onDateRangeChange(v: { from: string; to: string } | string | null) {
  if (v && typeof v === 'object') {
    store.updateFilter(props.filter.id, { op: 'between', value: [v.from, v.to] });
  }
}

const booleanValue = computed(() => {
  if (props.filter.op === 'exists') return 'any';
  return props.filter.value ? 'yes' : 'no';
});

function onBooleanChange(v: 'any' | 'yes' | 'no') {
  if (v === 'any') store.updateFilter(props.filter.id, { op: 'exists', value: true });
  else store.updateFilter(props.filter.id, { op: 'eq', value: v === 'yes' });
}

const summary = computed(() => {
  const f = props.filter;
  switch (f.op) {
    case 'in': {
      const arr = (f.value as string[]) ?? [];
      return arr.length ? arr.join(', ') : 'any';
    }
    case 'contains':
      return f.value ? `"${f.value as string}"` : 'any';
    case 'between': {
      const [lo, hi] = (f.value as [unknown, unknown]) ?? [null, null];
      if (!lo && !hi) return 'any';
      return `${safeString(lo) || '…'} – ${safeString(hi) || '…'}`;
    }
    case 'relative': {
      const preset = datePresets.find((p) => p.value === f.value);
      return preset?.label ?? safeString(f.value);
    }
    case 'exists':
      return 'any';
    case 'eq':
      return f.value ? 'Yes' : 'No';
    default:
      return safeString(f.value);
  }
});
</script>

<style scoped lang="scss">
.filter-row {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
}
</style>
