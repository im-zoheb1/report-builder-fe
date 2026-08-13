<template>
  <div>
    <div class="text-overline text-grey q-mb-sm">Filters</div>

    <FilterRow
      v-for="filter in store.report.filters"
      :key="filter.id"
      :filter="filter"
      :column="columnByName.get(filter.field)!"
    />

    <q-select
      v-if="addingFilter"
      :model-value="null"
      :options="fieldOptions"
      dense
      outlined
      autofocus
      emit-value
      map-options
      label="Filter on…"
      class="q-mt-xs"
      aria-label="Choose column to filter"
      @update:model-value="onPickField"
      @blur="addingFilter = false"
    />
    <q-btn
      v-else
      flat
      dense
      no-caps
      size="sm"
      icon="add"
      label="Add filter"
      :disable="!fieldOptions.length"
      @click="addingFilter = true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDefinitionStore } from '@/stores/definition';
import FilterRow from '@/components/builder/FilterRow.vue';

const store = useDefinitionStore();
const addingFilter = ref(false);

const columnByName = computed(() => new Map((store.datasetCatalog?.columns ?? []).map((c) => [c.name, c])));

const fieldOptions = computed(() =>
  store.filterableColumns
    .filter((c) => !store.report.filters.some((f) => f.field === c.name))
    .map((c) => ({ label: c.label, value: c.name })),
);

function defaultFilterFor(fieldName: string) {
  const col = columnByName.value.get(fieldName);
  const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  switch (col?.capabilities.filterUi) {
    case 'multiSelect':
      return { id, field: fieldName, op: 'in' as const, value: [] };
    case 'textContains':
      return { id, field: fieldName, op: 'contains' as const, value: '' };
    case 'numberRange':
      return { id, field: fieldName, op: 'between' as const, value: [null, null] };
    case 'dateRange':
      return { id, field: fieldName, op: 'relative' as const, value: 'last30days' };
    case 'booleanToggle':
      return { id, field: fieldName, op: 'exists' as const, value: true };
    default:
      return { id, field: fieldName, op: 'exists' as const, value: true };
  }
}

function onPickField(fieldName: string) {
  store.addFilter(defaultFilterFor(fieldName));
  addingFilter.value = false;
}
</script>
