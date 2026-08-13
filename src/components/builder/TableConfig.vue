<template>
  <div class="q-pa-md">
    <div class="text-overline text-grey q-mb-sm">Columns</div>
    <div v-if="!columns.length" class="text-caption text-grey q-mb-md">
      Select columns from the Data panel.
    </div>
    <draggable
      v-else
      :model-value="columns"
      item-key="name"
      class="q-mb-md"
      handle=".drag-handle"
      @update:model-value="onReorder"
    >
      <template #item="{ element }">
        <q-item dense class="q-px-none">
          <q-item-section avatar class="drag-handle cursor-move" style="min-width: 24px">
            <q-icon name="drag_indicator" color="grey-6" />
          </q-item-section>
          <q-item-section>{{ element.label }}</q-item-section>
          <q-item-section side>
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="close"
              :aria-label="`Remove ${element.label}`"
              @click="store.toggleColumn(element.name)"
            />
          </q-item-section>
        </q-item>
      </template>
    </draggable>

    <q-separator class="q-mb-md" />

    <div class="text-overline text-grey q-mb-sm">Sort</div>
    <div v-for="(s, idx) in store.report.sort" :key="s.field" class="row items-center q-gutter-xs q-mb-xs">
      <q-select
        :model-value="s.field"
        :options="sortableColumnOptions"
        dense
        outlined
        emit-value
        map-options
        class="col"
        :aria-label="'Sort field ' + (idx + 1)"
        @update:model-value="(v: string) => updateSortField(idx, v)"
      />
      <q-btn-toggle
        :model-value="s.dir"
        dense
        no-caps
        toggle-color="primary"
        :options="[
          { label: 'Asc', value: 'asc' },
          { label: 'Desc', value: 'desc' },
        ]"
        @update:model-value="(v: 'asc' | 'desc') => updateSortDir(idx, v)"
      />
      <q-btn flat round dense size="sm" icon="close" aria-label="Remove sort" @click="store.removeSort(s.field)" />
    </div>
    <q-btn
      flat
      dense
      no-caps
      size="sm"
      icon="add"
      label="Add sort"
      :disable="!availableSortFields.length"
      @click="addSort"
    />

    <q-separator class="q-my-md" />

    <div class="text-overline text-grey q-mb-sm">Row limit</div>
    <q-select
      :model-value="store.report.limit"
      :options="[50, 100, 500, 1000]"
      dense
      outlined
      emit-value
      map-options
      aria-label="Row limit"
      @update:model-value="(v: number) => store.setLimit(v)"
    />

    <q-separator class="q-my-md" />

    <FilterBuilder />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import draggable from 'vuedraggable';
import { useDefinitionStore } from '@/stores/definition';
import FilterBuilder from '@/components/builder/FilterBuilder.vue';
import type { CatalogColumn } from '@/types/catalog';

const store = useDefinitionStore();

const columns = computed<CatalogColumn[]>(() => store.selectedColumnDefs);

function onReorder(newList: CatalogColumn[]) {
  store.reorderColumns(newList.map((c) => c.name));
}

const sortableColumnOptions = computed(() =>
  columns.value.map((c) => ({ label: c.label, value: c.name })),
);

const availableSortFields = computed(() =>
  columns.value.filter((c) => !store.report.sort.some((s) => s.field === c.name)),
);

function addSort() {
  const next = availableSortFields.value[0];
  if (next) store.addSort({ field: next.name, dir: 'asc' });
}

function updateSortField(idx: number, field: string) {
  const current = store.report.sort[idx];
  if (!current) return;
  const next = [...store.report.sort];
  next[idx] = { field, dir: current.dir };
  store.setSort(next);
}

function updateSortDir(idx: number, dir: 'asc' | 'desc') {
  const current = store.report.sort[idx];
  if (!current) return;
  const next = [...store.report.sort];
  next[idx] = { field: current.field, dir };
  store.setSort(next);
}
</script>
